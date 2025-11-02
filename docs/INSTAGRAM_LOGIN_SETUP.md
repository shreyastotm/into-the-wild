# Instagram Login Setup Guide

## Overview

Instagram login has been implemented using Facebook OAuth (since Instagram is owned by Meta/Facebook). This allows users to sign in with their Instagram accounts through Facebook's authentication system.

## Implementation Status

✅ **Code Changes Completed:**

- Added Facebook OAuth configuration to `supabase/config.toml`
- Added Instagram sign-in handler to `src/hooks/useAuthForm.ts`
- Added Instagram button to `src/components/auth/AuthForm.tsx`
- Updated `env.sample` with documentation

## Next Steps: Facebook App Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click **"Create App"**
3. Select **"Consumer"** as app type
4. Fill in app details:
   - **App Name**: Into The Wild
   - **App Contact Email**: Your email
   - **Business Account**: (Optional) Select if you have one
5. Click **"Create App"**

### Step 2: Configure Facebook Login

1. In your app dashboard, find **"Facebook Login"** product
2. Click **"Set Up"** and select **"Web"**
3. Go to **Settings** → **Basic**:
   - **App Domains**: `intothewild.club`
   - **Privacy Policy URL**: Your privacy policy URL
   - **User Data Deletion**: Your data deletion callback URL
   - **Site URL**: `https://www.intothewild.club`

4. Go to **Settings** → **Basic** → **"Add Platform"**:
   - Select **"Website"**
   - **Site URL**: `https://www.intothewild.club`

5. Go to **Settings** → **Advanced**:
   - **Valid OAuth Redirect URIs**: Add these URLs:
     ```
     https://www.intothewild.club/
     https://www.intothewild.club/auth/callback
     https://lojnpkunoufmwwcifwan.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     http://localhost:5173/
     ```

### Step 3: Configure Instagram Permissions

**Note**: The current implementation uses Facebook OAuth with standard scopes (`email`, `public_profile`). This allows users to authenticate with Facebook accounts (including accounts linked to Instagram).

**For Instagram-specific features** (like accessing Instagram posts/photos), you'll need:

1. **Instagram Basic Display API**: For personal accounts
   - Requires separate OAuth flow
   - Users must connect Instagram account to Facebook
2. **Instagram Graph API**: For business accounts
   - Requires Facebook Page connection
   - More complex setup process

**Current Implementation**: Uses Facebook OAuth for authentication. Users can sign in with Facebook accounts, and if they have Instagram connected, you can add Instagram-specific features later.

If you want to add Instagram-specific features:

1. Set up Instagram Basic Display API or Graph API
2. Implement separate Instagram OAuth flow
3. Request Instagram-specific permissions after Facebook authentication

### Step 4: Get Credentials

1. Go to **Settings** → **Basic** in your Facebook app dashboard
2. Note down:
   - **App ID** → This is your `SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID`
   - **App Secret** → Click "Show" and copy → This is your `SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET`

### Step 5: Configure Supabase

#### For Local Development (supabase/config.toml):

Already configured! The file includes:

```toml
[auth.external.facebook]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET)"
redirect_uri = "https://www.intothewild.club/"
```

#### For Production (Supabase Dashboard):

1. Go to your Supabase Dashboard → **Authentication** → **Providers**
2. Find **Facebook** provider
3. Enable it
4. Add your credentials:
   - **Client ID (App ID)**: Your Facebook App ID
   - **Client Secret**: Your Facebook App Secret
5. **Redirect URL**: `https://www.intothewild.club/`
6. Click **"Save"**

### Step 6: Set Environment Variables

#### For Local Supabase:

Set these in your local environment or `.env` file:

```bash
SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID=your_facebook_app_id
SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET=your_facebook_app_secret
```

#### For Production:

Set these in Supabase Dashboard → **Settings** → **API** → **Environment Variables**

## Testing

### Local Testing:

1. Start your local Supabase instance:
   ```bash
   npx supabase start
   ```
2. Ensure environment variables are set
3. Test the Instagram login button on your auth page
4. Verify redirect URI matches your Facebook app settings

### Production Testing:

1. Ensure Facebook app is in **Live Mode** (or use Test Users during development)
2. Test Instagram login flow
3. Verify user profile creation after login
4. Test Instagram account linking

## Important Notes

### Facebook App Review

- For production use, your Facebook app may need to go through **App Review**
- During development, you can add test users without review
- Go to **Roles** → **Test Users** to create test accounts

### Instagram Account Requirements

- Users must have their Instagram account connected to Facebook
- Users may need to authorize Instagram permissions separately
- Business accounts require Facebook Page connection

### Privacy & Compliance

- Update your Privacy Policy to mention Instagram/Facebook data collection
- Ensure GDPR compliance for Indian users
- Document data usage in your Terms of Service

### Error Handling

The implementation includes:

- Rate limiting (5 attempts per 15 minutes)
- Error logging and user-friendly error messages
- Proper OAuth callback handling
- Session management

## Troubleshooting

### Common Issues:

1. **"Invalid OAuth Redirect URI"**
   - Ensure redirect URIs match exactly in Facebook app settings
   - Check Supabase redirect URI configuration

2. **"App Not Setup"**
   - Ensure Facebook Login product is added to your app
   - Verify app is in Development or Live mode

3. **"Instagram Permissions Not Granted"**
   - Users must connect Instagram to Facebook first
   - Business accounts need Facebook Page connection

4. **"Rate Limit Exceeded"**
   - Implementation includes rate limiting (5 attempts per 15 minutes)
   - Wait before retrying

## Files Modified

1. `supabase/config.toml` - Added Facebook OAuth configuration
2. `src/hooks/useAuthForm.ts` - Added `handleInstagramSignIn` function
3. `src/components/auth/AuthForm.tsx` - Added Instagram login button
4. `env.sample` - Added documentation for OAuth credentials

## Next Steps After Setup

1. Test Instagram login flow
2. Verify user profile creation
3. Test Instagram account linking
4. Update privacy policy and terms of service
5. Monitor authentication logs for issues
6. Consider adding Instagram profile picture import feature

## Support Resources

- [Facebook Developers Documentation](https://developers.facebook.com/docs/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Facebook App Review Guide](https://developers.facebook.com/docs/app-review/)
