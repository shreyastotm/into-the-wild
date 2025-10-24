# 🏕️ Tent Rental Feature Setup Guide

## Overview

The tent rental feature allows users to request tent rentals for camping events. This feature requires specific database tables and setup steps to function properly.

## Current Status

❌ **Feature Not Set Up** - The tent rental tables have not been applied to the database yet.

## Prerequisites

- Supabase CLI installed and configured
- Admin access to the database
- Camping events configured with `event_type = 'camping'`

## Setup Steps

### 1. Apply Database Migrations

The tent rental feature requires specific database tables. Run the following command to apply the migrations:

```bash
# Navigate to your project directory
cd into-the-wild

# Apply all pending migrations
supabase db push

# Or apply specific tent rental migration
supabase db push --include-all
```

### 2. Verify Tables Created

After running migrations, verify these tables exist:

```sql
-- Check if tent rental tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tent_types', 'tent_inventory', 'tent_requests');
```

Expected output:

```
tent_types
tent_inventory
tent_requests
```

### 3. Set Up Tent Types (Admin Only)

The migration creates default tent types, but you can add more:

```sql
-- View existing tent types
SELECT * FROM tent_types;

-- Add custom tent types (example)
INSERT INTO tent_types (name, capacity, description, rental_price_per_night) VALUES
('4-Person Tent', 4, 'Large tent for 4 people with extra space', 1000.00),
('6-Person Tent', 6, 'Family tent for 6 people', 1500.00);
```

### 4. Add Tent Inventory for Events

For each camping event, add tent inventory:

```sql
-- Add tent inventory for a specific event (replace EVENT_ID with actual event ID)
INSERT INTO tent_inventory (event_id, tent_type_id, total_available) VALUES
(EVENT_ID, 1, 10), -- 10 x 2-Person Tents
(EVENT_ID, 2, 8);  -- 8 x 3-Person Tents

-- Check inventory
SELECT
  ti.*,
  tt.name as tent_name,
  tt.capacity,
  tt.rental_price_per_night
FROM tent_inventory ti
JOIN tent_types tt ON ti.tent_type_id = tt.id
WHERE ti.event_id = EVENT_ID;
```

### 5. Test the Feature

1. Navigate to a camping event page
2. Register for the event
3. Go to the "Tent Rental" tab
4. You should see available tent options

## Database Schema

### Tables Created

#### `tent_types`

- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) UNIQUE)
- `capacity` (INTEGER)
- `description` (TEXT)
- `rental_price_per_night` (DECIMAL(10,2))
- `is_active` (BOOLEAN)

#### `tent_inventory`

- `id` (SERIAL PRIMARY KEY)
- `event_id` (INTEGER → trek_events.trek_id)
- `tent_type_id` (INTEGER → tent_types.id)
- `total_available` (INTEGER)
- `reserved_count` (INTEGER)

#### `tent_requests`

- `id` (SERIAL PRIMARY KEY)
- `event_id` (INTEGER → trek_events.trek_id)
- `user_id` (UUID → auth.users.id)
- `tent_type_id` (INTEGER → tent_types.id)
- `quantity_requested` (INTEGER)
- `nights` (INTEGER)
- `total_cost` (DECIMAL(10,2))
- `status` (VARCHAR(20)) - 'pending', 'approved', 'rejected', 'cancelled'
- `request_notes` (TEXT)
- `admin_notes` (TEXT)

## Row Level Security (RLS)

The following RLS policies are automatically created:

- **tent_types**: Readable by all authenticated users
- **tent_inventory**: Readable by all authenticated users
- **tent_requests**: Users can manage their own requests, admins can manage all

## Admin Management

### View All Tent Requests

```sql
SELECT
  tr.*,
  tt.name as tent_name,
  u.name as user_name,
  te.name as event_name
FROM tent_requests tr
JOIN tent_types tt ON tr.tent_type_id = tt.id
JOIN users u ON tr.user_id = u.user_id
JOIN trek_events te ON tr.event_id = te.trek_id
ORDER BY tr.created_at DESC;
```

### Approve/Reject Requests

```sql
-- Approve a request
UPDATE tent_requests
SET status = 'approved',
    admin_notes = 'Approved for camping event'
WHERE id = REQUEST_ID;

-- Reject a request
UPDATE tent_requests
SET status = 'rejected',
    admin_notes = 'No tents available'
WHERE id = REQUEST_ID;
```

### Update Reserved Counts

```sql
-- Manually update reserved count (usually handled automatically)
UPDATE tent_inventory
SET reserved_count = (
  SELECT COALESCE(SUM(quantity_requested), 0)
  FROM tent_requests
  WHERE event_id = tent_inventory.event_id
    AND tent_type_id = tent_inventory.tent_type_id
    AND status IN ('pending', 'approved')
)
WHERE event_id = EVENT_ID;
```

## Troubleshooting

### Issue: "Tent rental feature is not yet set up"

**Solution**: Run `supabase db push` to apply migrations

### Issue: "No tent rentals are available for this camping event"

**Solution**: Add tent inventory for the event using the SQL above

### Issue: "Permission denied" errors

**Solution**: Check RLS policies and ensure user is authenticated

### Issue: Tables don't exist after migration

**Solution**:

1. Check migration status: `supabase migration list`
2. Check for errors: `supabase db push --debug`
3. Manually run migration: `supabase db reset` then `supabase db push`

## Feature Usage

### For Users

1. Register for a camping event
2. Go to the "Tent Rental" tab
3. Select tent type, quantity, and nights
4. Add special requests (optional)
5. Submit request for admin approval
6. Wait for approval/rejection

### For Admins

1. View tent requests in admin panel
2. Approve/reject requests
3. Add tent inventory for events
4. Manage tent types and pricing

## Cost Calculation

Tent rental costs are calculated as:

```
Total Cost = Quantity × Nights × Price Per Night
```

Example:

- 2 tents × 3 nights × ₹500/night = ₹3,000

## Integration with Events

The tent rental feature only appears for events with:

- `event_type = 'camping'`
- User is registered for the event
- Tent inventory exists for the event

## Security Notes

- All tent requests require admin approval
- Users can only view their own requests
- Admins can manage all tent-related data
- RLS policies prevent unauthorized access

## Future Enhancements

- Automatic inventory management
- Payment integration for tent rentals
- Tent pickup/drop-off coordination
- Advanced tent availability calendar
- Bulk tent request management

---

## Quick Setup Checklist

- [ ] Run `supabase db push`
- [ ] Verify tables exist
- [ ] Add tent inventory for camping events
- [ ] Test feature on camping event page
- [ ] Configure tent types and pricing
- [ ] Set up admin approval workflow

**Last Updated**: October 1, 2025  
**Status**: Ready for setup
