
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

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

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Handle signup
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

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
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
      toast({
        title: "Error",
        description: error?.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subscription Type
              </label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="community"
                    name="subscriptionType"
                    value="community"
                    checked={subscriptionType === 'community'}
                    onChange={() => setSubscriptionType('community')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="community" className="text-sm">
                    Community (₹499/year)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="self_service"
                    name="subscriptionType"
                    value="self_service"
                    checked={subscriptionType === 'self_service'}
                    onChange={() => setSubscriptionType('self_service')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="self_service" className="text-sm">
                    Self-Service (₹99/month)
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
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
      </form>

      <div className="mt-4 text-center">
        <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
