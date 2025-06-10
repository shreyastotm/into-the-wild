import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, AlertCircle, UploadCloud } from 'lucide-react';
import { WithStringId } from "@/integrations/supabase/client";
import { formatCurrency } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TrekEventStatus } from '@/types/trek';

interface DbRegistration {
  registration_id: number;
  trek_id: number;
  user_id: string;
  booking_datetime: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled' | 'ProofUploaded';
  cancellation_datetime?: string | null;
  penalty_applied?: number | null;
  created_at?: string | null;
  indemnity_agreed_at?: string | null;
  payment_proof_url?: string | null;
  payment_verified_at?: string | null;
}

interface RegistrationCardProps {
  trek: {
    trek_id: number;
    max_participants: number;
    participant_count?: number;
    cost: number;
    name?: string;
    status?: TrekEventStatus | string | null;
  };
  userRegistration: WithStringId<DbRegistration> | null;
  onRegister: (indemnityAccepted: boolean) => Promise<{success: boolean, registrationId?: number | null}>;
  onCancel: () => Promise<boolean>;
  onUploadProof: (registrationId: number, file: File) => Promise<boolean>;
  isLoading: boolean;
  isUploadingProof: boolean;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  trek,
  userRegistration,
  onRegister,
  onCancel,
  onUploadProof,
  isLoading,
  isUploadingProof,
}) => {
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  // participantCount should be the count of unique user_ids for this trek
  const participantCount = trek.participant_count ?? 0;
  const availableSpots = trek.max_participants - participantCount;
  const spotsFillPercent = (participantCount / trek.max_participants) * 100;
  const isFull = availableSpots <= 0;
  const canRegister = trek.status === TrekEventStatus.OPEN_FOR_REGISTRATION && !isFull && !userRegistration;
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPaymentProofFile(event.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (paymentProofFile && userRegistration) {
      await onUploadProof(userRegistration.registration_id, paymentProofFile);
      setPaymentProofFile(null); // Clear file input after attempting upload
    }
  };
  
  const indemnityText = `I, the participant, acknowledge that ${trek.name || 'this trek'} involves inherent risks, including but not limited to accidents, illness, and loss of property. I voluntarily assume all such risks and release Into The Wild, its organizers, and affiliates from any liability for any injury, loss, or damage I may suffer. I confirm I am physically fit for this activity and have consulted a doctor if necessary. I agree to follow all safety instructions.`;

  return (
    <Card className="sticky top-6">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Registration</span>
          <span className="text-2xl">{formatCurrency(trek.cost)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <span>Participants</span>
            </div>
            <div>
              <Badge variant={availableSpots > 5 ? "outline" : "secondary"} 
                className={availableSpots <= 5 && availableSpots > 0 ? "bg-amber-100 text-amber-800" : ""}>
                {availableSpots} spots left
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{participantCount} registered</span>
              <span>{trek.max_participants} maximum</span>
            </div>
            <Progress value={spotsFillPercent} className="h-2" />
          </div>
        </div>

        {userRegistration ? (
          <div className="rounded-md bg-green-50 p-4 flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">You're registered!</h4>
              <p className="text-sm text-green-700">
                Registered on {new Date(userRegistration.booking_datetime).toLocaleDateString()}
              </p>
              {userRegistration.payment_status === 'Pending' && (
                <div className="mt-4 p-4 border border-amber-300 rounded-md bg-amber-50">
                  <h5 className="font-medium text-amber-800">Action Required: Upload Payment Proof</h5>
                  <p className="text-sm text-amber-700 mb-2">
                    Please upload a screenshot or document of your payment to confirm your spot.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="payment-proof" className="text-sm font-medium text-gray-700">Payment Proof File</Label>
                    <Input 
                      id="payment-proof" 
                      type="file" 
                      onChange={handleFileChange} 
                      className="text-sm"
                      disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                    />
                    {paymentProofFile && !userRegistration.payment_proof_url && (
                      <Button 
                        onClick={handleUploadProof} 
                        disabled={isUploadingProof || !paymentProofFile} 
                        className="w-full text-sm"
                        size="sm"
                      >
                        {isUploadingProof ? 'Uploading...' : 'Upload Proof'}
                        <UploadCloud className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {userRegistration.payment_proof_url && (
                       <p className="text-xs text-green-600">Proof uploaded. Awaiting verification.</p>
                    )}
                  </div>
                </div>
              )}
              {userRegistration.payment_status === 'ProofUploaded' && (
                <p className="text-sm text-blue-700 mt-2">Payment proof uploaded. Awaiting verification.</p>
              )}
              {userRegistration.payment_status === 'Paid' && (
                <p className="text-sm text-green-700 mt-2">Payment confirmed. See you there!</p>
              )}
            </div>
          </div>
        ) : isFull ? (
          <div className="rounded-md bg-amber-50 p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">This trek is full</h4>
              <p className="text-sm text-amber-700">
                Please check back later or explore other treks.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
      
      <CardFooter className="flex-col space-y-2">
        {userRegistration ? (
          userRegistration.payment_status !== 'Cancelled' && userRegistration.payment_status !== 'Paid' && (
            <Button variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Cancel Registration'}
            </Button>
          )
        ) : (
          <>
            <div className="w-full space-y-3 items-start rounded-md border p-4 bg-gray-50">
                <div className="flex items-start space-x-2">
                    <Checkbox 
                        id="indemnity" 
                        checked={indemnityAccepted} 
                        onCheckedChange={(checked) => setIndemnityAccepted(checked as boolean)} 
                        disabled={isLoading || isFull}
                    />
                    <Label htmlFor="indemnity" className="text-xs leading-relaxed text-gray-600 cursor-pointer">
                        {indemnityText}
                    </Label>
                </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => onRegister(indemnityAccepted)} 
              disabled={isLoading || !canRegister || !indemnityAccepted}
            >
              {isLoading ? 'Processing...' : !canRegister ? (trek.status === TrekEventStatus.REGISTRATION_CLOSED ? 'Registration Closed' : trek.status === TrekEventStatus.COMPLETED ? 'Trek Completed' : trek.status === TrekEventStatus.CANCELLED ? 'Trek Cancelled' : trek.status === TrekEventStatus.ONGOING ? 'Trek Ongoing' : isFull ? 'Trek is Full' : 'Registration Not Open') : 'Register Now'}
            </Button>
          </>
        )}
        
        <p className="text-xs text-center text-gray-500 mt-2">
          By registering, you agree to the trek's cancellation policy and indemnity terms.
        </p>
      </CardFooter>
    </Card>
  );
};
