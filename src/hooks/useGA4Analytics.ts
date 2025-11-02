import { useCallback, useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

import { useBehavioralTracking } from "./useNudgeSystem";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Google Analytics 4 (GA4) Analytics Hook
 *
 * Provides comprehensive GA4 tracking with Indian market context
 * Integrates with existing behavioral tracking system
 *
 * Features:
 * - Automatic page view tracking
 * - Custom event tracking
 * - User identification
 * - Privacy-compliant (GDPR ready)
 * - Indian market context (currency, locale)
 *
 * @example
 * const { trackEvent, trackTrekRegistration } = useGA4Analytics();
 * trackTrekRegistration('trek-123', 'Himalayan Trek', 2500);
 */
// Global flag to track initialization state
let isGA4Initialized = false;

export function useGA4Analytics() {
  const location = useLocation();
  const { user, userProfile } = useAuth();

  const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

  // Initialize GA4 on mount
  useEffect(() => {
    if (!ANALYTICS_ENABLED || !GA4_MEASUREMENT_ID) {
      if (import.meta.env.DEV) {
        console.log("[GA4] Analytics disabled or measurement ID missing");
      }
      return;
    }

    // Check for user consent
    const consent = localStorage.getItem("analytics-consent");
    if (consent !== "accepted") {
      if (import.meta.env.DEV) {
        console.log("[GA4] Analytics consent not given");
      }
      return;
    }

    try {
      // Check if already initialized to prevent double initialization
      if (isGA4Initialized) {
        if (import.meta.env.DEV) {
          console.log("[GA4] Analytics already initialized");
        }
        return;
      }

      // Initialize GA4
      ReactGA.initialize(GA4_MEASUREMENT_ID, {
        // Enhanced measurement settings for Indian market
        gaOptions: {
          anonymize_ip: true, // GDPR compliance
          allow_google_signals: false, // Privacy-first
          allow_ad_personalization_signals: false,
        },
        // Global configuration
        gtagOptions: {
          send_page_view: false, // We'll track pageviews manually for better control
        },
      });

      // Set initial user properties if available
      if (user?.id && userProfile) {
        ReactGA.set({
          user_id: user.id,
          user_type: userProfile.role || "trekker",
          // Indian market context
          currency: "INR",
          country: "IN",
        });
      }

      // Mark as initialized
      isGA4Initialized = true;

      if (import.meta.env.DEV) {
        console.log("[GA4] Analytics initialized successfully");
      }
    } catch (error) {
      console.error("[GA4] Failed to initialize analytics:", error);
    }
  }, [GA4_MEASUREMENT_ID, ANALYTICS_ENABLED, user?.id, userProfile]);

  // Track page views automatically on route changes
  useEffect(() => {
    if (!ANALYTICS_ENABLED || !GA4_MEASUREMENT_ID) return;

    const consent = localStorage.getItem("analytics-consent");
    if (consent !== "accepted") return;

    try {
      // Check if GA4 is initialized before tracking
      if (!isGA4Initialized) {
        if (import.meta.env.DEV) {
          console.log(
            "[GA4] Waiting for initialization before tracking pageview",
          );
        }
        return;
      }

      // Send pageview event using react-ga4 API
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
        title: document.title,
      });

      // Set user properties with each page view
      if (user?.id && userProfile) {
        ReactGA.set({
          user_id: user.id,
          user_type: userProfile.role || "trekker",
        });
      }

      if (import.meta.env.DEV) {
        console.log("[GA4] Page view tracked:", location.pathname);
      }
    } catch (error) {
      console.error("[GA4] Failed to track page view:", error);
    }
  }, [
    location.pathname,
    location.search,
    user?.id,
    userProfile,
    GA4_MEASUREMENT_ID,
    ANALYTICS_ENABLED,
  ]);

  /**
   * Track custom events
   * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
   * @param parameters - Event parameters
   */
  const trackEvent = useCallback(
    (eventName: string, parameters: Record<string, any> = {}) => {
      if (!ANALYTICS_ENABLED || !GA4_MEASUREMENT_ID) {
        if (import.meta.env.DEV) {
          console.log("[GA4] Event tracking disabled:", eventName);
        }
        return;
      }

      const consent = localStorage.getItem("analytics-consent");
      if (consent !== "accepted") {
        if (import.meta.env.DEV) {
          console.log("[GA4] Consent required for event tracking");
        }
        return;
      }

      // Check if GA4 is initialized
      if (!isGA4Initialized) {
        if (import.meta.env.DEV) {
          console.log("[GA4] Analytics not initialized yet");
        }
        return;
      }

      try {
        // Enhanced parameters with Indian market context
        const enhancedParams = {
          ...parameters,
          user_type: userProfile?.role || "anonymous",
          device_type: navigator.userAgent.includes("Mobile")
            ? "mobile"
            : "desktop",
          timestamp: new Date().toISOString(),
          // Indian market context
          currency: "INR",
          country: "IN",
          // Page context
          page_path: location.pathname,
          page_title: document.title,
        };

        ReactGA.event(eventName, enhancedParams);

        if (import.meta.env.DEV) {
          console.log("[GA4] Event tracked:", eventName, enhancedParams);
        }
      } catch (error) {
        console.error("[GA4] Failed to track event:", error);
      }
    },
    [
      userProfile?.role,
      location.pathname,
      GA4_MEASUREMENT_ID,
      ANALYTICS_ENABLED,
    ],
  );

  /**
   * Track trek registration events
   * @param trekId - Unique trek identifier
   * @param trekName - Name of the trek
   * @param cost - Cost in INR
   */
  const trackTrekRegistration = useCallback(
    (trekId: string, trekName: string, cost: number) => {
      trackEvent("trek_registration", {
        event_category: "Trek",
        event_label: trekName,
        value: cost,
        trek_id: trekId,
        trek_name: trekName,
        cost_inr: cost,
        currency: "INR",
      });
    },
    [trackEvent],
  );

  /**
   * Track payment/purchase events
   * @param amount - Payment amount in INR
   * @param trekId - Associated trek identifier
   * @param transactionId - Optional transaction ID
   */
  const trackPaymentSuccess = useCallback(
    (amount: number, trekId: string, transactionId?: string) => {
      trackEvent("purchase", {
        event_category: "Payment",
        value: amount,
        transaction_id: transactionId || `trek_${trekId}_${Date.now()}`,
        trek_id: trekId,
        currency: "INR",
        payment_method: "bank_transfer", // Default for Indian market
      });
    },
    [trackEvent],
  );

  /**
   * Track gallery image views
   * @param imageId - Image identifier
   * @param trekName - Optional trek name for context
   */
  const trackGalleryView = useCallback(
    (imageId: string, trekName?: string) => {
      trackEvent("gallery_view", {
        event_category: "Gallery",
        event_label: trekName || "Unknown Trek",
        image_id: imageId,
        trek_name: trekName,
      });
    },
    [trackEvent],
  );

  /**
   * Track forum interactions
   * @param action - Action type (create_post, reply, like, etc.)
   * @param threadId - Optional thread identifier
   */
  const trackForumInteraction = useCallback(
    (action: string, threadId?: string) => {
      trackEvent("forum_interaction", {
        event_category: "Forum",
        event_label: action,
        action,
        thread_id: threadId,
      });
    },
    [trackEvent],
  );

  /**
   * Track profile completion progress
   * @param completionPercentage - Completion percentage (0-100)
   */
  const trackProfileCompletion = useCallback(
    (completionPercentage: number) => {
      trackEvent("profile_completion", {
        event_category: "User",
        value: completionPercentage,
        completion_percentage: completionPercentage,
      });
    },
    [trackEvent],
  );

  /**
   * Track button clicks
   * @param buttonName - Name/identifier of the button
   * @param context - Additional context
   */
  const trackButtonClick = useCallback(
    (buttonName: string, context?: Record<string, any>) => {
      trackEvent("button_click", {
        event_category: "Interaction",
        event_label: buttonName,
        button_name: buttonName,
        ...context,
      });
    },
    [trackEvent],
  );

  /**
   * Track form submissions
   * @param formName - Name of the form
   * @param success - Whether submission was successful
   * @param data - Additional form data
   */
  const trackFormSubmit = useCallback(
    (formName: string, success: boolean, data?: Record<string, any>) => {
      trackEvent("form_submit", {
        event_category: "Form",
        event_label: formName,
        form_name: formName,
        success,
        ...data,
      });
    },
    [trackEvent],
  );

  /**
   * Track navigation/link clicks
   * @param destination - Destination URL or route
   * @param linkText - Text of the link
   */
  const trackNavigation = useCallback(
    (destination: string, linkText?: string) => {
      trackEvent("navigation_click", {
        event_category: "Navigation",
        event_label: linkText || destination,
        destination,
        source_page: location.pathname,
      });
    },
    [trackEvent, location.pathname],
  );

  /**
   * Track errors
   * @param errorMessage - Error message
   * @param errorType - Type/category of error
   * @param context - Additional context
   */
  const trackError = useCallback(
    (
      errorMessage: string,
      errorType: string = "general",
      context?: Record<string, any>,
    ) => {
      trackEvent("error_occurred", {
        event_category: "Error",
        event_label: errorType,
        error_message: errorMessage,
        error_type: errorType,
        ...context,
      });
    },
    [trackEvent],
  );

  return {
    trackEvent,
    trackTrekRegistration,
    trackPaymentSuccess,
    trackGalleryView,
    trackForumInteraction,
    trackProfileCompletion,
    trackButtonClick,
    trackFormSubmit,
    trackNavigation,
    trackError,
    isEnabled: ANALYTICS_ENABLED && !!GA4_MEASUREMENT_ID,
  };
}

/**
 * Enhanced analytics hook that integrates GA4 with existing behavioral tracking
 * This allows dual tracking: GA4 for business intelligence and internal system for user insights
 */
export function useEnhancedAnalytics() {
  const ga4 = useGA4Analytics();

  // Import behavioral tracking from existing hook
  // This will be used to track events in both systems
  const { trackEvent: trackBehavioralEvent } = useBehavioralTracking();

  /**
   * Track events in both GA4 and internal behavioral system
   */
  const trackDualEvent = useCallback(
    (
      eventName: string,
      eventType: string,
      eventData: Record<string, any> = {},
    ) => {
      // Track in GA4
      ga4.trackEvent(eventName, {
        event_category: eventType,
        ...eventData,
      });

      // Track in internal behavioral system (only for authenticated users)
      trackBehavioralEvent(eventType, eventName, eventData);
    },
    [ga4, trackBehavioralEvent],
  );

  return {
    ...ga4,
    trackDualEvent,
  };
}
