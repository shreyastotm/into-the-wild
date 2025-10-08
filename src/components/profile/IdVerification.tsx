import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserVerificationStatus, VerificationDocs } from '@/integrations/supabase/types';

const IdVerification = () => {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Files state
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [secondaryIdFront, setSecondaryIdFront] = useState<File | null>(null);
  const [secondaryIdBack, setSecondaryIdBack] = useState<File | null>(null);
  const [secondaryIdType, setSecondaryIdType] = useState('PASSPORT');

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  const { verification_status, verification_docs } = userProfile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !aadhaarFront || !aadhaarBack || !secondaryIdFront || !secondaryIdBack) {
      toast({ title: "Missing Files", description: "Please upload all four document images.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Define upload function
      const uploadFile = async (file: File, path: string) => {
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(path, file, { upsert: true });
        if (error) throw error;
        return supabase.storage.from('verification-documents').getPublicUrl(data.path).data.publicUrl;
      };

      // Upload all files
      const basePath = `${user.id}/${Date.now()}`;
      const aadhaarFrontUrl = await uploadFile(aadhaarFront, `${basePath}_aadhaar_front`);
      const aadhaarBackUrl = await uploadFile(aadhaarBack, `${basePath}_aadhaar_back`);
      const secondaryIdFrontUrl = await uploadFile(secondaryIdFront, `${basePath}_secondary_front`);
      const secondaryIdBackUrl = await uploadFile(secondaryIdBack, `${basePath}_secondary_back`);

      // Update user profile with new doc URLs and set status to PENDING_REVIEW
      const docsPayload: VerificationDocs = {
        aadhaar: { front_url: aadhaarFrontUrl, back_url: aadhaarBackUrl },
        secondary_id: { type: secondaryIdType, front_url: secondaryIdFrontUrl, back_url: secondaryIdBackUrl },
        submitted_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_docs: docsPayload,
          verification_status: 'PENDING_REVIEW' as UserVerificationStatus
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error uploading verification docs:', updateError);
        throw new Error(`Error uploading verification docs: ${updateError.message}`);
      }
      
      toast({ title: "Success", description: "Documents uploaded and are now pending review." });
      fetchUserProfile(); // Refresh user profile to show new status

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload.";
      console.error("Error uploading verification docs:", error);
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    switch (verification_status) {
      case 'VERIFIED':
        return <Badge className="bg-green-600 text-primary-foreground hover:bg-green-700">Verified</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="secondary" className="bg-yellow-500 text-secondary-foreground hover:bg-yellow-600">Pending Review</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'NOT_SUBMITTED':
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };
  
  const renderContent = () => {
    switch (verification_status) {
      case 'VERIFIED':
        return <p>Your identity has been verified. You can now register for treks.</p>;
      case 'PENDING_REVIEW':
        return <p>Your documents have been submitted and are pending review by an administrator.</p>;
      case 'REJECTED':
      case 'NOT_SUBMITTED':
      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p>You must upload identity documents to register for treks. Please upload front and back images for both documents.</p>
            
            {/* Aadhaar Upload */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-medium">Aadhaar Card</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="aadhaar-front">Front Image</Label>
                  <Input id="aadhaar-front" type="file" accept="image/*" onChange={(e) => setAadhaarFront(e.target.files?.[0] || null)} required />
                </div>
                <div>
                  <Label htmlFor="aadhaar-back">Back Image</Label>
                  <Input id="aadhaar-back" type="file" accept="image/*" onChange={(e) => setAadhaarBack(e.target.files?.[0] || null)} required />
                </div>
              </div>
            </fieldset>

            {/* Secondary ID Upload */}
            <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-medium">Secondary ID</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="secondary-id-type">Document Type</Label>
                  <Select value={secondaryIdType} onValueChange={setSecondaryIdType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                      <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                      <SelectItem value="PAN_CARD">PAN Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secondary-id-front">Front Image</Label>
                    <Input id="secondary-id-front" type="file" accept="image/*" onChange={(e) => setSecondaryIdFront(e.target.files?.[0] || null)} required />
                  </div>
                  <div>
                    <Label htmlFor="secondary-id-back">Back Image</Label>
                    <Input id="secondary-id-back" type="file" accept="image/*" onChange={(e) => setSecondaryIdBack(e.target.files?.[0] || null)} required />
                  </div>
                </div>
              </div>
            </fieldset>

            <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Submit for Verification'}</Button>
          </form>
        );
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>ID Verification</span>
          {renderStatusBadge()}
        </CardTitle>
        <CardDescription className="text-sm">
          Your identity must be verified before you can register for any treks.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default IdVerification; 