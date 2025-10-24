# v0.2.0 - Transport & Registration Enhancements

## Highlights

- Transport volunteer workflow groundwork:
  - Added user-level opt-in: `users.transport_volunteer_opt_in`.
  - Added registration fields: `is_driver`, `offered_seats`, `pickup_area`, `preferred_pickup_time`.
  - Added event-level `transport_plan` JSONB on `trek_events`.
  - Created `trek_transport_assignments` table with RLS for driver-passenger mapping.
- UI/Types
  - Profile: Opt-in toggle to volunteer as driver.
  - Registration: Volunteer-as-driver option and seats offered.
  - Types: Added `transport_plan` to events; extended `UserProfile`.
- Build/Deploy
  - Production build validated and deployed.

## Migration

- Run `supabase/sql/registration_workflow.sql` (idempotent) against your database.

## Notes

- Admin Transport Plan editor and assignment UI can be added next.
- Expense integration for booked vehicles is ready to wire using existing ExpenseSplitting flow.
