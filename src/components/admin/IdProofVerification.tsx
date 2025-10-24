import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface IdType {
  id_type_id: number;
  name: string;
  display_name: string;
}

interface RegistrationIdProof {
  proof_id: number;
  registration_id: number;
  id_type_id: number;
  proof_url: string;
  uploaded_by: string;
  uploaded_at: string;
  verified_by: string | null;
  verified_at: string | null;
  verification_status: string;
  admin_notes: string | null;
  id_type?: IdType;
  registrant_name?: string;
  trek_name?: string;
}

interface IdProofVerificationProps {
  trekId?: number;
  registrationId?: number;
  onVerificationComplete?: () => void;
}

export const IdProofVerification: React.FC<IdProofVerificationProps> = ({
  trekId,
  registrationId,
  onVerificationComplete,
}) => {
  const [proofs, setProofs] = useState<RegistrationIdProof[]>([]);
  const [idTypes, setIdTypes] = useState<IdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [selectedProof, setSelectedProof] =
    useState<RegistrationIdProof | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadIdTypes();
    loadProofs();
  }, [trekId, registrationId]);

  const loadIdTypes = async () => {
    try {
      const { dataid_types } = await supabase
        .from(''*'')
        .select("*")
        .eq("is_active", true)
        .order("display_name") as any;

      if (error) {
        console.error("Error loading ID types:", error);
        return;
      }

      setIdTypes(data || []);
    } catch (error) {
      console.error("Error loading ID types:", error);
    }
  };

  const loadProofs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("registration_id_proofs")
        .select(
          `
          *,
          id_types!inner(*),
          trek_registrations!inner(
            registration_id,
            registrant_name,
            trek_events!inner(name)
          )
        `,
        )
        .eq("verification_status", "pending")
        .order("uploaded_at", { ascending: false }) as any;

      if (trekId) {
        query = query.eq("trek_registrations.trek_id", trekId);
      }

      if (registrationId) {
        query = query.eq("registration_id", registrationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading proofs:", error);
        return;
      }

      const formattedProofs = (data || []).map((proof) => ({
        ...proof,
        id_type: proof.id_types,
        registrant_name: proof.trek_registrations?.registrant_name,
        trek_name: proof.trek_registrations?.trek_events?.name,
      }));

      setProofs(formattedProofs);
    } catch (error) {
      console.error("Error loading proofs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (
    proofId: number,
    status: "approved" | "rejected",
    notes?: string,
  ) => {
    setVerifying(proofId);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to verify proofs",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("registration_id_proofs")
        .update({
          verification_status: status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          admin_notes: notes || null,
        })
        .eq("proof_id", proofId) as any;

      if (error) {
        throw error;
      }

      toast({
        title: "Verification Complete",
        description: `ID proof has been ${status}`,
      });

      await loadProofs();
      onVerificationComplete?.();
    } catch (error) {
      console.error("Error verifying proof:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" data-testid="idproofverification">
        <div className="h-4 bg-muted rounded w-3/4" data-testid="idproofverification"></div>
        <div className="h-32 bg-muted rounded" data-testid="idproofverification"></div>
      </div>
    );
  }

  if (proofs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            No Pending Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All ID proofs have been verified or there are no pending
            verifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="idproofverification">
      <Card>
        <CardHeader>
          <CardTitle>ID Proof Verification</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and verify uploaded ID proofs for trek registrations
          </p>
        </CardHeader>
      </Card>

      {proofs.map((proof) => (
        <Card key={proof.proof_id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between" data-testid="idproofverification">
              <div data-testid="idproofverification">
                <CardTitle className="text-lg">
                  {proof.id_type?.display_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {proof.registrant_name} for {proof.trek_name}
                </p>
              </div>
              {getStatusBadge(proof.verification_status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-2" data-testid="idproofverification">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(proof.proof_url, "_blank")}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Document
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = proof.proof_url;
                  link.download = `id_proof_${proof.proof_id}`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            <div className="text-sm text-muted-foreground" data-testid="idproofverification">
              <p>
                Uploaded: {new Date(proof.uploaded_at).toLocaleDateString()}
              </p>
              <p>Proof ID: {proof.proof_id}</p>
            </div>

            {proof.verification_status === "pending" && (
              <div className="space-y-3 border-t pt-3" data-testid="idproofverification">
                <div data-testid="idproofverification">
                  <Label htmlFor={`notes-${proof.proof_id}`}>
                    Verification Notes (Optional)
                  </Label>
                  <Textarea
                    id={`notes-${proof.proof_id}`}
                    placeholder="Add notes about this verification..."
                    value={
                      selectedProof?.proof_id === proof.proof_id
                        ? adminNotes
                        : ""
                    }
                    onChange={(e) => {
                      setSelectedProof(proof);
                      setAdminNotes(e.target.value);
                    }}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2" data-testid="idproofverification">
                  <Button
                    onClick={() =>
                      handleVerification(
                        proof.proof_id,
                        "approved",
                        selectedProof?.proof_id === proof.proof_id
                          ? adminNotes
                          : undefined,
                      )
                    }
                    disabled={verifying === proof.proof_id}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleVerification(
                        proof.proof_id,
                        "rejected",
                        selectedProof?.proof_id === proof.proof_id
                          ? adminNotes
                          : undefined,
                      )
                    }
                    disabled={verifying === proof.proof_id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {proof.verification_status === "rejected" && proof.admin_notes && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive-foreground">
                  <strong>Rejection Reason:</strong> {proof.admin_notes}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
