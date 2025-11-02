import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Analytics Consent Component
 *
 * Displays a privacy-compliant consent banner for Google Analytics
 * Required for GDPR compliance in European markets and best practices globally
 *
 * Features:
 * - Non-intrusive design that doesn't block user experience
 * - Clear explanation of what data is collected
 * - Accept/Decline options
 * - Remembers user preference
 * - Auto-dismiss after consent given
 */
export function AnalyticsConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if analytics is enabled
    const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
    if (!analyticsEnabled) return;

    // Check if consent has been given
    const consent = localStorage.getItem("analytics-consent");
    if (!consent) {
      // Small delay to not interrupt initial page load
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("analytics-consent", "accepted");
    localStorage.setItem("analytics-consent-date", new Date().toISOString());
    setShowConsent(false);

    // Reload to initialize analytics with consent
    // Use a small delay to ensure smooth UX
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDecline = () => {
    localStorage.setItem("analytics-consent", "declined");
    localStorage.setItem("analytics-consent-date", new Date().toISOString());
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full border-2 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDecline}
            aria-label="Close consent dialog"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="pr-8">Analytics & Privacy</CardTitle>
          <CardDescription>
            We use Google Analytics to improve your experience on Into The Wild.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">What we collect:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Page views and navigation patterns to understand user journeys
              </li>
              <li>
                Trek registration and engagement data for service improvement
              </li>
              <li>
                Device and browser information for compatibility optimization
              </li>
              <li>Anonymous usage statistics (no personal identification)</li>
            </ul>
            <p className="pt-2 text-foreground">
              <strong>Your privacy matters:</strong> We anonymize IP addresses
              and do not share personal data with third parties beyond Google
              Analytics (which processes data under their privacy policy).
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-4">
          <Button onClick={handleAccept} className="flex-1" variant="default">
            Accept Analytics
          </Button>
          <Button onClick={handleDecline} variant="outline" className="flex-1">
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
