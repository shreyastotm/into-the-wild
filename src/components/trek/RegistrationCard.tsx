import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/components/auth/AuthProvider';

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
  is_driver?: boolean | null;
  offered_seats?: number | null;
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
  onRegister: (indemnityAccepted: boolean, options?: { isDriver?: boolean; offeredSeats?: number | null; registrantName?: string; registrantPhone?: string }) => Promise<{success: boolean, registrationId?: number | null}>;
  onCancel: () => Promise<boolean>;
  onUploadProof: (registrationId: number, file: File, registrantName: string, registrantPhone: string) => Promise<boolean>;
  isLoading: boolean;
  isUploadingProof: boolean;
  canVolunteerDriver?: boolean;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  trek,
  userRegistration,
  onRegister,
  onCancel,
  onUploadProof,
  isLoading,
  isUploadingProof,
  canVolunteerDriver = false,
}) => {
  const { userProfile } = useAuth();
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [volunteerAsDriver, setVolunteerAsDriver] = useState(false);
  const [offeredSeats, setOfferedSeats] = useState<string>('');
  const [registrantName, setRegistrantName] = useState('');
  const [registrantPhone, setRegistrantPhone] = useState('');

  // Pre-fill registrant details from user profile
  useEffect(() => {
    if (userProfile && !userRegistration) {
      setRegistrantName(userProfile.full_name || '');
      setRegistrantPhone(userProfile.phone_number || '');
    }
  }, [userProfile, userRegistration]);

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
      await onUploadProof(userRegistration.registration_id, paymentProofFile, registrantName, registrantPhone);
      setPaymentProofFile(null); // Clear file input after attempting upload
    }
  };
  
  const indemnityText = `I, the participant, acknowledge that ${trek.name || 'this trek'} involves inherent risks, including but not limited to accidents, illness, and loss of property. I voluntarily assume all such risks and release Into The Wild, its organizers, and affiliates from any liability for any injury, loss, or damage I may suffer. I confirm I am physically fit for this activity and have consulted a doctor if necessary. I agree to follow all safety instructions.`;

  return (
    <Card className="sticky top-4 sm:top-6">
      <CardHeader className="bg-gray-50 rounded-t-lg p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Registration</span>
          <span className="text-xl sm:text-2xl font-bold">{formatCurrency(trek.cost)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 p-4 sm:p-6">
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
                  <p className="text-sm text-amber-700 mb-3">
                    Please provide the payer's details and upload payment proof.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="registrant-name" className="text-sm font-medium text-gray-700">Payer's Name *</Label>
                      <Input 
                        id="registrant-name" 
                        type="text" 
                        value={registrantName}
                        onChange={(e) => setRegistrantName(e.target.value)}
                        placeholder="Name of person making payment"
                        className="text-sm mt-1 w-full"
                        disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      />
                      <p className="text-xs text-gray-500 mt-1">This may be you or someone paying on your behalf</p>
                    </div>
                    <div>
                      <Label htmlFor="registrant-phone" className="text-sm font-medium text-gray-700">Payer's Phone Number *</Label>
                      <Input 
                        id="registrant-phone" 
                        type="tel" 
                        value={registrantPhone}
                        onChange={(e) => setRegistrantPhone(e.target.value)}
                        placeholder="Phone number used for payment"
                        className="text-sm mt-1 w-full"
                        disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      />
                      <p className="text-xs text-gray-500 mt-1">Phone number from which payment was made</p>
                    </div>
                    <div>
                      <Label htmlFor="payment-proof" className="text-sm font-medium text-gray-700">Payment Proof (Screenshot/Receipt) *</Label>
                      <Input 
                        id="payment-proof" 
                        type="file" 
                        onChange={handleFileChange} 
                        className="text-sm mt-1 w-full"
                        accept="image/*,.pdf"
                        disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      />
                    </div>
                    {paymentProofFile && !userRegistration.payment_proof_url && (
                      <Button 
                        onClick={handleUploadProof} 
                        disabled={isUploadingProof || !paymentProofFile || !registrantName.trim() || !registrantPhone.trim()} 
                        className="w-full text-sm"
                        size="sm"
                      >
                        {isUploadingProof ? 'Uploading...' : 'Upload Proof'}
                        <UploadCloud className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {userRegistration.payment_proof_url && (
                       <p className="text-xs text-green-600">✓ Proof uploaded. Awaiting admin verification.</p>
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
            <div className="w-full space-y-3 items-start rounded-md border p-3 sm:p-4 bg-gray-50">
                <div className="space-y-3 mb-4">
                  <div>
                    <Label htmlFor="reg-name" className="text-sm font-medium">Your Name *</Label>
                    <Input 
                      id="reg-name"
                      value={registrantName}
                      onChange={(e) => setRegistrantName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1 w-full"
                      disabled={isLoading || isFull}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input 
                      id="reg-phone"
                      type="tel"
                      value={registrantPhone}
                      onChange={(e) => setRegistrantPhone(e.target.value)}
                      placeholder="Contact number"
                      className="mt-1 w-full"
                      disabled={isLoading || isFull}
                    />
                  </div>
                </div>
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
                {canVolunteerDriver && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="volunteer_driver" 
                        checked={volunteerAsDriver} 
                        onCheckedChange={(checked) => setVolunteerAsDriver(!!checked)}
                        disabled={isLoading || isFull}
                      />
                      <Label htmlFor="volunteer_driver" className="text-sm">Volunteer as driver for this event</Label>
                    </div>
                    {volunteerAsDriver && (
                      <div className="pl-6">
                        <Label htmlFor="offered_seats" className="text-xs">Seats you can offer (excluding you)</Label>
                        <Input 
                          id="offered_seats" 
                          type="number" 
                          min={0}
                          value={offeredSeats}
                          onChange={(e) => setOfferedSeats(e.target.value)}
                          className="mt-1 h-8 text-sm w-28"
                        />
                      </div>
                    )}
                  </div>
                )}
            </div>
            <Button 
              className="w-full" 
              onClick={() => onRegister(indemnityAccepted, { 
                isDriver: volunteerAsDriver, 
                offeredSeats: volunteerAsDriver ? (parseInt(offeredSeats || '0', 10) || 0) : null,
                registrantName: registrantName.trim(),
                registrantPhone: registrantPhone.trim()
              })} 
              disabled={isLoading || !canRegister || !indemnityAccepted || !registrantName.trim() || !registrantPhone.trim()}
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
