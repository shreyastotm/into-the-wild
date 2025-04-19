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
  const [userType, setUserType] = useState<'trekker' | 'micro_community' | 'admin'>('trekker');
  const [partnerId, setPartnerId] = useState('');
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [verificationDocs, setVerificationDocs] = useState<File[] | null>(null);
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
        // Defensive: Ensure required fields for DB trigger
        if (!email || !password || !fullName || !subscriptionType) {
          toast({
            title: 'Missing Required Fields',
            description: 'Email, password, full name, and subscription type are required.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        // Validate subscriptionType
        const validSubscriptionTypes = ['community', 'self_service'];
        if (!validSubscriptionTypes.includes(subscriptionType)) {
          toast({
            title: 'Invalid Subscription Type',
            description: `Subscription type must be one of: ${validSubscriptionTypes.join(', ')}`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        // Handle signup
        console.log('Attempting to sign up with:', { email, fullName, phone, subscriptionType, userType, partnerId, indemnityAccepted, verificationDocs });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              subscription_type: subscriptionType,
              user_type: userType,
              partner_id: userType === 'micro_community' ? partnerId : null,
            }
          }
        });

        if (error) {
          // Show detailed error from Supabase
          toast({
            title: 'Signup Error',
            description: error.message || 'Database error saving new user',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Call Edge Function for signup automation (only if available)
        let edgeFunctionError = null;
        try {
          // Use remote URL if not localhost
          const edgeUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:54321/functions/v1/signup-automation'
            : 'https://lojnpkunoufmwwcifwan.functions.supabase.co/signup-automation';
          const edgeRes = await fetch(edgeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: data.user,
              data: {
                user_type: userType,
                partner_id: partnerId,
                indemnity_accepted: indemnityAccepted,
                verification_docs: verificationDocs
              }
            }),
          });
          if (!edgeRes.ok) {
            edgeFunctionError = `Edge Function failed: ${edgeRes.status} ${edgeRes.statusText}`;
          } else {
            try {
              const edgeJson = await edgeRes.json();
              if (edgeJson.error) {
                edgeFunctionError = edgeJson.error;
              }
            } catch {
              // ignore empty response
            }
          }
        } catch (err) {
          edgeFunctionError = 'Could not reach signup automation function.';
        }
        if (edgeFunctionError) {
          toast({
            title: 'Signup Automation Warning',
            description: edgeFunctionError,
            variant: 'destructive',
          });
        }

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form fields
        setEmail(''); setPassword(''); setFullName(''); setPhone(''); setPartnerId(''); setIndemnityAccepted(false); setVerificationDocs(null);
        
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
                  <Label htmlFor="userType">User Type</Label>
                  <Select value={userType} onValueChange={v => setUserType(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select user type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trekker">Trekker</SelectItem>
                      <SelectItem value="micro_community">Micro-Community</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {userType === 'micro_community' && (
                  <div className="space-y-2">
                    <Label htmlFor="partnerId">Partner/Community ID</Label>
                    <Input id="partnerId" type="text" value={partnerId} onChange={e => setPartnerId(e.target.value)} required />
                  </div>
                )}
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subscription type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community (₹499/year)</SelectItem>
                      <SelectItem value="self_service">Self-Service (₹99/month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input id="indemnityAccepted" type="checkbox" checked={indemnityAccepted} onChange={e => setIndemnityAccepted(e.target.checked)} required />
                  <Label htmlFor="indemnityAccepted">I accept the indemnity and terms</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verificationDocs">Verification Documents (optional)</Label>
                  <Input id="verificationDocs" type="file" multiple onChange={e => setVerificationDocs(e.target.files ? Array.from(e.target.files) : null)} />
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
