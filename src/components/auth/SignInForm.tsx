import React, { Component } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormErrors } from "@/types/auth";

interface SignInFormProps {
  email: string;
  password: string;
  loading: boolean;
  errors: AuthFormErrors;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onFieldFocus: (field: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  loading,
  errors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  onFieldFocus,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6" noValidate>
      <div className="space-y-2" data-testid="signinform">
        <Label htmlFor="email" className="text-sm sm:text-base">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onFocus={() => onFieldFocus("email")}
          required
          autoComplete="email"
          placeholder="Enter your email"
          className={`w-full ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2" data-testid="signinform">
        <Label htmlFor="password" className="text-sm sm:text-base">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onFocus={() => onFieldFocus("password")}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          className={`w-full ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className="text-sm text-right" data-testid="signinform">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onForgotPassword}
          disabled={loading}
          className="h-auto p-0 text-primary hover:underline text-sm sm:text-base"
        >
          Forgot password?
        </Button>
      </div>

      {errors.general && (
        <div
          className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          data-testid="signinform"
        >
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        className="w-full text-sm sm:text-base"
        disabled={loading || !email || !password}
        size="lg"
      >
        {loading ? (
          <>
            <div
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              data-testid="signinform"
            />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
