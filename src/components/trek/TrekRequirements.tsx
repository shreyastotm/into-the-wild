import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Upload, FileText, ExternalLink, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { WithStringId } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface DbRegistration {
  registration_id: number;
  user_id: string;
  trek_id: number;
  booking_datetime: string | null;
  cancellation_datetime: string | null;
  penalty_applied: number | null;
  created_at: string | null;
  pickup_location_id: number | null;
  is_driver: boolean | null;
  payment_status: string | null;
  indemnity_agreed: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  registrant_name: string | null;
  registrant_phone: string | null;
  payment_proof_url: string | null;
  id_verification_status: string | null;
  id_verification_notes: string | null;
}

interface IdType {
  id_type_id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_mandatory: boolean;
}

interface RegistrationIdProof {
  proof_id: number;
  registration_id: number;
  id_type_id: number;
  proof_url: string;
  uploaded_by: string;
  uploaded_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  verification_status: string;
  admin_notes: string | null;
}

interface TrekRequirementsProps {
  trekId: number;
  governmentIdRequired: boolean;
  userRegistration?: WithStringId<DbRegistration> | null;
  onUploadProof?: (idTypeId: number, file: File) => Promise<boolean>;
}

export const TrekRequirements: React.FC<TrekRequirementsProps> = ({
  trekId,
  governmentIdRequired,
  userRegistration,
  onUploadProof
}) => {
  const { user, userProfile } = useAuth();
  const [requiredIdTypes, setRequiredIdTypes] = useState<IdType[]>([]);
  const [userIdProofs, setUserIdProofs] = useState<RegistrationIdProof[]>([]);
  const [approvedProofs, setApprovedProofs] = useState<RegistrationIdProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState<number | null>(null);

  // Helper function to check if user has approved trek-specific documents
  const hasApprovedTrekDocuments = () => {
    if (!userRegistration) return false;
    return userIdProofs.some(proof => proof.verification_status === 'approved');
  };

  // Helper function to check if user has any uploaded documents for this trek
  const hasUploadedDocuments = () => {
    if (!userRegistration) return false;
    return userIdProofs.length > 0;
  };

  useEffect(() => {
    console.log('TrekRequirements: Loading requirements for trek', trekId);
    loadRequirements();
  }, [trekId]);

  const loadRequirements = async () => {
    try {
      setLoading(true);

      // Load required ID types for this trek
      // Use direct query instead of RPC function to avoid issues
      let idTypes;
      let idTypesError;

      console.log('Loading ID requirements for trek:', trekId);

      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('trek_id_requirements')
          .select(`
            id_type_id,
            is_mandatory,
            id_types!inner(
              id_type_id,
              name,
              display_name,
              description,
              is_active
            )
          `)
          .eq('trek_id', trekId);

        console.log('Direct query result:', { data: fallbackData, error: fallbackError });

        if (fallbackError) {
          // Tables might not exist yet, return empty array
          if (fallbackError.code === 'PGRST116') {
            console.log('ID verification tables not found, returning empty requirements');
            idTypes = [];
            idTypesError = null;
          } else {
            console.error('Error loading ID requirements:', fallbackError);
            idTypes = [];
            idTypesError = fallbackError;
          }
        } else {
          // Transform the data to match expected format
          idTypes = (fallbackData || []).map(item => ({
            id_type_id: item.id_type_id,
            name: item.id_types.name,
            display_name: item.id_types.display_name,
            description: item.id_types.description,
            is_mandatory: item.is_mandatory
          })).filter(item =>
            item.id_types?.is_active !== false &&
            item.name !== 'aadhaar'  // Exclude Aadhaar cards from trek requirements
          );

          console.log('Transformed ID types:', idTypes);
          idTypesError = null;
        }
      } catch (tableError) {
        console.log('ID verification system not yet implemented, returning empty requirements');
        idTypes = [];
        idTypesError = null;
      }

      // Also try RPC function for debugging
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_trek_required_id_types', { trek_id_param: trekId });
        console.log('RPC function result:', { data: rpcData, error: rpcError });
      } catch (rpcError) {
        console.log('RPC function not available:', rpcError);
      }

      if (idTypesError && !idTypes) {
        console.error('Error loading ID requirements:', idTypesError);
        return;
      }

      console.log('TrekRequirements: Loaded ID types:', idTypes);
      setRequiredIdTypes(idTypes || []);

      // Load user's ID proofs for this trek (if registered)
      if (userRegistration && user) {
        try {
          const { data: proofs, error: proofsError } = await supabase
            .from('registration_id_proofs')
            .select('*')
            .eq('registration_id', userRegistration.registration_id);

          if (proofsError) {
            // Table might not exist yet
            if (proofsError.code === 'PGRST116') {
              console.log('registration_id_proofs table not found');
              setUserIdProofs([]);
            } else {
              console.error('Error loading ID proofs:', proofsError);
              setUserIdProofs([]);
            }
          } else {
            setUserIdProofs(proofs || []);
          }
        } catch (proofsTableError) {
          console.log('ID proofs table not available yet');
          setUserIdProofs([]);
        }
      }

      // Load user's previously approved ID proofs (for reuse)
      if (user) {
        try {
          const { data: approvedProofs, error: approvedError } = await supabase
            .from('registration_id_proofs')
            .select(`
              *,
              id_types!inner(*),
              trek_registrations!inner(
                registration_id,
                trek_events!inner(name)
              )
            `)
            .eq('uploaded_by', user.id)
            .eq('verification_status', 'approved')
            .order('verified_at', { ascending: false });

          if (approvedError) {
            // Table might not exist yet
            if (approvedError.code === 'PGRST116') {
              console.log('registration_id_proofs table not found for approved proofs');
              setApprovedProofs([]);
            } else {
              console.error('Error loading approved proofs:', approvedError);
              setApprovedProofs([]);
            }
          } else {
            const formattedApproved = (approvedProofs || []).map(proof => ({
              ...proof,
              id_type: proof.id_types,
              trek_name: proof.trek_registrations?.trek_events?.name
            }));
            setApprovedProofs(formattedApproved);
          }
        } catch (approvedTableError) {
          console.log('Approved proofs table not available yet');
          setApprovedProofs([]);
        }
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (idTypeId: number, file: File) => {
    if (!user || !userRegistration || !onUploadProof) return false;

    setUploadingProof(idTypeId);
    try {
      const success = await onUploadProof(idTypeId, file);
      if (success) {
        await loadRequirements(); // Reload to show updated status
        toast({
          title: 'Proof Uploaded',
          description: 'Your ID proof has been uploaded and is pending verification.',
        });
      }
      return success;
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload ID proof. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploadingProof(null);
    }
  };

  const getProofStatus = (idTypeId: number) => {
    // Check current trek proofs first
    const currentProof = userIdProofs.find(p => p.id_type_id === idTypeId);
    if (currentProof) {
      return currentProof.verification_status;
    }

    // Check if user has previously approved proof for this ID type
    const approvedProof = approvedProofs.find(p => p.id_type_id === idTypeId);
    if (approvedProof) {
      return 'previously_approved';
    }

    return 'not_uploaded';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Verified</Badge>;
      case 'previously_approved':
        return <Badge className="bg-blue-600 text-white">Previously Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Not Uploaded</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  // Show upload interface if either government ID is required OR specific ID types are required
  const hasRequirements = governmentIdRequired || requiredIdTypes.length > 0;

  if (!hasRequirements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            No ID Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This trek doesn't require any specific ID verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trek-Specific Document Status */}
      <Card className={userRegistration && hasApprovedTrekDocuments() ? 'border-success/50 bg-success/5' : userRegistration ? 'border-info/50 bg-info/5' : 'border-border bg-card'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className={`h-5 w-5 ${userRegistration && hasApprovedTrekDocuments() ? 'text-success' : userRegistration ? 'text-info' : 'text-muted-foreground'}`} />
            {hasRequirements ? 'ID Verification Required' : 'ID Document Status for This Trek'}
          </CardTitle>
          <CardDescription>
            {userRegistration && hasApprovedTrekDocuments()
              ? 'Your documents have been verified for this trek'
              : userRegistration && hasUploadedDocuments()
                ? 'Your documents are pending verification'
                : userRegistration
                  ? 'Upload required ID documents for this trek'
                  : hasRequirements
                    ? 'Register for this trek to upload required ID documents'
                    : 'No ID verification required for this trek'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={
                userRegistration && hasApprovedTrekDocuments()
                  ? 'bg-green-600 text-white'
                  : userRegistration && hasUploadedDocuments()
                    ? 'bg-yellow-600 text-white'
                    : userRegistration && hasRequirements
                      ? 'bg-gray-600 text-white'
                      : userRegistration
                        ? 'bg-blue-600 text-white'
                        : hasRequirements
                          ? 'bg-purple-600 text-white'
                          : 'bg-green-600 text-white'
              }>
                {userRegistration && hasApprovedTrekDocuments()
                  ? 'Documents Approved'
                  : userRegistration && hasUploadedDocuments()
                    ? 'Pending Review'
                    : userRegistration && hasRequirements
                      ? 'Documents Required'
                      : userRegistration
                        ? 'Registration Required'
                        : hasRequirements
                          ? 'ID Verification Required'
                          : 'No Requirements'
                }
              </Badge>
              <div>
                <p className="font-medium">
                  {userRegistration && hasApprovedTrekDocuments()
                    ? '✅ Ready for registration'
                    : userRegistration && hasUploadedDocuments()
                      ? '⏳ Awaiting admin verification'
                      : userRegistration && hasRequirements
                        ? '📋 Upload documents to register'
                        : userRegistration
                          ? '🔐 Register to upload documents'
                          : hasRequirements
                            ? '📋 ID verification required'
                            : '✅ No ID verification needed'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single consolidated ID requirement alert */}
      {(governmentIdRequired || requiredIdTypes.length > 0) && (
        <Alert className={governmentIdRequired ? "border-blue-200 bg-blue-50" : "border-purple-200 bg-purple-50"}>
          <AlertTriangle className={`h-4 w-4 ${governmentIdRequired ? 'text-blue-600' : 'text-purple-600'}`} />
          <AlertTitle className={governmentIdRequired ? 'text-blue-800' : 'text-purple-800'}>
            {governmentIdRequired ? 'Government ID Required' : 'ID Verification Required'}
          </AlertTitle>
          <AlertDescription className={governmentIdRequired ? 'text-blue-700' : 'text-purple-700'}>
            {governmentIdRequired
              ? 'This trek requires government ID verification for ticket booking and permits.'
              : 'This trek requires specific ID verification.'
            }
            {userRegistration && !hasApprovedTrekDocuments() && (
              <span className="block mt-2">
                Please upload your required ID documents below to complete registration.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Previously Approved ID Proofs */}
      {approvedProofs.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Previously Approved ID Proofs
            </CardTitle>
            <CardDescription className="text-green-700">
              You have previously uploaded and verified ID proofs that can be reused for this trek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedProofs.map((proof) => (
              <div key={`${proof.proof_id}-${proof.id_type_id}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{proof.id_type?.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Verified for {proof.trek_name} on {new Date(proof.verified_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">Approved</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trek-Specific ID Requirements */}
      {requiredIdTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required ID Proofs
            </CardTitle>
            <CardDescription>
              Upload the following ID proofs to participate in this trek. All proofs will be verified by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredIdTypes.map((idType) => {
              const proofStatus = getProofStatus(idType.id_type_id);
              const canUpload = user && userRegistration && proofStatus === 'not_uploaded';
              const isPreviouslyApproved = proofStatus === 'previously_approved';

              return (
                <div key={idType.id_type_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{idType.display_name}</h4>
                      {idType.is_mandatory && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {getStatusBadge(proofStatus)}
                  </div>

                  {idType.description && (
                    <p className="text-sm text-muted-foreground mb-3">{idType.description}</p>
                  )}

                  {/* Upload Section */}
                  {canUpload && (
                    <div className="space-y-2">
                      <label className="block">
                        <span className="text-sm font-medium">Upload {idType.display_name}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadProof(idType.id_type_id, file);
                          }}
                          disabled={uploadingProof === idType.id_type_id}
                          className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-info/10 file:text-info hover:file:bg-info/20"
                        />
                      </label>
                      {uploadingProof === idType.id_type_id && (
                        <p className="text-sm text-info">Uploading...</p>
                      )}
                    </div>
                  )}

                  {/* Show upload prompt even if not registered */}
                  {!userRegistration && requiredIdTypes.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Registration Required:</strong> You need to register for this trek to upload ID documents.
                      </p>
                    </div>
                  )}

                  {/* Status Messages */}
                  {proofStatus === 'pending' && (
                    <p className="text-sm text-yellow-600">
                      Your {idType.display_name} is pending admin verification.
                    </p>
                  )}

                  {proofStatus === 'rejected' && (
                    <p className="text-sm text-red-600">
                      Your {idType.display_name} was rejected. Please upload a different document.
                    </p>
                  )}

                  {proofStatus === 'approved' && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Your {idType.display_name} has been verified.
                    </p>
                  )}

                  {isPreviouslyApproved && (
                    <p className="text-sm text-blue-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Your previously approved {idType.display_name} can be used for this trek.
                    </p>
                  )}

                  {!isPreviouslyApproved && proofStatus === 'not_uploaded' && (
                    <p className="text-sm text-muted-foreground">
                      Please upload your {idType.display_name} for verification.
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
