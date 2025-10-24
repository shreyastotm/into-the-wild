import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormErrors } from "@/types/auth";

interface PasswordResetFormProps {
  email: string;
  loading: boolean;
  errors: AuthFormErrors;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSignIn: () => void;
  onFieldFocus: (field: string) => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  email,
  loading,
  errors,
  onEmailChange,
  onSubmit,
  onBackToSignIn,
  onFieldFocus,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2" data-testid="passwordresetform">
        <Label htmlFor="resetEmail">Email Address</Label>
        <Input
          id="resetEmail"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onFocus={() => onFieldFocus("email")}
          required
          autoComplete="email"
          placeholder="Enter your email to reset password"
          className={errors.email ? "border-red-500 focus:border-red-500" : ""}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          We'll send you a link to reset your password
        </p>
      </div>

      {errors.general && (
        <div
          className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
          role="alert"
         data-testid="passwordresetform">
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !email}
        size="lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" data-testid="passwordresetform"></div>
            Sending reset link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBackToSignIn}
        disabled={loading}
      >
        Back to Sign In
      </Button>
    </form>
  );
};
