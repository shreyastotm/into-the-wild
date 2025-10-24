import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, Shield, CreditCard } from "lucide-react";
import { IdProofVerification } from "@/components/admin/IdProofVerification";

type RegistrationWithUser = {
  registration_id: number;
  trek_id: number;
  user_id: string;
  payment_status: string | null;
  payment_proof_url: string | null;
  booking_datetime?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  registrant_name?: string | null;
  registrant_phone?: string | null;
  users?: {
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
};

export default function EventRegistrations() {
  const [statusFilter, setStatusFilter] = useState<string>("ProofUploaded");
  const [trekIdFilter, setTrekIdFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("payments");
  const [rows, setRows] = useState<RegistrationWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal state
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationWithUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const statuses = useMemo(
    () => ["ProofUploaded", "Pending", "Approved", "Rejected"],
    [],
  );

  async function fetchRegistrations() {
    setLoading(true);
    try {
      // Try with new columns first
      let query = supabase.from("trek_registrations").select(`
          registration_id,
          trek_id,
          user_id,
          payment_status,
          payment_proof_url,
          booking_datetime,
          verified_by,
          verified_at,
          rejection_reason,
          registrant_name,
          registrant_phone,
          users:user_id (
            full_name,
            email,
            phone_number
          )
        `);

      if (statusFilter) {
        query = query.in("payment_status", [statusFilter]);
      }
      if (trekIdFilter) {
        query = query.eq("trek_id", Number(trekIdFilter));
      }

      const { data, error } = await query.order("booking_datetime", {
        ascending: false,
      });

      if (error) {
        console.error("Supabase query error:", error);
        // If new columns don't exist, try fallback query
        if (
          error.message.includes("registrant_name") ||
          error.message.includes("registrant_phone")
        ) {
          console.log("Falling back to query without new columns...");
          const fallbackQuery = supabase.from("trek_registrations").select(`
              registration_id,
              trek_id,
              user_id,
              payment_status,
              payment_proof_url,
              booking_datetime,
              verified_by,
              verified_at,
              rejection_reason,
              users:user_id (
                full_name,
                email,
                phone_number
              )
            `);

          if (statusFilter) {
            fallbackQuery.in("payment_status", [statusFilter]);
          }
          if (trekIdFilter) {
            fallbackQuery.eq("trek_id", Number(trekIdFilter));
          }

          const { data: fallbackData, error: fallbackError } =
            await fallbackQuery.order("booking_datetime", { ascending: false });

          if (fallbackError) {
            throw fallbackError;
          }

          // Add null values for missing columns
          const fallbackRows = (fallbackData || []).map((row) => ({
            ...row,
            registrant_name: null,
            registrant_phone: null,
          }));

          setRows(fallbackRows as RegistrationWithUser[]);
          return;
        }
        throw error;
      }

      setRows((data as RegistrationWithUser[]) || []);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to load registrations";
      console.error("Fetch registrations error:", error);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, trekIdFilter]);

  function openModal(registration: RegistrationWithUser) {
    setSelectedRegistration(registration);
    setRejectReason("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedRegistration(null);
    setRejectReason("");
  }

  async function approve(registration_id: number) {
    setActionLoadingId(registration_id);
    try {
      const { error } = await supabase.rpc("approve_registration", {
        registration_id_param: registration_id,
      });
      if (error) throw error;
      toast({
        title: "Approved",
        description: `Registration #${registration_id} approved.`,
      });
      closeModal();
      await fetchRegistrations();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Approve failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function reject(registration_id: number, reason: string) {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    setActionLoadingId(registration_id);
    try {
      const { error } = await supabase.rpc("reject_registration", {
        registration_id_param: registration_id,
        reason_param: reason,
      });
      if (error) throw error;
      toast({
        title: "Rejected",
        description: `Registration #${registration_id} rejected.`,
      });
      closeModal();
      await fetchRegistrations();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Reject failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  }

  function getStatusBadge(status: string | null) {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "ProofUploaded":
        return (
          <Badge className="bg-blue-100 text-blue-800">Proof Uploaded</Badge>
        );
      case "Pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  }

  return (
    <>
      <Card className="py-6 sm:py-8">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            Event Registrations Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Verification
              </TabsTrigger>
              <TabsTrigger
                value="id-management"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                ID Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payments">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Trek ID"
                  value={trekIdFilter}
                  onChange={(e) => setTrekIdFilter(e.target.value)}
                  className="w-full sm:w-40"
                />
                <Button
                  variant="outline"
                  onClick={fetchRegistrations}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Refresh
                </Button>
              </div>

              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading registrations...
                  </div>
                ) : rows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations found
                  </div>
                ) : (
                  rows.map((r) => (
                    <div
                      key={r.registration_id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">
                            Registration #{r.registration_id}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Trek ID: {r.trek_id}
                          </p>
                        </div>
                        {getStatusBadge(r.payment_status)}
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground mb-3">
                        <div className="flex justify-between">
                          <span>User Name:</span>
                          <span className="font-medium">
                            {r.users?.full_name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="truncate ml-2">
                            {r.users?.email || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payer Name:</span>
                          <span className="font-medium">
                            {r.registrant_name || "Not provided"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payer Phone:</span>
                          <span>{r.registrant_phone || "Not provided"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {r.payment_proof_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal(r)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Proof
                          </Button>
                        ) : (
                          <div className="flex-1 text-center text-muted-foreground text-sm py-2">
                            No proof
                          </div>
                        )}

                        {r.payment_proof_url &&
                          r.payment_status === "ProofUploaded" && (
                            <Button
                              size="sm"
                              onClick={() => openModal(r)}
                              disabled={actionLoadingId === r.registration_id}
                              className="flex-1"
                            >
                              Review
                            </Button>
                          )}
                        {r.payment_status === "Approved" && (
                          <div className="flex-1 text-center text-green-600 text-sm py-2">
                            ✓ Verified
                          </div>
                        )}
                        {r.payment_status === "Rejected" && (
                          <div className="flex-1 text-center text-red-600 text-sm py-2">
                            ✗ Rejected
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg ID</TableHead>
                      <TableHead>Trek ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>User Email</TableHead>
                      <TableHead>Registrant Name</TableHead>
                      <TableHead>Registrant Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Loading registrations...
                        </TableCell>
                      </TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No registrations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r) => (
                        <TableRow key={r.registration_id}>
                          <TableCell className="font-medium">
                            #{r.registration_id}
                          </TableCell>
                          <TableCell>{r.trek_id}</TableCell>
                          <TableCell>{r.users?.full_name || "N/A"}</TableCell>
                          <TableCell className="text-sm">
                            {r.users?.email || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.registrant_name || "Not provided"}
                          </TableCell>
                          <TableCell>
                            {r.registrant_phone || "Not provided"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(r.payment_status)}
                          </TableCell>
                          <TableCell>
                            {r.payment_proof_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openModal(r)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No proof
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {r.payment_proof_url &&
                              r.payment_status === "ProofUploaded" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openModal(r)}
                                    disabled={
                                      actionLoadingId === r.registration_id
                                    }
                                  >
                                    Review
                                  </Button>
                                </div>
                              )}
                            {r.payment_status === "Approved" && (
                              <span className="text-green-600 text-sm">
                                ✓ Verified
                              </span>
                            )}
                            {r.payment_status === "Rejected" && (
                              <span className="text-red-600 text-sm">
                                ✗ Rejected
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="id-management">
              <IdProofVerification
                onVerificationComplete={() => {
                  // Refresh data if needed
                  fetchRegistrations();
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Proof Review Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Payment Proof - Registration #
              {selectedRegistration?.registration_id}
            </DialogTitle>
            <DialogDescription>
              Verify the payment details before approving the registration
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* User Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 dark:bg-muted/20 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Account Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedRegistration.users?.full_name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedRegistration.users?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedRegistration.users?.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Payment Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Payer Name:</span>{" "}
                      {selectedRegistration.registrant_name || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Payer Phone:</span>{" "}
                      {selectedRegistration.registrant_phone || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Trek ID:</span>{" "}
                      {selectedRegistration.trek_id}
                    </p>
                    <p>
                      <span className="font-medium">Booking Date:</span>{" "}
                      {selectedRegistration.booking_datetime
                        ? new Date(
                            selectedRegistration.booking_datetime,
                          ).toLocaleDateString("en-IN")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Proof Image */}
              {selectedRegistration.payment_proof_url ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Payment Proof
                  </h4>
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/50 dark:bg-muted/30">
                    <img
                      src={selectedRegistration.payment_proof_url}
                      alt="Payment Proof"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <a
                    href={selectedRegistration.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open in new tab →
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment proof uploaded
                </div>
              )}

              {/* Rejection Reason Input */}
              {selectedRegistration.payment_status === "ProofUploaded" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Rejection Reason (if rejecting)
                  </label>
                  <Input
                    placeholder="Enter reason if you want to reject this registration"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}

              {/* Previous Rejection Reason (if rejected) */}
              {selectedRegistration.payment_status === "Rejected" &&
                selectedRegistration.rejection_reason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700">
                      {selectedRegistration.rejection_reason}
                    </p>
                  </div>
                )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            {selectedRegistration?.payment_status === "ProofUploaded" &&
              selectedRegistration.payment_proof_url && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      selectedRegistration &&
                      reject(selectedRegistration.registration_id, rejectReason)
                    }
                    disabled={
                      actionLoadingId ===
                        selectedRegistration.registration_id ||
                      !rejectReason.trim()
                    }
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() =>
                      selectedRegistration &&
                      approve(selectedRegistration.registration_id)
                    }
                    disabled={
                      actionLoadingId === selectedRegistration.registration_id
                    }
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Payment
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
