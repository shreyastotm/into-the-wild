# Google Analytics 4 (GA4) Integration Guide

## Overview

This guide explains how to use GA4 analytics tracking in the Into The Wild application. The analytics system is designed with privacy compliance (GDPR) and Indian market context in mind.

## Quick Start

### 1. Setup Environment Variables

Add to your `.env.local` file:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Get your GA4 Measurement ID:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create or select your property
3. Navigate to Admin → Data Streams
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

### 2. User Consent

The `AnalyticsConsent` component automatically appears when:
- Analytics is enabled (`VITE_ENABLE_ANALYTICS=true`)
- User hasn't given consent yet

Users can accept or decline analytics. The preference is stored in `localStorage`.

## Usage Examples

### Basic Event Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function MyComponent() {
  const { trackEvent } = useGA4Analytics();

  const handleButtonClick = () => {
    trackEvent('button_click', {
      event_category: 'Interaction',
      button_name: 'Register Now',
      page_location: window.location.pathname
    });
  };

  return <button onClick={handleButtonClick}>Register</button>;
}
```

### Trek Registration Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function TrekRegistrationForm() {
  const { trackTrekRegistration } = useGA4Analytics();

  const handleRegistration = async (trekData: TrekEvent) => {
    // Track registration in GA4
    trackTrekRegistration(
      trekData.id,
      trekData.name,
      trekData.cost // Amount in INR
    );

    // Your existing registration logic...
    await registerForTrek(trekData);
  };

  return (
    <form onSubmit={handleRegistration}>
      {/* Form fields */}
    </form>
  );
}
```

### Payment Success Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function PaymentConfirmation({ trekId, amount, transactionId }: PaymentProps) {
  const { trackPaymentSuccess } = useGA4Analytics();

  useEffect(() => {
    // Track when payment is confirmed
    trackPaymentSuccess(amount, trekId, transactionId);
  }, [amount, trekId, transactionId, trackPaymentSuccess]);

  return <div>Payment confirmed!</div>;
}
```

### Gallery Image View Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function GalleryImage({ image, trekName }: ImageProps) {
  const { trackGalleryView } = useGA4Analytics();

  const handleImageClick = () => {
    trackGalleryView(image.id, trekName);
    // Show image modal or lightbox
  };

  return (
    <img 
      src={image.url} 
      onClick={handleImageClick}
      alt={trekName}
    />
  );
}
```

### Forum Interaction Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function ForumThread({ threadId }: ThreadProps) {
  const { trackForumInteraction } = useGA4Analytics();

  const handleReply = async () => {
    trackForumInteraction('reply', threadId);
    // Submit reply
  };

  const handleLike = () => {
    trackForumInteraction('like', threadId);
    // Toggle like
  };

  return (
    <div>
      <button onClick={handleReply}>Reply</button>
      <button onClick={handleLike}>Like</button>
    </div>
  );
}
```

### Dual Tracking (GA4 + Internal System)

For critical events that need both GA4 and internal behavioral tracking:

```typescript
import { useEnhancedAnalytics } from '@/hooks/useGA4Analytics';

function ImportantFeature() {
  const { trackDualEvent } = useEnhancedAnalytics();

  const handleCriticalAction = () => {
    // Tracks in both GA4 and internal behavioral system
    trackDualEvent('critical_action', 'Feature', {
      feature_name: 'Trek Registration',
      user_type: 'premium'
    });
  };

  return <button onClick={handleCriticalAction}>Action</button>;
}
```

### Navigation Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function NavigationLink({ to, children }: LinkProps) {
  const { trackNavigation } = useGA4Analytics();

  const handleClick = () => {
    trackNavigation(to, children);
    // Navigate to route
  };

  return <a onClick={handleClick}>{children}</a>;
}
```

### Form Submission Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function ContactForm() {
  const { trackFormSubmit } = useGA4Analytics();

  const handleSubmit = async (data: FormData) => {
    try {
      await submitForm(data);
      trackFormSubmit('contact_form', true, {
        form_type: 'contact',
        fields_completed: Object.keys(data).length
      });
    } catch (error) {
      trackFormSubmit('contact_form', false, {
        error_message: error.message
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Error Tracking

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function ErrorBoundary({ error }: ErrorProps) {
  const { trackError } = useGA4Analytics();

  useEffect(() => {
    if (error) {
      trackError(error.message, 'error_boundary', {
        component_name: error.componentStack,
        user_agent: navigator.userAgent
      });
    }
  }, [error, trackError]);

  return <div>Something went wrong</div>;
}
```

## Available Tracking Methods

### `useGA4Analytics()` Hook

Returns an object with the following methods:

| Method | Description | Parameters |
|--------|-------------|------------|
| `trackEvent` | Generic event tracking | `(eventName: string, parameters?: object)` |
| `trackTrekRegistration` | Track trek registrations | `(trekId: string, trekName: string, cost: number)` |
| `trackPaymentSuccess` | Track payment completion | `(amount: number, trekId: string, transactionId?: string)` |
| `trackGalleryView` | Track gallery image views | `(imageId: string, trekName?: string)` |
| `trackForumInteraction` | Track forum actions | `(action: string, threadId?: string)` |
| `trackProfileCompletion` | Track profile completion | `(completionPercentage: number)` |
| `trackButtonClick` | Track button clicks | `(buttonName: string, context?: object)` |
| `trackFormSubmit` | Track form submissions | `(formName: string, success: boolean, data?: object)` |
| `trackNavigation` | Track navigation clicks | `(destination: string, linkText?: string)` |
| `trackError` | Track errors | `(errorMessage: string, errorType?: string, context?: object)` |
| `isEnabled` | Check if analytics is enabled | `boolean` |

### `useEnhancedAnalytics()` Hook

Same as `useGA4Analytics()` but also includes:

- `trackDualEvent`: Tracks events in both GA4 and internal behavioral system

## Automatic Tracking

The following events are tracked automatically:

1. **Page Views**: Every route change is tracked automatically
2. **User Identification**: User ID is automatically set when user logs in
3. **User Properties**: User role (trekker, admin, partner) is set automatically

## Indian Market Context

All events include Indian market context:

- Currency: `INR`
- Country: `IN`
- Device type: `mobile` or `desktop`
- Date formats: DD/MM/YYYY

## Privacy & GDPR Compliance

### Consent Management

- Users must accept analytics consent before tracking begins
- Consent is stored in `localStorage` with timestamp
- Analytics automatically disabled if consent is declined

### Privacy Features

- IP anonymization enabled by default
- Google signals disabled (privacy-first)
- Ad personalization disabled
- No personal data shared with third parties beyond Google Analytics

### User Rights

Users can:
- Accept or decline analytics on first visit
- Revoke consent by clearing `localStorage`
- View privacy policy in consent dialog

## Development Mode

In development mode (`import.meta.env.DEV`):
- GA4 status indicator appears in bottom-right corner
- Console logs show tracked events for debugging
- Consent dialog appears after 2 seconds

## Testing

### Test GA4 Integration

1. Set `VITE_ENABLE_ANALYTICS=true` in `.env.local`
2. Add your GA4 Measurement ID
3. Start dev server: `npm run dev`
4. Accept analytics consent when prompted
5. Check browser console for `[GA4]` logs
6. Verify events in Google Analytics Real-Time reports

### Verify Events in GA4

1. Go to Google Analytics → Reports → Real-Time
2. Perform actions in your app
3. Events should appear within seconds

## Best Practices

1. **Track Meaningful Events**: Only track user actions that provide business value
2. **Use Descriptive Names**: Event names should clearly describe the action
3. **Include Context**: Always include relevant context in event parameters
4. **Respect Privacy**: Don't track sensitive data (passwords, payment details)
5. **Test in Development**: Verify tracking works before deploying

## Troubleshooting

### Analytics Not Working

1. Check `VITE_ENABLE_ANALYTICS=true` in `.env.local`
2. Verify `VITE_GA4_MEASUREMENT_ID` is set correctly
3. Ensure user has accepted consent
4. Check browser console for errors
5. Verify GA4 Measurement ID format: `G-XXXXXXXXXX`

### Events Not Appearing in GA4

1. Wait 24-48 hours for standard reports (Real-Time should show immediately)
2. Check Real-Time reports to verify tracking
3. Ensure consent was accepted
4. Check browser ad-blockers (may block GA4)

### Consent Dialog Not Appearing

1. Clear `localStorage` in browser DevTools
2. Check `VITE_ENABLE_ANALYTICS=true`
3. Refresh page
4. Check browser console for errors

## Integration with Existing Analytics

The GA4 system integrates with your existing behavioral tracking:

- Both systems can track events simultaneously using `useEnhancedAnalytics()`
- Internal behavioral tracking (in `user_interactions` table) continues to work
- GA4 provides business intelligence, internal system provides user insights

## References

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [React GA4 Library](https://github.com/codler/react-ga4)
- [GDPR Compliance Guidelines](https://gdpr.eu/)

