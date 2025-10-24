import React, { Component } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserType,
  SubscriptionType,
  AuthFormErrors,
  SUBSCRIPTION_PRICING,
  USER_TYPE_DESCRIPTIONS,
} from "@/types/auth";

interface SignUpFormProps {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: UserType;
  subscriptionType: SubscriptionType;
  partnerId: string;
  indemnityAccepted: boolean;
  loading: boolean;
  errors: AuthFormErrors;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onPhoneChange: (phone: string) => void;
  onUserTypeChange: (userType: UserType) => void;
  onSubscriptionTypeChange: (subscriptionType: SubscriptionType) => void;
  onPartnerIdChange: (partnerId: string) => void;
  onIndemnityChange: (accepted: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldFocus: (field: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  password,
  fullName,
  phone,
  userType,
  subscriptionType,
  partnerId,
  indemnityAccepted,
  loading,
  errors,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onPhoneChange,
  onUserTypeChange,
  onSubscriptionTypeChange,
  onPartnerIdChange,
  onIndemnityChange,
  onSubmit,
  onFieldFocus,
}) => {
  // Handle user type change and auto-select subscription
  const handleUserTypeChange = (newUserType: UserType) => {
    onUserTypeChange(newUserType);
    // Auto-select Community plan for Micro-community account type
    if (newUserType === "micro_community") {
      onSubscriptionTypeChange("community");
    }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6" noValidate>
      {/* User Type Selection */}
      <div className="space-y-2" data-testid="signupform">
        <Label htmlFor="userType" className="text-sm sm:text-base">
          Account Type
        </Label>
        <Select
          value={userType}
          onValueChange={handleUserTypeChange}
          disabled={loading}
        >
          <SelectTrigger id="userType" className="w-full">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trekker">
              <div className="flex flex-col" data-testid="signupform">
                <span className="font-medium">Trekker</span>
                <span className="text-xs text-muted-foreground">
                  {USER_TYPE_DESCRIPTIONS.trekker}
                </span>
              </div>
            </SelectItem>
            <SelectItem value="micro_community">
              <div className="flex flex-col" data-testid="signupform">
                <span className="font-medium">Micro-Community</span>
                <span className="text-xs text-muted-foreground">
                  {USER_TYPE_DESCRIPTIONS.micro_community}
                </span>
              </div>
            </SelectItem>
            <SelectItem value="admin">
              <div className="flex flex-col" data-testid="signupform">
                <span className="font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">
                  {USER_TYPE_DESCRIPTIONS.admin}
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partner ID for micro communities */}
      {userType === "micro_community" && (
        <div className="space-y-2" data-testid="signupform">
          <Label htmlFor="partnerId" className="text-sm sm:text-base">
            Community/Partner ID
          </Label>
          <Input
            id="partnerId"
            type="text"
            value={partnerId}
            onChange={(e) => onPartnerIdChange(e.target.value)}
            onFocus={() => onFieldFocus("partnerId")}
            required
            placeholder="Enter your community ID"
            className={`w-full ${errors.partnerId ? "border-red-500 focus:border-red-500" : ""}`}
            disabled={loading}
          />
          {errors.partnerId && (
            <p className="text-sm text-red-600" role="alert">
              {errors.partnerId}
            </p>
          )}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2" data-testid="signupform">
        <Label htmlFor="fullName" className="text-sm sm:text-base">
          Full Name
        </Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          onFocus={() => onFieldFocus("fullName")}
          required
          autoComplete="name"
          placeholder="Enter your full name"
          className={`w-full ${errors.fullName ? "border-red-500 focus:border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2" data-testid="signupform">
        <Label htmlFor="phone" className="text-sm sm:text-base">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onFocus={() => onFieldFocus("phone")}
          required
          autoComplete="tel"
          placeholder="Enter 10-digit phone number"
          className={`w-full ${errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
          disabled={loading}
          maxLength={10}
        />
        {errors.phone && (
          <p className="text-sm text-red-600" role="alert">
            {errors.phone}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: 10 digits without +91 (e.g., 9876543210)
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2" data-testid="signupform">
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

      {/* Password */}
      <div className="space-y-2" data-testid="signupform">
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
          autoComplete="new-password"
          placeholder="Create a strong password"
          className={`w-full ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Must contain at least 8 characters with uppercase, lowercase, and
          numbers
        </p>
        {/* Password strength indicator (lightweight) */}
        {password && (
          <div className="flex items-center gap-2" data-testid="signupform">
            {(() => {
              const hasLen = password.length >= 8;
              const hasUpper = /[A-Z]/.test(password);
              const hasLower = /[a-z]/.test(password);
              const hasNum = /\d/.test(password);
              const score = [hasLen, hasUpper, hasLower, hasNum].filter(
                Boolean,
              ).length;
              const labels = ["Very weak", "Weak", "Okay", "Strong"];
              const colors = [
                "bg-red-500",
                "bg-amber-500",
                "bg-blue-500",
                "bg-green-600",
              ];
              return (
                <>
                  <div className="flex gap-1" aria-hidden data-testid="signupform">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-8 rounded ${i < score ? colors[score - 1] : "bg-gray-200"}`}
                      ></span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {labels[Math.max(0, score - 1)]}
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Subscription Type */}
      <div className="space-y-2" data-testid="signupform">
        <Label htmlFor="subscriptionType" className="text-sm sm:text-base">
          Subscription Plan
        </Label>
        <Select
          value={subscriptionType}
          onValueChange={onSubscriptionTypeChange}
          disabled={loading || userType === "micro_community"}
        >
          <SelectTrigger id="subscriptionType" className="w-full">
            <SelectValue placeholder="Select a subscription plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="community">
              <div className="flex flex-col" data-testid="signupform">
                <span className="font-medium">Community - Free</span>
                <span className="text-xs text-muted-foreground">
                  {SUBSCRIPTION_PRICING.community.features.join(", ")}
                </span>
              </div>
            </SelectItem>
            <SelectItem value="self_service" disabled>
              <div className="flex flex-col" data-testid="signupform">
                <span className="font-medium text-muted-foreground">
                  Self-Service - Free (Not Currently Available)
                </span>
                <span className="text-xs text-muted-foreground">
                  {SUBSCRIPTION_PRICING.self_service.note}
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {userType === "micro_community" && (
          <p className="text-xs text-blue-600">
            Community plan is automatically selected for Micro-community
            accounts
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2" data-testid="signupform">
        <Checkbox
          id="indemnityAccepted"
          checked={indemnityAccepted}
          onCheckedChange={onIndemnityChange}
          disabled={loading}
          className={errors.indemnityAccepted ? "border-red-500" : ""}
        />
        <div className="grid gap-1.5 leading-none" data-testid="signupform">
          <Label
            htmlFor="indemnityAccepted"
            className="text-xs sm:text-sm font-normal leading-normal cursor-pointer"
          >
            I accept the{" "}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary underline text-xs sm:text-sm"
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary underline text-xs sm:text-sm"
            >
              Privacy Policy
            </Button>
            , including the indemnity clause for adventure activities.
          </Label>
          {errors.indemnityAccepted && (
            <p className="text-sm text-red-600" role="alert">
              {errors.indemnityAccepted}
            </p>
          )}
        </div>
      </div>

      {errors.general && (
        <div
          className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
          role="alert"
         data-testid="signupform">
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        className="w-full text-sm sm:text-base"
        disabled={
          loading ||
          !email ||
          !password ||
          !fullName ||
          !phone ||
          !indemnityAccepted
        }
        size="lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" data-testid="signupform"></div>
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};
