# GA4 Setup Verification Guide

## Your Google Tag Configuration

**Measurement ID:** `G-NW4MTHFT60`

## Setup Steps

### 1. Update Your `.env.local` File

Create or update `.env.local` in the project root:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60
```

### 2. How React-GA4 Implements Google Tag

The `react-ga4` library automatically implements the Google tag (gtag.js) script. When you call `ReactGA.initialize('G-NW4MTHFT60')`, it:

1. ✅ Loads the gtag.js script: `https://www.googletagmanager.com/gtag/js?id=G-NW4MTHFT60`
2. ✅ Sets up `window.dataLayer`
3. ✅ Creates the `gtag()` function
4. ✅ Initializes with `gtag('js', new Date())`
5. ✅ Configures with `gtag('config', 'G-NW4MTHFT60')`

**This is equivalent to the Google tag snippet you provided**, but implemented in React with proper lifecycle management.

### 3. Verify the Setup

#### Check in Browser DevTools

1. Open your app in the browser
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "gtag" or "googletagmanager"
5. You should see:
   - `https://www.googletagmanager.com/gtag/js?id=G-NW4MTHFT60` (loaded successfully)

#### Check Console for Initialization

In browser console, you should see:
```
[GA4] Analytics initialized successfully
```

#### Check window.gtag

In browser console, type:
```javascript
window.gtag
```

You should see the gtag function defined.

#### Check dataLayer

In browser console, type:
```javascript
window.dataLayer
```

You should see an array with initialization events.

### 4. Verify in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (Measurement ID: G-NW4MTHFT60)
3. Go to **Reports** → **Real-Time**
4. Navigate your app - you should see:
   - Active users
   - Page views
   - Events (if you've implemented any)

### 5. Test Event Tracking

The following events are automatically tracked:

- ✅ **Page views** - Every route change
- ✅ **User identification** - When user logs in
- ✅ **Custom events** - Via the tracking hooks

## Manual Verification Script

You can run this in browser console to verify everything is working:

```javascript
// Check if gtag is loaded
console.log('gtag loaded:', typeof window.gtag === 'function');

// Check if dataLayer exists
console.log('dataLayer:', window.dataLayer);

// Check if GA4 is initialized (if using react-ga4)
console.log('GA4 initialized:', window.gtag ? 'Yes' : 'No');

// Send a test event
if (window.gtag) {
  window.gtag('event', 'test_event', {
    event_category: 'Test',
    event_label: 'Manual Verification'
  });
  console.log('Test event sent!');
}
```

## Troubleshooting

### If gtag.js is not loading:

1. **Check environment variables:**
   - Verify `VITE_ENABLE_ANALYTICS=true`
   - Verify `VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60`

2. **Check user consent:**
   - Analytics only loads if user accepts consent
   - Check `localStorage.getItem('analytics-consent')` should be `'accepted'`

3. **Check browser console:**
   - Look for any errors related to GA4
   - Check network tab for failed requests

4. **Check ad blockers:**
   - Some ad blockers prevent gtag.js from loading
   - Try disabling ad blockers temporarily

### If events are not appearing in GA4:

1. **Real-Time Reports:**
   - Events appear immediately in Real-Time reports
   - Standard reports may take 24-48 hours

2. **Measurement ID:**
   - Verify you're checking the correct property in GA4
   - Measurement ID should match: `G-NW4MTHFT60`

3. **Debug Mode:**
   - Check browser console for `[GA4]` logs
   - These only appear in development mode

## Current Implementation Details

### Script Loading

The gtag.js script is loaded dynamically via `react-ga4` when:
- ✅ Analytics is enabled (`VITE_ENABLE_ANALYTICS=true`)
- ✅ Measurement ID is provided (`VITE_GA4_MEASUREMENT_ID`)
- ✅ User has given consent

### Equivalent Google Tag Code

The following Google tag code:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-NW4MTHFT60"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-NW4MTHFT60');
</script>
```

Is automatically implemented by `react-ga4` when you call:
```typescript
ReactGA.initialize('G-NW4MTHFT60')
```

**Benefits of using react-ga4:**
- ✅ Automatic script loading
- ✅ React lifecycle management
- ✅ TypeScript support
- ✅ Better error handling
- ✅ Consent management integration

## Next Steps

1. ✅ Set environment variables in `.env.local`
2. ✅ Accept analytics consent when prompted
3. ✅ Check Real-Time reports in GA4
4. ✅ Start using tracking hooks in your components

See `docs/GA4_ANALYTICS_INTEGRATION.md` for usage examples.

