# Test Signup Validation

## Try These Test Cases:

### Test Case 1: Basic Valid Data
- **Email**: test@example.com
- **Password**: Test123456 (uppercase + lowercase + number)
- **Full Name**: Test User
- **Phone**: 9876543210 (10 digits)
- **Account Type**: Trekker
- **Terms**: Checked

### Test Case 2: If Test Case 1 Fails, Try Minimal Data
- **Email**: test2@example.com
- **Password**: Password123
- **Full Name**: John Doe
- **Phone**: 1234567890
- **Account Type**: Trekker
- **Terms**: Checked

## Common Issues:

1. **Password too weak**: Must have uppercase, lowercase, and number
2. **Phone format**: Must be exactly 10 digits
3. **Name format**: Only letters, spaces, hyphens, apostrophes, periods
4. **Email already exists**: Try a different email

## Debug Steps:

1. Try the test cases above
2. If still getting 400 error, check browser console for more details
3. Look for any error messages in the UI
4. Check if all required fields are filled

## Expected Result:

After the database fix, signup should work with valid data.
