# Database Schema Issues and Fixes

## Issues Identified

### 1. Missing 'image' column in trek_events table
**Error**: `Could not find the 'image' column of 'trek_events' in the schema cache`

**Root Cause**: The database schema has `image_url` column but the application code is trying to access `image` column.

**Fix**: Added `image` column as an alias to `image_url` for backward compatibility.

### 2. trek_costs table constraint violation
**Error**: `new row for relation "trek_costs" violates check constraint "trek_costs_cost_type_check"`

**Root Cause**: The application was using cost types like `'transportation'`, `'accommodation'`, `'food'`, etc., but the database constraint only allows `'ACCOMMODATION'`, `'TICKETS'`, `'LOCAL_VEHICLE'`, `'GUIDE'`, `'OTHER'`.

**Fix**: Updated the application code to use the correct cost types that match the database constraint.

### 3. Missing trek_costs table
**Root Cause**: The `trek_costs` table was not properly created or was missing from the database.

**Fix**: Created the `trek_costs` table with proper constraints, indexes, and RLS policies.

## Files Created/Modified

### SQL Fixes
1. **`get_current_schema.sql`** - SQL queries to get the current database schema
2. **`FIX_SCHEMA_ISSUES.sql`** - Comprehensive schema fixes
3. **`FINAL_SCHEMA_FIX.sql`** - Final schema fix with all corrections

### Application Code Fixes
1. **`src/components/trek/create/CostsStep.tsx`** - Updated cost types to match database constraints

## How to Apply the Fixes

### Step 1: Run the Database Fix
Execute the SQL in `FINAL_SCHEMA_FIX.sql` in your Supabase SQL editor:

```sql
-- This will:
-- 1. Add missing columns to trek_events table
-- 2. Create trek_costs table with correct constraints
-- 3. Set up proper RLS policies
-- 4. Fix cost_type constraint to allow application values
```

### Step 2: Verify the Fix
Run the verification queries in `get_current_schema.sql` to ensure:
- All required columns exist in `trek_events`
- `trek_costs` table exists with correct structure
- Constraints are properly set

### Step 3: Test the Application
1. Try creating a new trek event
2. Add costs with different cost types
3. Verify that the form submission works without errors

## Cost Type Mapping

The application now uses these cost types that match the database constraint:
- `ACCOMMODATION` - Accommodation costs
- `TICKETS` - Tickets & Permits
- `LOCAL_VEHICLE` - Local Vehicle costs
- `GUIDE` - Guide Services
- `OTHER` - Other miscellaneous costs

## Database Schema Changes

### trek_events table additions:
- `image` (TEXT) - Alias for image_url
- `name` (VARCHAR(255)) - Event name
- `base_price` (DECIMAL(10,2)) - Base price
- `created_by` (UUID) - Creator reference
- `is_finalized` (BOOLEAN) - Finalization status
- `status` (VARCHAR(50)) - Event status
- `end_datetime` (TIMESTAMPTZ) - End date/time
- `event_type` (VARCHAR(50)) - Event type

### trek_costs table creation:
- Complete table with all required columns
- Proper foreign key constraints
- Check constraint for cost_type
- RLS policies for security
- Indexes for performance

## Expected Results

After applying these fixes:
1. Trek event creation should work without the "image column" error
2. Cost saving should work without constraint violations
3. All form submissions should complete successfully
4. Database operations should be properly secured with RLS
