# Simple Signup Test

## Test Data (Copy exactly):
- **Email**: `test123@example.com`
- **Password**: `Password123`
- **Full Name**: `Test User`
- **Phone**: `1234567890`
- **Account Type**: `Trekker`
- **Terms**: ✅ Checked

## If Still Getting 400 Error:

### Check Browser Console:
1. Press F12 → Console tab
2. Look for any error messages
3. Look for validation errors

### Check Network Tab:
1. Press F12 → Network tab
2. Try signup
3. Find the POST request to `/auth/v1/signup`
4. Check the response for error details

### Check Supabase Auth Settings:
1. Go to Supabase Dashboard → Authentication → Settings
2. Check "Enable email confirmations" - should be OFF for testing
3. Check "Password requirements" - should match our validation
4. Check "Rate limiting" - should not be too restrictive

## Expected Result:
With the database fix, signup should work with valid data.
