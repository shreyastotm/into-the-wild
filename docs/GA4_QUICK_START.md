# GA4 Quick Start Guide - G-NW4MTHFT60

## ✅ Setup Complete!

Your Google Tag (gtag.js) is configured with Measurement ID: **G-NW4MTHFT60**

## How It Works

The implementation automatically handles the Google tag setup:

### What Happens Behind the Scenes

When `ReactGA.initialize('G-NW4MTHFT60')` is called, it automatically:

1. ✅ Loads: `https://www.googletagmanager.com/gtag/js?id=G-NW4MTHFT60`
2. ✅ Sets up: `window.dataLayer = []`
3. ✅ Creates: `window.gtag()` function
4. ✅ Initializes: `gtag('js', new Date())`
5. ✅ Configures: `gtag('config', 'G-NW4MTHFT60')`

**This is exactly equivalent to the Google tag snippet you provided!**

## Next Steps

### 1. Add to `.env.local`

Create `.env.local` in project root:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Accept Analytics Consent

When you load the app:

1. Wait 2 seconds for consent dialog
2. Click "Accept Analytics"
3. Page will reload and GA4 will initialize

### 4. Verify It's Working

Open browser DevTools Console, you should see:

```
[GA4] Analytics initialized successfully
[GA4] Page view tracked: /
```

### 5. Check Real-Time Reports

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select property with ID: **G-NW4MTHFT60**
3. Navigate to **Reports** → **Real-Time**
4. You should see your active session!

## Verification Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Development server restarted
- [ ] Consent accepted
- [ ] Console shows initialization message
- [ ] Real-Time reports show your session
- [ ] Network tab shows gtag.js loaded

## Manual Verification (Browser Console)

Run this to verify everything:

```javascript
// Check gtag.js is loaded
console.log("✅ gtag loaded:", typeof window.gtag === "function");

// Check dataLayer exists
console.log("✅ dataLayer:", window.dataLayer?.length || 0, "items");

// Check GA4 config
console.log("✅ Measurement ID:", "G-NW4MTHFT60");

// Send test event
if (window.gtag) {
  window.gtag("event", "test_setup", {
    event_category: "Setup",
    event_label: "Manual Verification",
  });
  console.log("✅ Test event sent! Check GA4 Real-Time reports.");
}
```

## You're All Set! 🎉

Your Google Tag is configured and ready to track:

- ✅ Page views (automatic)
- ✅ User interactions (via hooks)
- ✅ Custom events (via tracking methods)

See `docs/GA4_ANALYTICS_INTEGRATION.md` for detailed usage examples.
