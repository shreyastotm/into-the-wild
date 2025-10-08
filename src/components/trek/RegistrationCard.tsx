import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, AlertCircle, UploadCloud, User, Phone, FileText } from 'lucide-react';
import { WithStringId } from "@/integrations/supabase/client";
import { formatCurrency } from '@/lib/utils';
import { TrekEventStatus } from '@/types/trek';
import { useAuth } from '@/components/auth/AuthProvider';
import FormField from '@/components/forms/FormField';
import FormSection from '@/components/forms/FormSection';
import FormActions from '@/components/forms/FormActions';

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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
                <FormSection
                  title="Upload Payment Proof"
                  description="Please provide the payer's details and upload payment proof"
                  variant="bordered"
                  className="mt-4"
                >
                  <div className="space-y-4">
                    <FormField
                      label="Payer's Name"
                      name="registrant-name"
                      type="text"
                      value={registrantName}
                      onChange={setRegistrantName}
                      placeholder="Name of person making payment"
                      required
                      disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      icon={<User className="h-4 w-4" />}
                      helpText="This may be you or someone paying on your behalf"
                    />
                    
                    <FormField
                      label="Payer's Phone Number"
                      name="registrant-phone"
                      type="tel"
                      value={registrantPhone}
                      onChange={setRegistrantPhone}
                      placeholder="Phone number used for payment"
                      required
                      disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      icon={<Phone className="h-4 w-4" />}
                      helpText="Phone number from which payment was made"
                    />
                    
                    <FormField
                      label="Payment Proof (Screenshot/Receipt)"
                      name="payment-proof"
                      type="file"
                      onChange={(value) => setPaymentProofFile(value)}
                      required
                      disabled={isUploadingProof || !!userRegistration.payment_proof_url}
                      icon={<FileText className="h-4 w-4" />}
                      helpText="Upload image or PDF of payment receipt"
                    />
                    
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
                </FormSection>
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
            {/* Registration Form */}
            <FormSection
              title="Registration Details"
              description="Please provide your details to register for this trek"
              variant="bordered"
              className="w-full"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Your Name"
                    name="reg-name"
                    type="text"
                    value={registrantName}
                    onChange={setRegistrantName}
                    placeholder="Full name"
                    required
                    disabled={isLoading || isFull}
                    error={errors.registrantName}
                    icon={<User className="h-4 w-4" />}
                  />
                  
                  <FormField
                    label="Phone Number"
                    name="reg-phone"
                    type="tel"
                    value={registrantPhone}
                    onChange={setRegistrantPhone}
                    placeholder="Contact number"
                    required
                    disabled={isLoading || isFull}
                    error={errors.registrantPhone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>
                
                {/* Indemnity Agreement */}
                <FormField
                  label={indemnityText}
                  name="indemnity"
                  type="checkbox"
                  value={indemnityAccepted}
                  onChange={setIndemnityAccepted}
                  disabled={isLoading || isFull}
                  required
                />
                
                {/* Driver Volunteer Option */}
                {canVolunteerDriver && (
                  <div className="space-y-3">
                    <FormField
                      label="Volunteer as driver for this event"
                      name="volunteer_driver"
                      type="checkbox"
                      value={volunteerAsDriver}
                      onChange={setVolunteerAsDriver}
                      disabled={isLoading || isFull}
                    />
                    
                    {volunteerAsDriver && (
                      <FormField
                        label="Seats you can offer (excluding you)"
                        name="offered_seats"
                        type="number"
                        value={offeredSeats}
                        onChange={setOfferedSeats}
                        placeholder="0"
                        min={0}
                        disabled={isLoading || isFull}
                        error={errors.offeredSeats}
                        helpText="Number of additional passengers you can accommodate"
                      />
                    )}
                  </div>
                )}
              </div>
            </FormSection>
            
            {/* Registration Button */}
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
              {isLoading ? 'Processing...' : !canRegister ? 
                (trek.status === TrekEventStatus.REGISTRATION_CLOSED ? 'Registration Closed' : 
                 trek.status === TrekEventStatus.COMPLETED ? 'Trek Completed' : 
                 trek.status === TrekEventStatus.CANCELLED ? 'Trek Cancelled' : 
                 trek.status === TrekEventStatus.ONGOING ? 'Trek Ongoing' : 
                 isFull ? 'Trek is Full' : 'Registration Not Open') : 
                'Register Now'}
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
