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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserVerificationStatus, VerificationDocs } from '@/integrations/supabase/types';
import { CheckCircle, Upload, Shield, Clock, AlertCircle } from 'lucide-react';

interface VerificationTier {
  id: 'auto' | 'quick' | 'full';
  name: string;
  description: string;
  icon: React.ReactNode;
  docsRequired: number;
  benefits: string[];
  color: string;
}

const verificationTiers: VerificationTier[] = [
  {
    id: 'auto',
    name: 'Auto-Verified',
    description: 'Automatically verified for basic access',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    docsRequired: 0,
    benefits: ['Basic trek registration', 'Community access'],
    color: 'green'
  },
  {
    id: 'quick',
    name: 'Quick Verification',
    description: 'Upload Aadhaar front only for enhanced access',
    icon: <Upload className="h-5 w-5 text-blue-600" />,
    docsRequired: 1,
    benefits: ['Most trek registrations', 'Priority support'],
    color: 'blue'
  },
  {
    id: 'full',
    name: 'Full Verification',
    description: 'Complete verification with all documents',
    icon: <Shield className="h-5 w-5 text-purple-600" />,
    docsRequired: 4,
    benefits: ['All trek registrations', 'Government permit treks', 'Priority booking'],
    color: 'purple'
  }
];

const IdVerification = () => {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<'auto' | 'quick' | 'full'>('auto');

  // Files state for full verification
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [secondaryIdFront, setSecondaryIdFront] = useState<File | null>(null);
  const [secondaryIdBack, setSecondaryIdBack] = useState<File | null>(null);
  const [secondaryIdType, setSecondaryIdType] = useState('PASSPORT');

  // Files state for quick verification
  const [quickAadhaarFront, setQuickAadhaarFront] = useState<File | null>(null);

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  const { verification_status, verification_docs } = userProfile;

  // Determine current verification tier based on status and docs
  const getCurrentTier = (): 'auto' | 'quick' | 'full' => {
    if (verification_status === 'VERIFIED') {
      if (verification_docs?.aadhaar?.front_url && verification_docs?.secondary_id?.front_url) {
        return 'full';
      } else if (verification_docs?.aadhaar?.front_url) {
        return 'quick';
      }
      return 'auto';
    }
    return 'auto';
  };

  const getTierBadgeColor = (tierId: string) => {
    const tier = verificationTiers.find(t => t.id === tierId);
    return tier?.color || 'gray';
  };

  const getTierBadgeClasses = (tierId: string) => {
    const color = getTierBadgeColor(tierId);
    switch (color) {
      case 'green': return 'bg-green-600 text-white';
      case 'blue': return 'bg-blue-600 text-white';
      case 'purple': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handleQuickVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quickAadhaarFront) {
      toast({ title: "Missing File", description: "Please upload your Aadhaar front image.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const uploadFile = async (file: File, path: string) => {
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(path, file, { upsert: true });
        if (error) throw error;
        return supabase.storage.from('verification-documents').getPublicUrl(data.path).data.publicUrl;
      };

      const basePath = `${user.id}/${Date.now()}`;
      const aadhaarFrontUrl = await uploadFile(quickAadhaarFront, `${basePath}_aadhaar_front_quick`);

      const docsPayload: VerificationDocs = {
        aadhaar: { front_url: aadhaarFrontUrl, back_url: null },
        secondary_id: { type: null, front_url: null, back_url: null },
        submitted_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_docs: docsPayload,
          verification_status: 'VERIFIED' as UserVerificationStatus
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Success", description: "Quick verification completed successfully!" });
      fetchUserProfile();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload.";
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const renderTierCard = (tier: VerificationTier) => {
    const currentTierId = getCurrentTier();
    const isCurrentTier = currentTierId === tier.id;
    const isCompleted = verificationTiers.findIndex(t => t.id === currentTierId) >= verificationTiers.findIndex(t => t.id === tier.id);

    return (
      <Card key={tier.id} className={`relative ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tier.icon}
              <div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </div>
            </div>
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={isCurrentTier ? 'default' : 'outline'}>
                {tier.docsRequired === 0 ? 'No documents' : `${tier.docsRequired} document${tier.docsRequired > 1 ? 's' : ''}`}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Benefits:</p>
              <ul className="text-sm space-y-1">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVerificationContent = () => {
    const currentTierId = getCurrentTier();

    return (
      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            {verificationTiers.find(t => t.id === currentTierId)?.icon}
            <div>
              <h3 className="font-medium">Current Verification Level</h3>
              <p className="text-sm text-muted-foreground">
                {verificationTiers.find(t => t.id === currentTierId)?.name} - {verificationTiers.find(t => t.id === currentTierId)?.description}
              </p>
            </div>
            <Badge className={`ml-auto ${getTierBadgeClasses(currentTierId)}`}>
              {currentTierId.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Verification Tiers */}
        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Verification Levels</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {verificationTiers.map(renderTierCard)}
          </div>
        </div>

        {/* Upgrade Options */}
        {currentTierId !== 'full' && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Upgrade Your Verification</h3>
            <Tabs value={currentTier} onValueChange={(value) => setCurrentTier(value as 'auto' | 'quick' | 'full')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">Quick Verification</TabsTrigger>
                <TabsTrigger value="full">Full Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="mt-4">
                <form onSubmit={handleQuickVerification} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload just your Aadhaar front image for quick verification. This gives you access to most treks.
                  </p>
                  <div>
                    <Label htmlFor="quick-aadhaar-front">Aadhaar Front Image</Label>
                    <Input
                      id="quick-aadhaar-front"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setQuickAadhaarFront(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading || !quickAadhaarFront}>
                    {loading ? 'Uploading...' : 'Complete Quick Verification'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="full" className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Upload all four document images for complete verification. This gives you access to all treks including government permit events.
                  </p>

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

                  <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Complete Full Verification'}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Government ID Requirements Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Government ID Requirements</h4>
              <p className="text-sm text-blue-700 mt-1">
                Some treks require government ID verification for ticket booking and permits. Your current verification level determines which treks you can join.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Government ID Verification</span>
          <Badge className={getTierBadgeClasses(getCurrentTier())}>
            {getCurrentTier().toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Choose your verification level based on the treks you want to join. Auto-verified users can access basic treks, while full verification unlocks government permit events and priority booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderVerificationContent()}
      </CardContent>
    </Card>
  );
};

export default IdVerification; 