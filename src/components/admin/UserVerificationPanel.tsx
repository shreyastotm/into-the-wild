import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableHead,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { UserProfile } from "@/components/auth/AuthProvider";
import { UserVerificationStatus } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Upload, Shield, Clock } from "lucide-react";

// Helper function to determine user's verification level
const getUserVerificationLevel = (
  user: UserProfile,
): "auto" | "quick" | "full" => {
  if (user.verification_status !== "VERIFIED") return "auto";

  const docs = user.verification_docs;
  if (docs?.aadhaar?.front_url && docs?.secondary_id?.front_url) {
    return "full";
  } else if (docs?.aadhaar?.front_url) {
    return "quick";
  }
  return "auto";
};

const getVerificationLevelInfo = (level: "auto" | "quick" | "full") => {
  switch (level) {
    case "auto":
      return {
        name: "Auto-Verified",
        description: "Basic verification for community access",
        icon: <CheckCircle className="h-4 w-4 text-success" />,
        color: "green",
        bgClass: "bg-success/10 border-success/20",
        badgeClass: "bg-success text-white",
      };
    case "quick":
      return {
        name: "Quick Verification",
        description: "Aadhaar verified for most treks",
        icon: <Upload className="h-4 w-4 text-info" />,
        color: "blue",
        bgClass: "bg-info/10 border-info/20",
        badgeClass: "bg-info text-white",
      };
    case "full":
      return {
        name: "Full Verification",
        description: "Complete verification for all treks",
        icon: <Shield className="h-4 w-4 text-accent" />,
        color: "purple",
        bgClass: "bg-accent/10 border-accent/20",
        badgeClass: "bg-accent text-white",
      };
    default:
      return {
        name: "Not Verified",
        description: "Verification required",
        icon: <Clock className="h-4 w-4 text-muted-foreground" />,
        color: "gray",
        bgClass: "bg-muted/30 border-muted-foreground/20",
        badgeClass: "bg-muted text-muted-foreground",
      };
  }
};

export default function UserVerificationPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [verificationStatusFilter, setVerificationStatusFilter] =
    useState<string>("all");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      let query = supabase.from("users").select("*");

      if (userTypeFilter !== "all") {
        const validTypes = ["admin", "micro_community", "trekker"];
        if (validTypes.includes(userTypeFilter)) {
          query = query.eq("user_type", userTypeFilter);
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      if (verificationStatusFilter !== "all") {
        query = query.eq("verification_status", verificationStatusFilter);
      }

      const { data, error } = await query;
      const validTypes = ["admin", "micro_community", "trekker"];
      const filtered = (data || []).filter(
        (u) => u.user_type && validTypes.includes(u.user_type),
      );
      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUsers(filtered as UserProfile[]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [userTypeFilter, verificationStatusFilter]);

  async function handleVerify(userId: string) {
    const { error } = await supabase
      .from("users")
      .update({ verification_status: "VERIFIED" as UserVerificationStatus })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error verifying user",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "User verified" });
      setUsers((users) =>
        users.map((u) =>
          u.user_id === userId
            ? {
                ...u,
                verification_status: "VERIFIED" as UserVerificationStatus,
              }
            : u,
        ),
      );
    }
  }

  async function handleReject(userId: string) {
    const { error } = await supabase
      .from("users")
      .update({ verification_status: "REJECTED" as UserVerificationStatus })
      .eq("user_id", userId);
    if (error) {
      toast({
        title: "Error rejecting user",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "User rejected" });
      setUsers((users) =>
        users.map((u) =>
          u.user_id === userId
            ? {
                ...u,
                verification_status: "REJECTED" as UserVerificationStatus,
              }
            : u,
        ),
      );
    }
  }

  async function promoteToAdmin(email: string) {
    const { error } = await supabase
      .from("users")
      .update({
        user_type: "admin",
        verification_status: "VERIFIED" as UserVerificationStatus,
      })
      .eq("email", email);
    if (error) {
      toast({
        title: "Error promoting user",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "User promoted to admin" });
      setUsers((users) => users.filter((u) => u.email !== email));
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4" data-testid="userverificationpanel">
      <h2 className="text-2xl font-bold mb-6">User Verification Management</h2>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center flex-wrap" data-testid="userverificationpanel">
        <div className="flex items-center gap-2" data-testid="userverificationpanel">
          <label htmlFor="userTypeFilter" className="font-medium">
            User Type:
          </label>
          <select
            id="userTypeFilter"
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="border-2 border-input bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 dark:focus:ring-primary/30"
          >
            <option value="micro_community">Micro-Community</option>
            <option value="admin">Admin</option>
            <option value="trekker">Trekker</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex items-center gap-2" data-testid="userverificationpanel">
          <label htmlFor="verificationStatusFilter" className="font-medium">
            Verification Status:
          </label>
          <Select
            value={verificationStatusFilter}
            onValueChange={setVerificationStatusFilter}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-card/80 dark:bg-card/60" data-testid="userverificationpanel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Verification Tier</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const userLevel = getUserVerificationLevel(user);
                const levelInfo = getVerificationLevelInfo(userLevel);

                return (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.user_type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" data-testid="userverificationpanel">
                        {levelInfo.icon}
                        <div data-testid="userverificationpanel">
                          <Badge className={levelInfo.badgeClass}>
                            {levelInfo.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {levelInfo.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.verification_docs?.aadhaar?.front_url && (
                        <div className="space-x-2" data-testid="userverificationpanel">
                          <a
                            href={user.verification_docs.aadhaar.front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Aadhaar Front
                          </a>
                          {user.verification_docs.aadhaar.back_url && (
                            <a
                              href={user.verification_docs.aadhaar.back_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Back
                            </a>
                          )}
                        </div>
                      )}
                      {user.verification_docs?.secondary_id?.front_url && (
                        <div className="space-x-2 mt-1" data-testid="userverificationpanel">
                          <span className="text-sm text-muted-foreground">
                            {user.verification_docs.secondary_id.type}:
                          </span>
                          <a
                            href={user.verification_docs.secondary_id.front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Front
                          </a>
                          {user.verification_docs.secondary_id.back_url && (
                            <a
                              href={
                                user.verification_docs.secondary_id.back_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Back
                            </a>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2" data-testid="userverificationpanel">
                        {user.verification_status === "PENDING_REVIEW" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(user.user_id)}
                            >
                              Verify
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(user.user_id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {user.verification_status === "REJECTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(user.user_id)}
                          >
                            Re-verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
