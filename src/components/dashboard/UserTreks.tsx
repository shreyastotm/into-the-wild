import { formatIndianDate } from '@/utils/indianStandards';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";


interface TrekRegistration {
  trek_id: number;
  trek_name: string;
  start_datetime: string;
  payment_status: string;
  cost: number;
  category: string | null;
  location: { name?: string } | null;
  participant_count: number | null;
  max_participants: number;
  isPast: boolean;
  image_url?: string | null;
}

export const UserTreks = () => {
  const [trekRegistrations, setTrekRegistrations] = useState<
    TrekRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);
  const itemsPerPage = 10; // Show 10 treks per page

  const fetchUserTrekRegistrations = useCallback(async (currentUser: typeof user, page: number = 1) => {
    // ✅ Prevent concurrent calls
    if (isFetchingRef.current) {
      return;
    }

    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoading(true);

      const userId = currentUser.id
        ? typeof currentUser.id === "string"
          ? currentUser.id
          : String(currentUser.id)
        : "";

      // ✅ PAGINATED: Get user's trek registrations with pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from("trek_registrations")
        .select("*", { count: 'exact' })
        .eq("user_id", userId)
        .range(from, to)
        .order("created_at", { ascending: false }) as any;
      if (error) throw error;
      if (data && data.length > 0) {
        // Fetch trek event details for all trek_ids
        type RawRegistration = { trek_id: number; [key: string]: unknown };
        type MappedTrek = {
          trek_id: number;
          name: string;
          start_datetime: string;
          base_price: number;
          category: string | null;
          location: { name?: string } | null;
          max_participants: number;
          image_url: string | null;
          status: string | null;
        };

        const trekIds = data.map((reg: RawRegistration) => reg.trek_id);

        // ✅ OPTIMIZED: Add LIMIT and better filtering to prevent 144kB payload
        // Only fetch treks that are relevant to the user and limit results
        const { data: trekEvents, error: trekEventsError } = await supabase
        .from("trek_events")
        .select(
            "trek_id, name, start_datetime, base_price, category, location, max_participants, image_url, status",
          )
        .in("trek_id", trekIds)
        .limit(50) // ✅ LIMIT to prevent massive data loads
        .order("start_datetime", { ascending: false }) as any;
        if (trekEventsError) throw trekEventsError;
        const trekMap = (trekEvents || []).reduce(
          (acc, trek) => {
            acc[trek.trek_id] = trek;
            return acc;
          },
          {} as Record<number, MappedTrek>,
        );
        const now = new Date();
        const transformedData = data
          .map((reg: RawRegistration) => {
            const trekData = trekMap[reg.trek_id];
            if (!trekData) {
              return null; // Mark for removal
            }
            const startDate = new Date(trekData.start_datetime);
            // Consider a trek as "past" if it's either:
            // 1. The start date has passed, OR
            // 2. The status is COMPLETED or ARCHIVED
            const isPast =
              startDate < now ||
              trekData.status === "Completed" ||
              trekData.status === "Archived";
            return {
              ...reg,
              trek_name: trekData.name,
              start_datetime: trekData.start_datetime,
              cost: trekData.base_price ?? 0,
              category: trekData.category ?? null,
              location: trekData.location ?? null,
              max_participants: trekData.max_participants ?? 0,
              isPast,
              image_url: trekData.image_url || null,
            };
          })
          .filter(Boolean) as TrekRegistration[]; // Filter out the nulls

        // ✅ PAGINATION: Update total pages based on count
        const totalPages = Math.ceil((count || 0) / itemsPerPage);
        setTotalPages(totalPages);
        setCurrentPage(page);

        setTrekRegistrations(transformedData);
      } else {
        setTrekRegistrations([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load trek registrations";
      toast({
        title: "Error loading your treks",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching user registrations:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [itemsPerPage]); // ✅ DEPEND ON itemsPerPage for pagination

  useEffect(() => {
    if (user) {
      // ✅ Only call if not already fetching
      if (!isFetchingRef.current) {
        fetchUserTrekRegistrations(user, currentPage);
    }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentPage]); // ✅ DEPEND ON user.id and currentPage

  const goToTrekDetails = useCallback((trekId: number) => {
    navigate(`/trek-events/${trekId}`);
  }, [navigate]);

  // ✅ MEMOIZE: Separate upcoming and past treks to prevent unnecessary recalculations
  const upcomingTreks = useMemo(() =>
    trekRegistrations.filter((reg) => !reg.isPast),
    [trekRegistrations]
  );

  const pastTreks = useMemo(() =>
    trekRegistrations.filter((reg) => reg.isPast),
    [trekRegistrations]
  );

  // ✅ PAGINATION: Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  // ✅ MEMOIZE: Render function to prevent unnecessary re-renders (MOVED TO TOP!)
  const renderTrekCard = useCallback((trek: TrekRegistration) => {
    let startDate: Date;
    try {
      startDate = toZonedTime(new Date(trek.start_datetime), "Asia/Kolkata");
      if (isNaN(startDate.getTime())) throw new Error("Invalid date");
    } catch {
      console.error("Invalid trek start_datetime:", trek);
      // Fallback: show 'Invalid date' in UI instead of crashing
      return (
        <Card
          key={trek.trek_id}
          className="mb-4 hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{trek.trek_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600" data-testid="usertreks">Invalid date value</div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        key={trek.trek_id}
        className="mb-4 hover:shadow-md transition-shadow"
      >
        {/* Trek Image Display */}
        {trek.image_url && (
          <img
            src={trek.image_url}
            alt={trek.trek_name}
            className="w-full h-40 object-cover border-b border-gray-200 rounded-t"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start" data-testid="usertreks">
            <CardTitle className="text-lg">{trek.trek_name}</CardTitle>
            {trek.payment_status === "Confirmed" && (
              <div className="flex items-center text-green-600 text-sm" data-testid="usertreks">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirmed
              </div>
            )}
            {trek.payment_status === "Pending" && (
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs" data-testid="usertreks">
                Payment Pending
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm" data-testid="usertreks">
            <div className="flex items-center" data-testid="usertreks">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatIndianDate(startDate)}</span>
            </div>
            <div className="flex items-center" data-testid="usertreks">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(startDate, "h:mm a")} IST</span>
            </div>
            <div className="flex items-center" data-testid="usertreks">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {trek.participant_count}/{trek.max_participants} participants
              </span>
            </div>
            {trek.location && (
              <div className="flex items-center" data-testid="usertreks">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {trek.location.name || "Location details available"}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center" data-testid="usertreks">
            <div className="font-bold" data-testid="usertreks">{formatCurrency(trek.cost, "INR")}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToTrekDetails(trek.trek_id)}
              className="ml-auto"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [goToTrekDetails]);

  if (loading) {
    return (
      <div className="space-y-4" data-testid="usertreks">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="usertreks">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trekRegistrations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="mb-4 text-muted-foreground">
            You haven't registered for any treks yet
          </p>
          <Button onClick={() => navigate("/trek-events")}>
            Find Treks to Join
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="upcoming">
          Upcoming Treks ({upcomingTreks.length})
        </TabsTrigger>
        <TabsTrigger value="past">Past Treks ({pastTreks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcomingTreks.length > 0 ? (
          <div data-testid="usertreks">{upcomingTreks.map(renderTrekCard)}</div>
        ) : (
          <div className="text-center py-6" data-testid="usertreks">
            <p className="text-muted-foreground mb-4">
              You have no upcoming treks
            </p>
            <Button onClick={() => navigate("/trek-events")}>
              Find Treks to Join
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {pastTreks.length > 0 ? (
          <div data-testid="usertreks">{pastTreks.map(renderTrekCard)}</div>
        ) : (
          <div className="text-center py-6" data-testid="usertreks">
            <p className="text-muted-foreground">You have no past treks</p>
          </div>
        )}
      </TabsContent>
    </Tabs>

      {/* ✅ PAGINATION: Add pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* Show first page, current page area, and last page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant={1 === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                {currentPage > 4 && <span className="px-2">...</span>}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                <Button
                  variant={totalPages === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
