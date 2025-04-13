
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, AlertCircle } from 'lucide-react';
import { WithStringId } from "@/integrations/supabase/client";

interface DbRegistration {
  registration_id: number;
  trek_id: number;
  user_id: number;
  booking_datetime: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  cancellation_datetime?: string | null;
  penalty_applied?: number | null;
  created_at?: string | null;
}

interface RegistrationCardProps {
  trek: {
    trek_id: number;
    max_participants: number;
    current_participants: number | null;
    cost: number;
  };
  userRegistration: WithStringId<DbRegistration> | null;
  onRegister: () => Promise<boolean>;
  onCancel: () => Promise<boolean>;
  isLoading: boolean;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  trek,
  userRegistration,
  onRegister,
  onCancel,
  isLoading
}) => {
  const availableSpots = trek.max_participants - (trek.current_participants || 0);
  const spotsFillPercent = ((trek.current_participants || 0) / trek.max_participants) * 100;
  const isFull = availableSpots <= 0;
  
  return (
    <Card className="sticky top-6">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Registration</span>
          <span className="text-2xl">${trek.cost}</span>
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
              <span>{trek.current_participants || 0} registered</span>
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
                <p className="text-sm text-amber-700 mt-2">Payment status: Pending</p>
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
          userRegistration.payment_status !== 'Cancelled' && (
            <Button variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Cancel Registration'}
            </Button>
          )
        ) : (
          <Button 
            className="w-full" 
            onClick={onRegister} 
            disabled={isLoading || isFull}
          >
            {isLoading ? 'Processing...' : isFull ? 'Trek is Full' : 'Register Now'}
          </Button>
        )}
        
        <p className="text-xs text-center text-gray-500 mt-2">
          By registering, you agree to the trek's cancellation policy.
        </p>
      </CardFooter>
    </Card>
  );
};
