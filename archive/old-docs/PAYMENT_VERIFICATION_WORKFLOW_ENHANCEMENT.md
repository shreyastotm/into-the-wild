# Payment Verification Workflow Enhancement

## Overview

Enhanced the trek registration payment verification workflow to capture registrant details separately from user account details, allowing for cases where:

- One person pays on behalf of multiple registrants
- Payment is made from a different phone number than registered account
- Better admin verification workflow similar to ID verification

## Changes Implemented

### 1. Database Schema Updates

**Migration File**: `supabase/migrations/20251008000000_add_registrant_details_to_trek_registrations.sql`

Added two new columns to `trek_registrations` table:

- `registrant_name VARCHAR(255)` - Name of the person making the payment
- `registrant_phone VARCHAR(20)` - Phone number used for payment

These fields can differ from the user's account details, accommodating scenarios where:

- A parent/friend pays for someone else
- Payment is made from a shared account
- One person registers multiple people

### 2. Frontend Updates

#### Registration Form (`src/components/trek/RegistrationCard.tsx`)

**New Features**:

- ✅ Pre-fills registrant name and phone from user profile
- ✅ Allows editing these details before registration
- ✅ Requires both name and phone before registration
- ✅ Captures payer details during payment proof upload
- ✅ Validates all fields before submission

**User Flow**:

1. User fills in their name and phone (pre-filled from profile)
2. User accepts indemnity agreement
3. User clicks "Register Now"
4. After registration, user provides:
   - Payer's name (can be different from account name)
   - Payer's phone number (can be different from account phone)
   - Payment proof screenshot/receipt
5. All details uploaded together

#### Registration Hook (`src/hooks/trek/useTrekRegistration.ts`)

**Updates**:

- `registerForTrek()` now accepts `registrantName` and `registrantPhone` in options
- `uploadPaymentProof()` now requires registrant details
- Payment status automatically set to `ProofUploaded` after successful upload
- Validation for all required fields

### 3. Admin Panel Enhancement (`src/pages/admin/EventRegistrations.tsx`)

**Complete Redesign** - Now similar to ID Verification workflow:

#### Table View Features:

- ✅ Shows user account details (name, email from `users` table)
- ✅ Shows registrant/payer details (name, phone from registration)
- ✅ Color-coded status badges
- ✅ Quick "View" button for payment proof
- ✅ Filterable by status and trek ID
- ✅ Real-time updates after actions

#### Payment Review Modal:

- ✅ **Dual information display**:
  - Account Details: User's registered account info
  - Payment Details: Actual payer's details (may differ)
- ✅ **Full-size payment proof image** viewer
- ✅ Open image in new tab option
- ✅ Approve/Reject buttons with proper validation
- ✅ Required rejection reason field
- ✅ Shows previous rejection reasons if applicable

#### Workflow Improvements:

1. Admin sees "ProofUploaded" registrations by default
2. Clicks "Review" or "View" to open modal
3. Reviews:
   - User account details
   - Actual payer details (name & phone)
   - Payment proof image
4. Either:
   - **Approves** - Status → "Approved", user can trek
   - **Rejects** - Must provide reason, user notified

## Technical Implementation

### Database Query Enhancement

```typescript
supabase.from("trek_registrations").select(`
    *,
    users:user_id (
      full_name,
      email,
      phone_number
    )
  `);
```

This join fetches both:

- Registration details (including registrant_name/phone)
- Associated user account details

### Payment Status Flow

```
Pending → (user uploads proof) → ProofUploaded → (admin reviews) → Approved/Rejected
```

### RPC Functions (Already Existing)

- `approve_registration(registration_id)` - Sets status to "Approved"
- `reject_registration(registration_id, reason)` - Sets status to "Rejected" with reason
- Both functions update `verified_by` and `verified_at` fields

## Benefits

### For Users:

1. ✅ Clear workflow - know exactly what's needed
2. ✅ Can register even if payment made by someone else
3. ✅ Pre-filled forms reduce errors
4. ✅ Transparent verification status

### For Admins:

1. ✅ See both account holder and payer details
2. ✅ View payment proof before approving (prevents accidental approvals)
3. ✅ Clear distinction between user account and payment source
4. ✅ Better audit trail with verifier info
5. ✅ Professional, intuitive UI

### For the Organization:

1. ✅ Handles real-world scenarios (group bookings, family registrations)
2. ✅ Reduces support queries about "different name on payment"
3. ✅ Better data for reconciliation
4. ✅ Compliance with payment tracking requirements

## Usage Guide

### For Admins

#### Viewing Pending Verifications:

1. Navigate to `/admin/event-registrations`
2. Default view shows "ProofUploaded" status
3. List shows all registrations with user and payer details

#### Verifying a Payment:

1. Click "Review" button on any registration
2. Modal opens with:
   - User account details (left side)
   - Payer details (right side)
   - Full payment proof image below
3. Review the image carefully
4. Either:
   - Click "Approve Payment" (green button) if valid
   - Enter rejection reason and click "Reject" (red button) if invalid
5. Modal closes, list refreshes automatically

#### Filtering:

- Use status dropdown to filter by: ProofUploaded, Pending, Approved, Rejected
- Enter Trek ID to see specific trek registrations
- Click Refresh to reload data

### For Users

#### Registering for a Trek:

1. Open trek details page
2. Fill in your name and phone number (or edit pre-filled values)
3. Check indemnity agreement
4. Click "Register Now"
5. System confirms registration

#### Uploading Payment Proof:

1. After registration, yellow box appears in sidebar
2. Enter payer's name (may be you or someone paying for you)
3. Enter payer's phone number (number used for payment)
4. Upload payment screenshot/receipt
5. Click "Upload Proof"
6. Wait for admin verification

## Files Modified

### Database:

- ✅ `supabase/migrations/20251008000000_add_registrant_details_to_trek_registrations.sql` - NEW

### Frontend Components:

- ✅ `src/components/trek/RegistrationCard.tsx` - Enhanced with registrant fields
- ✅ `src/hooks/trek/useTrekRegistration.ts` - Updated to handle new fields
- ✅ `src/pages/TrekEventDetails.tsx` - Updated function signatures
- ✅ `src/pages/admin/EventRegistrations.tsx` - Complete redesign with modal

### RPC Functions:

- ✅ Already exist in `supabase/sql/registration_workflow.sql` (no changes needed)

## Testing Checklist

### User Flow:

- [ ] Register for trek with name/phone
- [ ] Upload payment proof with payer details
- [ ] Verify payment proof appears in admin panel
- [ ] Check status updates after approval/rejection

### Admin Flow:

- [ ] View registrations list with all details
- [ ] Open payment proof modal
- [ ] Verify image loads correctly
- [ ] Approve a registration
- [ ] Reject a registration with reason
- [ ] Verify status badges update correctly

### Edge Cases:

- [ ] Different payer name from user name
- [ ] Different payer phone from user phone
- [ ] Multiple registrations by same person
- [ ] Rejected registration resubmission

## Migration Steps

### 1. Run Database Migration:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/20251008000000_add_registrant_details_to_trek_registrations.sql
```

### 2. Verify Migration:

```sql
-- Check columns exist:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trek_registrations'
AND column_name IN ('registrant_name', 'registrant_phone');
```

### 3. Deploy Frontend:

- No additional configuration needed
- All changes are backward compatible
- Existing registrations will show "Not provided" for registrant fields

## Future Enhancements (Optional)

### Potential Improvements:

1. **SMS Notifications**: Alert users when payment approved/rejected
2. **Payment Amount Tracking**: Add expected vs received amount fields
3. **Bulk Approval**: Select multiple registrations to approve at once
4. **Payment Proof Templates**: Provide sample payment screenshots
5. **Auto-verification**: OCR-based payment validation
6. **Payment Gateway Integration**: Direct payment collection
7. **Group Registration**: Single form for multiple participants

## Support & Troubleshooting

### Common Issues:

**Q: Can't see registrant fields in admin panel?**

- Run database migration first
- Refresh the page
- Check browser console for errors

**Q: Payment proof not loading?**

- Verify storage bucket permissions
- Check if file was uploaded to `trek_assets` bucket
- Ensure file URL is valid

**Q: RPC function not found errors?**

- Run `supabase/sql/registration_workflow.sql`
- Check function permissions with `\df approve_registration` in SQL editor

## Compliance & Data Handling

### India-Specific Considerations:

- ✅ Date formats use `toLocaleDateString('en-IN')`
- ✅ Phone number format validated (Indian numbers)
- ✅ Data stored securely in Supabase
- ✅ User consent through indemnity agreement
- ✅ Audit trail with verifier tracking

### Data Privacy:

- Payment proofs stored in secure storage bucket
- Admin-only access to verification panel
- User can only see their own registrations
- RLS policies enforce data isolation

## Conclusion

This enhancement provides a professional, scalable solution for trek registration payment verification that handles real-world scenarios while maintaining a smooth user experience and efficient admin workflow.

**Status**: ✅ Complete and Ready for Testing

---

_Last Updated: October 8, 2025_
_Version: 1.0_
