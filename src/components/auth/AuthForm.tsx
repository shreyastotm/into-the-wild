import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type AuthMode = 'signin' | 'signup';

export default function AuthForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<'community' | 'self_service'>('community');
  const [resetting, setResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Handle signup
        console.log('Attempting to sign up with:', { email, fullName, phone, subscriptionType });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              subscription_type: subscriptionType
            }
          }
        });

        if (error) throw error;

        console.log('Signup successful:', data);
        
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form fields
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        
        // Navigate to profile page
        navigate('/profile');
      } else {
        // Handle signin
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error("Auth error details:", error);
      toast({
        title: "Error",
        description: error?.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a password reset link.',
      });
      setShowReset(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'signin' 
            ? 'Enter your credentials to access your account' 
            : 'Join the trekking community today'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={resetting}>
              {resetting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowReset(false)}>
              Back to Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">Subscription Type</Label>
                  <Select 
                    value={subscriptionType}
                    onValueChange={(value) => setSubscriptionType(value as 'community' | 'self_service')}
                  >
                    <SelectTrigger id="subscriptionType">
                      <SelectValue placeholder="Select a subscription type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community (₹499/year)</SelectItem>
                      <SelectItem value="self_service">Self-Service (₹99/month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
            {mode === 'signin' && (
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline mt-2 w-full"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
            )}
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </CardFooter>
    </Card>
  );
}
