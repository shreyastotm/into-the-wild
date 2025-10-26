import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  DollarSign,
  Package,
  Star,
  Tent,
  Users,
} from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { TentRequestsAdmin } from "@/components/admin/TentRequestsAdmin";
import { useAuth } from "@/components/auth/AuthProvider";
import TrekCostsManager from "@/components/trek/TrekCostsManager";
import { TrekDiscussion } from "@/components/trek/TrekDiscussion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
// Lazy load TravelCoordination to prevent Leaflet side effects during module loading
const TravelCoordination = React.lazy(() => import("@/components/trek/TravelCoordination"));

// Define a more flexible interface to handle field name variations
interface TrekEvent {
  trek_id: number;
  trek_name?: string;
  name?: string;
  start_datetime: string;
  end_datetime?: string;
  description?: string | null;
  duration?: string;
  difficulty?: string;
  category?: string;
  cost?: number;
  base_price?: number;
  max_participants?: number;
  image_url?: string | null;
  transport_mode?: string | null;
  pickup_time_window?: string | null;
  cancellation_policy?: string | null;
  is_finalized?: boolean;
  destination_latitude?: number;
  destination_longitude?: number;
  created_at?: string;
  updated_at?: string;
  event_type?: string;
  [key: string]: unknown; // Allow any extra fields
}

// Simplify participant structure
interface Participant {
  registration_id?: number;
  user_id: string;
  booking_datetime?: string;
  payment_status?: string;
  payment_proof_url?: string | null;
  indemnity_agreed_at?: string | null;
  userData?: {
    full_name?: string;
    name?: string;
    email?: string;
    phone_number?: string;
  };
}

export default function AdminTrekDetails() {
  const { userProfile, loading: authLoading } = useAuth();
  const { trekId } = useParams<{ trekId: string }>();
  const [trek, setTrek] = useState<TrekEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trekId) {
      fetchTrekDetails(parseInt(trekId));
      fetchParticipants(parseInt(trekId));
    }
  }, [trekId]);

  const fetchTrekDetails = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("trek_events")
        .select("*")
        .eq("trek_id", id)
        .single();

      if (error) throw error;

      // Type assertion to avoid property access errors
      const trekData = data as Record<string, unknown>;

      // Normalize field names - ensures required fields are present
      const normalizedData: TrekEvent = {
        trek_id: trekData.trek_id,
        trek_name:
          trekData.trek_name || trekData.name || `Trek ${trekData.trek_id}`,
        start_datetime: trekData.start_datetime,
        duration: trekData.duration || "Not specified",
        cost: trekData.cost || trekData.base_price || 0,
        max_participants: trekData.max_participants || 0,
        image_url: trekData.image_url || null,
        transport_mode: trekData.transport_mode || null,
        pickup_time_window: trekData.pickup_time_window || null,
        cancellation_policy: trekData.cancellation_policy || null,
        description: trekData.description || null,
        ...trekData, // Keep all original fields too
      };

      setTrek(normalizedData);
    } catch (error) {
      console.error("Error fetching trek details:", error);
      toast({
        title: "Error",
        description: "Could not load trek details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (id: number) => {
    try {
      // Safer approach that avoids complex type issues
      // First fetch registrations
      let registrationsData: Array<Record<string, unknown>> = [];
      try {
        const { data, error } = await supabase
          .from("trek_registrations")
          .select("registration_id, user_id, booking_datetime, payment_status, payment_proof_url, indemnity_agreed_at")
        .eq("trek_id", id)
          .order("booking_datetime", { ascending: false });

        if (!error && data) {
          registrationsData = data;
        }
      } catch (regError) {
        console.error("Error fetching registrations:", regError);
      }

      if (registrationsData.length === 0) {
        setParticipants([]);
        return;
      }

      // Extract user IDs from valid registrations
      const userIds = registrationsData
        .filter((reg) => reg && typeof reg === "object" && "user_id" in reg)
        .map((reg) => reg.user_id)
        .filter(Boolean) as any;

      if (userIds.length === 0) {
        // Create participants with registration data only
        const basicParticipants = registrationsData.map((reg) => ({
          user_id: reg.user_id || "unknown",
          registration_id: reg.registration_id,
          booking_datetime: reg.booking_datetime,
          payment_status: reg.payment_status,
          payment_proof_url: reg.payment_proof_url,
          indemnity_agreed_at: reg.indemnity_agreed_at,
          userData: { full_name: "Unknown User" },
        }));
        setParticipants(basicParticipants);
        return;
      }

      // Fetch user details
      let usersData: Array<Record<string, unknown>> = [];
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name, name, email, phone_number")
          .in("user_id", userIds);

        if (!error && data) {
          usersData = data;
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
      }

      // Combine data safely
      const combinedParticipants = registrationsData.map((reg) => {
        const userId = reg?.user_id;
        const userDetail = userId
          ? usersData.find((u) => u?.user_id === userId)
          : null;

        return {
          user_id: userId || "unknown",
          registration_id: reg?.registration_id,
          booking_datetime: reg?.booking_datetime,
          payment_status: reg?.payment_status,
          payment_proof_url: reg?.payment_proof_url,
          indemnity_agreed_at: reg?.indemnity_agreed_at,
          userData: userDetail
            ? {
                full_name: userDetail.full_name || userDetail.name || "N/A",
                email: userDetail.email || "N/A",
                phone_number: userDetail.phone_number || "N/A",
              }
            : {
                full_name: "Unknown User",
                email: "N/A",
                phone_number: "N/A",
              },
        };
      });

      setParticipants(combinedParticipants);
    } catch (error) {
      console.error("Error processing participants fetch:", error);
      toast({
        title: "Error",
        description: "Could not load participant details",
        variant: "destructive",
      });
      setParticipants([]);
    }
  };

  const handleVerifyPayment = async (registrationId: number) => {
    if (!trekId) return;
    try {
      const { error } = await supabase
        .from("trek_registrations")
        .update({
          payment_status: "Paid",
          payment_verified_at: new Date().toISOString(),
        })
        .eq("registration_id", registrationId) as any;

      if (error) throw error;

      toast({
        title: "Payment Verified",
        description: `Registration ID ${registrationId} marked as Paid.`,
      });
      fetchParticipants(parseInt(trekId)); // Refresh participant list
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Could not update payment status.";
      console.error("Error verifying payment:", error);
      toast({
        title: "Error Verifying Payment",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Allow access only to admins
  if (authLoading) {
    return <div className="max-w-3xl mx-auto p-6">Loading...</div>;
  }

  if (!authLoading && (!userProfile || userProfile.user_type !== "admin")) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="mb-4">Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin">
          <Button variant="ghost" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Trek Management</h1>
        <div className="w-24" /> {/* Spacer for balance */}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading trek details...</div>
      ) : !trek ? (
        <div className="text-center py-12 text-red-500">
          Trek not found. The event may have been deleted.
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="bg-primary/5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{trek.trek_name}</CardTitle>
                  <CardDescription>
                    Trek ID: {trek.trek_id} |{" "}
                    {trek.transport_mode
                      ? `Transport: ${trek.transport_mode}`
                      : "No transport"}{" "}
                    | Participants: {participants.length}/
                    {trek.max_participants}
                  </CardDescription>
                </div>
                <Link to={`/trek-events/${trek.trek_id}`} target="_blank">
                  <Button variant="outline" size="sm">
                    View Public Page
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="border p-4 rounded-md">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Start Date
                  </div>
                  <div className="flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-2 text-green-600" />
                    <span>{format(new Date(trek.start_datetime), "PPP")}</span>
                  </div>
                </div>
                <div className="border p-4 rounded-md">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Duration
                  </div>
                  <div className="flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-2 text-purple-600" />
                    <span>{trek.duration}</span>
                  </div>
                </div>
                <div className="border p-4 rounded-md">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Cost
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    <span>₹{trek.cost}</span>
                  </div>
                </div>
              </div>

              {trek.description && (
                <div className="border p-4 rounded-md mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Description
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {trek.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="participants">
            <TabsList className="mb-6">
              <TabsTrigger value="participants">
                <Users className="h-4 w-4 mr-2" /> Participants
              </TabsTrigger>
              <TabsTrigger value="transport">
                <Car className="h-4 w-4 mr-2" /> Transport
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <DollarSign className="h-4 w-4 mr-2" /> Expenses
              </TabsTrigger>
              <TabsTrigger value="packing">
                <Package className="h-4 w-4 mr-2" /> Packing
              </TabsTrigger>
              <TabsTrigger value="ratings">
                <Star className="h-4 w-4 mr-2" /> Ratings
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <Users className="h-4 w-4 mr-2" /> Discussion
              </TabsTrigger>
            {trek.event_type === "camping" && (
                <TabsTrigger value="tent-requests">
                  <Tent className="h-4 w-4 mr-2" /> Tent Requests
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" /> Registered Participants
                  </CardTitle>
                  <CardDescription>
                    {participants.length} of {trek.max_participants} slots
                    filled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No participants registered yet
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="py-3 px-4 text-left font-semibold">
                              Name
                            </th>
                            <th className="py-3 px-4 text-left font-semibold">
                              Email
                            </th>
                            <th className="py-3 px-4 text-left font-semibold">
                              Registered At
                            </th>
                            <th className="py-3 px-4 text-left font-semibold">
                              Status
                            </th>
                            <th className="py-3 px-4 text-left font-semibold">
                              Proof
                            </th>
                            <th className="py-3 px-4 text-left font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant, index) => (
                            <tr
                              key={
                                participant.registration_id ||
                                participant.user_id
                              }
                              className={`border-b ${index % 2 === 0 ? "" : "bg-muted/50"}`}
                            >
                              <td className="py-2 px-4">
                                {participant.userData?.full_name ||
                                  participant.userData?.name ||
                                  "Unknown"}
                              </td>
                              <td className="py-2 px-4">
                                {participant.userData?.email || "N/A"}
                              </td>
                              <td className="py-2 px-4">
                                {participant.booking_datetime
                                  ? format(
                                      new Date(participant.booking_datetime),
                                      "PPpp",
                                    )
                                  : "N/A"}
                              </td>
                              <td className="py-2 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    participant.payment_status === "Paid"
                                      ? "bg-green-100 text-green-800"
                                      : participant.payment_status ===
                                          "Cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : participant.payment_status ===
                                            "ProofUploaded"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-yellow-100 text-yellow-800" // Pending or other
                                  }`}
                                >
                                  {participant.payment_status}
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                {participant.payment_proof_url ? (
                                  <a
                                    href={participant.payment_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Proof
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {(participant.payment_status ===
                                  "ProofUploaded" ||
                                  (participant.payment_status === "Pending" &&
                                    participant.payment_proof_url)) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      participant.registration_id &&
                                      handleVerifyPayment(
                                        participant.registration_id,
                                      )
                                    }
                                    disabled={!participant.registration_id}
                                  >
                                    Verify Payment
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transport">
              <Suspense fallback={<div className="p-4 text-center">Loading transport coordination...</div>}>
              <TravelCoordination
                transportMode={trek.transport_mode}
                pickupTimeWindow={trek.pickup_time_window}
                vendorContacts={trek.vendor_contacts}
                isAdmin
              />
              </Suspense>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" /> Expense Management
                  </CardTitle>
                  <CardDescription>
                    Manage fixed costs and participant expenses for this trek
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrekCostsManager trekId={parseInt(trekId)} isAdmin />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" /> Packing List Management
                  </CardTitle>
                  <CardDescription>
                    Manage trek-specific packing items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Packing list management coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ratings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" /> Ratings & Reviews
                  </CardTitle>
                  <CardDescription>
                    View and manage participant ratings and reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Ratings management coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" /> Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrekDiscussion
                    trekId={trekId || ""}
                    // These props might need adjustment based on how AdminTrekDetails handles comments
                    // For now, assuming it does not manage comments directly in this component
                    comments={[]}
                    onAddComment={async (content: string) => {
                      // TODO: Implement admin comment functionality
                      return false;
                    }}
                    isLoading={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {trek.event_type === "camping" && (
              <TabsContent value="tent-requests">
                <TentRequestsAdmin eventId={trek.trek_id} />
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
}
