
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border">
      <div>
        <h1 className="text-xl font-bold">Your Profile</h1>
        <p className="text-sm text-gray-600">Manage your account settings</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
