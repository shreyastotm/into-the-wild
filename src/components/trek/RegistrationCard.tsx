
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RegistrationCardProps {
  cost: number;
  maxParticipants: number;
  currentParticipants: number | null;
  isRegistered: boolean;
  isCancelled: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  registering: boolean;
  onRegister: () => void;
  onCancel: () => void;
  paymentStatus?: string;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  cost,
  maxParticipants,
  currentParticipants = 0,
  isRegistered,
  isCancelled,
  isFull,
  isLoggedIn,
  registering,
  onRegister,
  onCancel,
  paymentStatus
}) => {
  const navigate = useNavigate();
  
  const handleRegister = () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    onRegister();
  };
  
  return (
    <div>
      <p className="text-3xl font-bold mb-4">₹{cost}</p>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Available:</span> {maxParticipants - (currentParticipants || 0)} spots left
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((currentParticipants || 0) / maxParticipants) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {isRegistered && !isCancelled ? (
        <>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800">
              You're registered for this trek!
            </p>
            <p className="text-sm text-green-600">
              Payment Status: <span className="font-medium">{paymentStatus}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onCancel}
            disabled={registering}
          >
            {registering ? 'Processing...' : 'Cancel Registration'}
          </Button>
        </>
      ) : isCancelled ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-gray-800">
            Your registration was cancelled
          </p>
        </div>
      ) : (
        <Button 
          className="w-full"
          onClick={handleRegister}
          disabled={isFull || registering || !isLoggedIn}
        >
          {registering ? 'Processing...' : isFull ? 'Trek Full' : 'Register Now'}
        </Button>
      )}
      
      {!isLoggedIn && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Please log in to register for this trek
        </p>
      )}
    </div>
  );
};
