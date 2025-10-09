import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { useAuthForm } from '@/hooks/useAuthForm';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';
import { 
  UserType, 
  SubscriptionType 
} from '@/types/auth';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup'
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('community');
  const [userType, setUserType] = useState<UserType>('trekker');
  const [partnerId, setPartnerId] = useState('');
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Auth hook
  const {
    mode,
    loading,
    showReset,
    errors,
    setMode,
    setShowReset,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
    handleGoogleSignIn,
    clearError,
  } = useAuthForm();

  // Initialize mode from props on mount
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    // only on mount / changes to initialMode
  }, [initialMode, setMode]);

  // Auto-select Community plan for Micro-community account type
  useEffect(() => {
    if (userType === 'micro_community') {
      setSubscriptionType('community');
    }
  }, [userType]);

  // Event handlers
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn({ email, password });
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp({
      email,
      password,
      fullName,
      phone,
      userType,
      subscriptionType,
      partnerId,
      indemnityAccepted,
    });
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePasswordReset({ email: resetEmail });
  };

  const handleFieldFocus = (field: string) => {
    clearError(field as keyof AuthFormErrors);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {showReset ? 'Reset Password' : 
             mode === 'signin' ? 'Welcome Back' : 'Join Into The Wild'}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            {showReset ? 'Enter your email to reset your password' :
             mode === 'signin' ? 'Sign in to your account to continue' : 
             'Create an account to start your adventure'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {showReset ? (
            <PasswordResetForm
              email={resetEmail}
              loading={loading}
              errors={errors}
              onEmailChange={setResetEmail}
              onSubmit={handlePasswordResetSubmit}
              onBackToSignIn={() => setShowReset(false)}
              onFieldFocus={handleFieldFocus}
            />
          ) : mode === 'signin' ? (
            <SignInForm
              email={email}
              password={password}
              loading={loading}
              errors={errors}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSignInSubmit}
              onForgotPassword={() => setShowReset(true)}
              onFieldFocus={handleFieldFocus}
            />
          ) : (
            <SignUpForm
              email={email}
              password={password}
              fullName={fullName}
              phone={phone}
              userType={userType}
              subscriptionType={subscriptionType}
              partnerId={partnerId}
              indemnityAccepted={indemnityAccepted}
              loading={loading}
              errors={errors}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onFullNameChange={setFullName}
              onPhoneChange={setPhone}
              onUserTypeChange={setUserType}
              onSubscriptionTypeChange={setSubscriptionType}
              onPartnerIdChange={setPartnerId}
              onIndemnityChange={setIndemnityAccepted}
              onSubmit={handleSignUpSubmit}
              onFieldFocus={handleFieldFocus}
            />
          )}
        </CardContent>

        {!showReset && (
          <CardFooter className="flex-col space-y-4 px-4 sm:px-6">
            <Button 
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
              variant="link"
              className="w-full text-sm sm:text-base"
              disabled={loading}
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground bg-card">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full text-sm sm:text-base" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Connecting...
                </>
              ) : (
                'Sign in with Google'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
