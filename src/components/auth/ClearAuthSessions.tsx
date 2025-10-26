import { AlertCircle, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "./AuthProvider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { clearAllAuthSessions, hasPersistentAuthSession } from "@/utils/clearAuthSessions";

export const ClearAuthSessions: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { user, signOut } = useAuth();
  const hasSession = hasPersistentAuthSession();

  const handleClearSessions = async () => {
    setIsClearing(true);
    try {
      // Clear sessions from storage
      clearAllAuthSessions();

      // Sign out from Supabase
      await signOut();

      toast({
        title: "Sessions Cleared",
        description: "All authentication sessions have been cleared. Please refresh the page.",
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error clearing sessions:", error);
      toast({
        title: "Error",
        description: "Failed to clear sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!hasSession && !user) {
    return null; // Don't show if no sessions to clear
  }

  return (
    <Card className="w-full max-w-md mx-auto border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          Authentication Issue
        </CardTitle>
        <CardDescription className="text-red-600">
          Persistent authentication sessions detected. This may cause automatic login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleClearSessions}
          disabled={isClearing}
          variant="destructive"
          className="w-full"
        >
          {isClearing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Clearing Sessions...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Sessions
            </>
          )}
        </Button>
        <p className="text-xs text-red-500 mt-2">
          This will sign you out and clear all stored authentication data.
        </p>
      </CardContent>
    </Card>
  );
};
