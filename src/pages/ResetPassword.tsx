import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkRecovery = async () => {
      const params = new URLSearchParams(location.search);
      if (params.get("type") === "recovery") {
        // Remove any existing Supabase session to prevent auto-login
        await supabase.auth.signOut();
        // Additionally, clear Supabase auth tokens from storage for extra safety
        localStorage.removeItem("supabase.auth.token");
        sessionStorage.removeItem("supabase.auth.token");
        setShowForm(true);
      } else {
        setShowForm(false);
      }
      setRecoveryChecked(true);
    };
    checkRecovery();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your new password.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Password Reset",
        description: "Your password has been reset. Please sign in.",
      });
      // Remove any lingering Supabase auth tokens after password reset
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");
      navigate("/auth");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-12">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recoveryChecked ? (
          showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block font-medium mb-1">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-medium mb-1"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          ) : (
            <div className="text-center text-gray-600">
              Invalid or expired password reset link.
            </div>
          )
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Back to Sign In
        </Button>
      </CardFooter>
    </Card>
  );
}
