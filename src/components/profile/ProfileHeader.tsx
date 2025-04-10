
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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <Button variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
