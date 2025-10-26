import { useCallback, useEffect, useState } from "react";

import { TrekEvent, useTrekEventDetails } from "./useTrekEventDetails";

import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import {
  convertDbRecordToStringIds,
  supabase,
  WithStringId,
} from "@/integrations/supabase/client";

interface DbRegistration {
  registration_id: number;
  trek_id: number;
  user_id: string;
  booking_datetime: string;
  payment_status: "Pending" | "Paid" | "Cancelled" | "ProofUploaded";
  cancellation_datetime?: string | null;
  penalty_applied?: number | null;
  created_at?: string | null;
  indemnity_agreed_at?: string | null;
  payment_proof_url?: string | null;
  payment_verified_at?: string | null;
  is_driver?: boolean | null;
  offered_seats?: number | null;
}

type Registration = WithStringId<DbRegistration>;

// Helper function to determine user's verification level
const getUserVerificationLevel = (
  userProfile: any,
): "auto" | "quick" | "full" => {
  if (!userProfile) return "auto";

  if (userProfile.verification_status !== "VERIFIED") return "auto";

  const docs = userProfile.verification_docs;
  if (docs?.aadhaar?.front_url && docs?.secondary_id?.front_url) {
    return "full";
  } else if (docs?.aadhaar?.front_url) {
    return "quick";
  }
  return "auto";
};

export function useTrekRegistration(trek_id: string | number | undefined) {
  const { user, userProfile } = useAuth();
  const { trekEvent, loading: trekLoading } = useTrekEventDetails(trek_id);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(
    null,
  );
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState<number | null>(null);

  const checkUserRegistration = useCallback(
    async (currentTrekId: number) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
        .from("trek_registrations")
        .select("*")
        .eq("trek_id", currentTrekId)
        .eq("user_id", user.id)
        .maybeSingle() as any;

        if (error) {
          throw error;
        }

        if (data) {
          setUserRegistration(
            convertDbRecordToStringIds(data as DbRegistration),
          );
        } else {
          setUserRegistration(null);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not check registration status.";
        console.error("Error checking registration:", error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [user],
  );

  useEffect(() => {
    if (trek_id && user) {
      const numericTrekId =
        typeof trek_id === "number" ? trek_id : parseInt(trek_id, 10);
      if (!isNaN(numericTrekId)) {
        checkUserRegistration(numericTrekId);
      } else {
        console.error(
          "Invalid trek_id provided to useTrekRegistration:",
          trek_id,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trek_id, user?.id]); // Depend only on user.id, not the function

  async function uploadIdProof(idTypeId: number, file: File): Promise<boolean> {
    if (!user || !userRegistration || !trekEvent) {
      toast({
        title: "Error",
        description: "Cannot upload ID proof at this time.",
        variant: "destructive",
      });
      return false;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return false;
    }

    setUploadingIdProof(idTypeId);
    try {
      // Ensure user session is valid before upload
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to upload files.",
          variant: "destructive",
        });
        return false;
      }

      // Use auth.uid() for consistency with RLS policies
      const userId = session.user.id;
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `id-proofs/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("id-proofs")
        .upload(filePath, file) as any;

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("id-proofs").getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from("registration_id_proofs")
        .insert({
          registration_id: userRegistration.registration_id,
          id_type_id: idTypeId,
          proof_url: publicUrl,
          uploaded_by: userId,
        }) as any;

      if (dbError) {
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from("id-proofs").remove([filePath]);
        throw dbError;
      }

      await checkUserRegistration(
        typeof trek_id === "number" ? trek_id : parseInt(trek_id || "0", 10),
      );
      toast({
        title: "ID Proof Uploaded",
        description:
          "Your ID proof has been uploaded successfully and is pending verification.",
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload ID proof";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("ID proof upload error:", error);
      return false;
    } finally {
      setUploadingIdProof(null);
    }
  }

  async function registerForTrek(
    indemnityAccepted: boolean,
    options?: {
      isDriver?: boolean;
      offeredSeats?: number | null;
      registrantName?: string;
      registrantPhone?: string;
    },
  ) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for this trek",
        variant: "destructive",
      });
      return false;
    }

    if (!indemnityAccepted) {
      toast({
        title: "Indemnity Agreement Required",
        description:
          "You must accept the indemnity agreement to register for this trek.",
        variant: "destructive",
      });
      return false;
    }

    if (!options?.registrantName || !options?.registrantPhone) {
      toast({
        title: "Missing Details",
        description: "Please provide your name and phone number.",
        variant: "destructive",
      });
      return false;
    }

    if (!trekEvent) {
      toast({
        title: "Trek details not loaded",
        description: "Cannot register at this moment.",
        variant: "destructive",
      });
      return false;
    }

    // Note: ID verification check removed to prevent circular dependency
    // Users can now register first, then upload ID documents in the Requirements tab
    // Admin will verify documents before approving final participation

    try {
      setRegistering(true);

      const { data: regs, error: regsError } = await supabase
        .from("trek_registrations")
        .select("user_id, payment_status", { count: "exact" })
        .eq("trek_id", trekEvent.trek_id)
        .not("payment_status", "eq", "Cancelled") as any;

      if (regsError) throw regsError;
      const uniqueUserCount = new Set((regs || []).map((r) => r.user_id)).size;

      if (
        trekEvent.max_participants &&
        uniqueUserCount >= trekEvent.max_participants
      ) {
        toast({
          title: "Registration failed",
          description: "This trek is already full",
          variant: "destructive",
        });
        return false;
      }

      const trekIdNum =
        typeof trekEvent.trek_id === "number"
          ? trekEvent.trek_id
          : parseInt(trekEvent.trek_id, 10);
      if (isNaN(trekIdNum)) {
        toast({
          title: "Error",
          description: "Invalid Trek ID for registration.",
          variant: "destructive",
        });
        return false;
      }

      const { data: existing, error: existingError } = await supabase
        .from("trek_registrations")
        .select("registration_id")
        .eq("trek_id", trekIdNum)
        .eq("user_id", user.id)
        .maybeSingle() as any;

      if (existingError) throw existingError;

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You have an existing registration for this trek.",
          variant: "destructive",
        });
        return false;
      }

      const newRegistrationData = {
        trek_id: trekIdNum,
        user_id: user.id,
        payment_status: "Pending" as const,
        booking_datetime: new Date().toISOString(),
        indemnity_agreed_at: new Date().toISOString(),
        is_driver: options?.isDriver ?? false,
        offered_seats: options?.isDriver
          ? (options?.offeredSeats ?? null)
          : null,
        registrant_name: options.registrantName,
        registrant_phone: options.registrantPhone,
      };

      const { error: registrationError } = await supabase
        .from("trek_registrations")
        .insert(newRegistrationData) as any;

      if (registrationError) {
        throw registrationError;
      }
      await checkUserRegistration(trekIdNum);
      
      // Show appropriate success message based on ID requirements
      const successMessage = trekEvent.government_id_required
        ? "Registration successful! Next steps: 1) Upload your government ID in the Requirements tab, 2) Complete payment and upload proof."
        : "Please complete payment and upload proof to confirm your spot.";
      
      toast({
        title: "Registration successful",
        description: successMessage,
        variant: "default",
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register for this trek";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Registration error:", error);
      return false;
    } finally {
      setRegistering(false);
    }
  }

  async function uploadPaymentProof(
    file: File,
    registrantName: string,
    registrantPhone: string,
  ) {
    if (!user || !userRegistration || !trekEvent) {
      toast({
        title: "Error",
        description: "Cannot upload proof at this time.",
        variant: "destructive",
      });
      return false;
    }
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return false;
    }
    if (!registrantName.trim() || !registrantPhone.trim()) {
      toast({
        title: "Missing Details",
        description: "Please provide payer's name and phone number.",
        variant: "destructive",
      });
      return false;
    }

    setUploadingProof(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `payment_proofs/${user.id}_${userRegistration.trek_id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("trek_assets")
        .upload(fileName, file, {
          upsert: true,
        }) as any;

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from("trek_assets")
        .getPublicUrl(fileName) as any;
      const proofUrl = publicURLData?.publicUrl;

      if (!proofUrl)
        throw new Error("Failed to get public URL for payment proof.");

      const { error: updateError } = await supabase
        .from("trek_registrations")
        .update({
          payment_proof_url: proofUrl,
          payment_status: "ProofUploaded",
          registrant_name: registrantName.trim(),
          registrant_phone: registrantPhone.trim(),
        })
        .eq("registration_id", userRegistration.registration_id) as any;

      if (updateError) throw updateError;

      setUserRegistration((prev) =>
        prev
          ? {
              ...prev,
              payment_proof_url: proofUrl,
              payment_status: "ProofUploaded",
            }
          : null,
      );

      toast({
        title: "Payment proof uploaded",
        description: "Admin will verify your payment shortly.",
        variant: "default",
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload payment proof";
      toast({
        title: "Proof Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error uploading payment proof:", error);
      return false;
    } finally {
      setUploadingProof(false);
    }
  }

  async function cancelRegistration() {
    if (!user || !userRegistration || !trekEvent) return false;
    try {
      setRegistering(true);
      const { error: updateRegError } = await supabase
        .from("trek_registrations")
        .update({
          payment_status: "Cancelled",
          cancellation_datetime: new Date().toISOString(),
        })
        .eq("registration_id", userRegistration.registration_id) as any;
      if (updateRegError) {
        throw updateRegError;
      }
      setUserRegistration((prev) =>
        prev
          ? {
              ...prev,
              payment_status: "Cancelled",
              cancellation_datetime: new Date().toISOString(),
            }
          : null,
      );
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled",
        variant: "default",
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to cancel registration";
      toast({
        title: "Cancellation failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Cancellation error:", error);
      return false;
    } finally {
      setRegistering(false);
    }
  }

  return {
    trekEvent,
    loading: trekLoading || uploadingProof,
    registering,
    userRegistration,
    registerForTrek,
    cancelRegistration,
    uploadPaymentProof,
    uploadIdProof,
    uploadingIdProof,
  };
}
