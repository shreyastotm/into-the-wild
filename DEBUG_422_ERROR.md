# Debug 422 Signup Error

## Test with Minimal Data

Try these exact values for signup:

### Test Case 1: Basic Valid Data
- **Email**: `test@example.com`
- **Password**: `Test123456`
- **Full Name**: `Test User`
- **Phone**: `9876543210`
- **Account Type**: `Trekker`
- **Terms**: ✅ Checked

### Test Case 2: If Test Case 1 Fails
- **Email**: `test2@example.com`
- **Password**: `Password123`
- **Full Name**: `John Doe`
- **Phone**: `1234567890`
- **Account Type**: `Trekker`
- **Terms**: ✅ Checked

## Check Browser DevTools

1. **Press F12** to open DevTools
2. **Go to Network tab**
3. **Clear the network log**
4. **Try to sign up**
5. **Find the POST request** to `/auth/v1/signup`
6. **Click on it** to see:
   - **Request payload** - what data is being sent
   - **Response** - what error message is returned

## Common 422 Causes

1. **Email already exists** - try a different email
2. **Password too weak** - must have uppercase, lowercase, and number
3. **Phone format invalid** - must be exactly 10 digits
4. **Name format invalid** - only letters, spaces, hyphens, apostrophes, periods
5. **Terms not accepted** - make sure checkbox is checked

## Expected Result

After the database fix, signup should work with valid data.
