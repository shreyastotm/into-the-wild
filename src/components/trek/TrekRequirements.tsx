import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Upload, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { WithStringId } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const [requiredIdTypes, setRequiredIdTypes] = useState<IdType[]>([]);
  const [userIdProofs, setUserIdProofs] = useState<RegistrationIdProof[]>([]);
  const [approvedProofs, setApprovedProofs] = useState<RegistrationIdProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState<number | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Default ID types for government verification
  const defaultIdTypes: IdType[] = [
    { id_type_id: 1, display_name: 'Aadhaar Card', is_mandatory: true, name: 'aadhaar', description: null },
    { id_type_id: 2, display_name: 'Passport', is_mandatory: true, name: 'passport', description: null },
    { id_type_id: 3, display_name: 'Driving License', is_mandatory: true, name: 'driving_license', description: null },
    { id_type_id: 4, display_name: 'PAN Card', is_mandatory: true, name: 'pan_card', description: null },
  ];

  useEffect(() => {
    console.log('TrekRequirements: Loading requirements for trek', trekId);
    loadRequirements();
  }, [trekId]);

  const loadRequirements = async () => {
    try {
      setLoading(true);

      // Load required ID types for this trek
      console.log('Loading ID requirements for trek:', trekId);

      // ID verification tables may not exist yet, return empty array for now
      console.log('ID verification system not yet implemented, returning empty requirements');

      // RPC function may not be available yet
      console.log('RPC function not available yet');

      setRequiredIdTypes([]);

      // Load user's ID proofs for this trek (if registered)
      // Tables may not exist yet, set empty array for now
      console.log('ID proofs table not available yet');
          setUserIdProofs([]);

      // Load user's previously approved ID proofs (for reuse)
      // Tables may not exist yet, set empty array for now
      console.log('Approved proofs table not available yet');
              setApprovedProofs([]);

      console.log('TrekRequirements: Loaded requirements for trek', trekId);
      setRequiredIdTypes([]);
    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (idTypeId: number, file: File) => {
    if (!user || !onUploadProof) return false;

    setUploadingProof(idTypeId);
    try {
      const success = await onUploadProof(idTypeId, file);
      if (success) {
        await loadRequirements(); // Reload to show updated status
        setSelectedFile(null);
        setSelectedIdType('');
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

  const handleFileUpload = async () => {
    if (!selectedIdType || !selectedFile) {
      toast({
        title: 'Missing Selection',
        description: 'Please select an ID type and upload a file.',
        variant: 'destructive',
      });
      return;
    }

    const idTypeId = parseInt(selectedIdType, 10);
    await handleUploadProof(idTypeId, selectedFile);
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
      {/* ID Requirements Alert */}
      {governmentIdRequired && (
        <Alert className="border-info/20 bg-info/5 dark:border-info/30 dark:bg-info/10">
          <AlertTriangle className="h-4 w-4 text-info" />
          <AlertTitle className="text-info-foreground">
            Government ID Required
          </AlertTitle>
          <AlertDescription className="text-info-foreground/80">
            This trek requires government ID verification for ticket booking and permits.
            {userRegistration ? (
              <span className="block mt-2">
                Please upload your ID document below to complete registration.
              </span>
            ) : (
              <span className="block mt-2">
                You need to upload ID documents to register for this trek.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current ID Proof Status */}
      {userRegistration && (userIdProofs.length > 0 || approvedProofs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ID Proof Status
            </CardTitle>
            <CardDescription>
              Current status of your uploaded ID documents for this trek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defaultIdTypes.map((idType) => {
              const status = getProofStatus(idType.id_type_id);
              return (
                <div key={idType.id_type_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{idType.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {status === 'previously_approved' ? 'Previously verified' : 
                         status === 'not_uploaded' ? 'Not uploaded' : 
                         `Status: ${status}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(status)}
                </div>
              );
            })}
          </CardContent>
        </Card>
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
                    <p className="font-medium">ID Document</p>
                    <p className="text-sm text-muted-foreground">
                      Verified on {new Date(proof.verified_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">Approved</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compact ID Upload Interface */}
      {governmentIdRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload ID Proof
            </CardTitle>
            <CardDescription>
              {userRegistration
                ? 'Upload your ID document to complete registration.'
                : 'Upload your ID document first, then register for this trek.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRegistration ? (
              /* Show upload interface when user IS registered */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select ID Type
                    </label>
                    <Select value={selectedIdType} onValueChange={(value) => {
                      console.log('Select changed:', value);
                      setSelectedIdType(value);
                    }}>
                      <SelectTrigger className="w-full cursor-pointer hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Choose an ID type to upload" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {defaultIdTypes.map((idType) => (
                          <SelectItem
                            key={idType.id_type_id}
                            value={idType.id_type_id.toString()}
                            className="cursor-pointer hover:bg-primary/10"
                          >
                            {idType.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Upload Document (Image or PDF)
                    </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-primary-foreground"
                        />
                  </div>

                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedIdType || !selectedFile || uploadingProof !== null}
                    className="w-full"
                    size="lg"
                  >
                    {uploadingProof !== null ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload ID Proof
                      </>
                      )}
                  </Button>
                    </div>
            ) : (
              /* Show message when user is NOT registered */
              <div className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg text-center">
                <div className="flex flex-col items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-primary-foreground mb-2">
                      Registration Required
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      Please register for this trek first. After registering, you'll be able to upload your ID documents for verification.
                </p>
                  </div>
                </div>
              </div>
                  )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
