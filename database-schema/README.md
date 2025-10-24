# Database Schema Summary

Generated on: 2025-01-25

## Files Generated:
- `latest_schema.sql` - Complete schema dump with all tables, types, functions, and policies
- `migration_history.txt` - List of applied migrations

## Key Tables:

### Core Tables:
- `users` - User profiles and authentication
- `trek_events` - Trek event definitions
- `trek_registrations` - User registrations for treks
- `trek_comments` - Comments on treks
- `trek_ratings` - User ratings for treks
- `trek_participant_ratings` - Participant-to-participant ratings

### Transport & Logistics:
- `trek_pickup_locations` - Pickup points for treks
- `trek_drivers` - Users acting as drivers
- `trek_driver_assignments` - Driver-participant assignments

### Financial:
- `trek_expenses` - Expense tracking
- `expense_shares` - How expenses are shared among participants
- `trek_expense_categories` - Expense categories
- `trek_costs` - Fixed costs for treks

### Community & Communication:
- `notifications` - User notifications
- `scheduled_notifications` - Scheduled notifications
- `forum_categories` - Forum categories
- `forum_threads` - Forum discussion threads
- `forum_posts` - Forum posts and replies
- `votes` - Voting system for forum content

### Packing & Equipment:
- `master_packing_items` - Reusable packing items
- `trek_packing_list_assignments` - Trek-specific packing lists
- `tent_rentals` - Tent rental system

### Media & Documentation:
- `user_trek_images` - User-uploaded trek images
- `image_tags` - Image tagging system
- `registration_id_proofs` - ID proof uploads
- `id_types` - Types of ID documents
- `trek_id_requirements` - ID requirements per trek

### System Tables:
- `site_settings` - Application settings
- `subscriptions_billing` - Billing information
- `comments` - Generic comments system

## Key Features:

### Security:
- Row Level Security (RLS) enabled on all tables
- Comprehensive RLS policies for data access control
- User authentication and authorization

### Data Types:
- Custom ENUMs for user roles, transport modes, event types
- JSONB columns for flexible data storage
- Proper foreign key relationships

### Functions:
- `get_trek_participant_count()` - Get participant count for treks
- `create_notification()` - Create user notifications
- `get_my_notifications()` - Get user's notifications
- `mark_notification_as_read()` - Mark notifications as read
- `update_tent_reserved_count()` - Update tent rental counts
- `get_trek_required_id_types()` - Get required ID types for treks
- `user_has_approved_id_proofs()` - Check user's ID verification status

### Features:
- **Trek Management**: Complete trek lifecycle from creation to completion
- **User Management**: User profiles, verification, and roles
- **Transport Coordination**: Driver assignments and pickup management
- **Expense Sharing**: Fair expense distribution among participants
- **Rating System**: Trek and participant ratings
- **Community Features**: Forum, comments, and discussions
- **Notification System**: Real-time and scheduled notifications
- **Media Management**: Image uploads and tagging
- **Packing Lists**: Reusable and trek-specific packing items
- **ID Verification**: Document upload and verification system

## Migration History:
The database has been through extensive development with 67+ migrations covering:
- Initial schema setup
- User authentication and profiles
- Trek event management
- Transport and logistics
- Expense tracking and sharing
- Rating and review systems
- Forum and community features
- Notification systems
- Media and image management
- ID verification systems
- Packing list management
- Tent rental systems

## Usage:

### Apply to Fresh Database:
```bash
# Apply the complete schema
psql -d your_database -f latest_schema.sql
```

### Apply to Existing Database:
```bash
# Check migration status first
npx supabase migration list

# Apply pending migrations
npx supabase db push
```

### Development Setup:
```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db reset

# Generate new migration
npx supabase migration new your_migration_name
```

## Database Connection:
- **Local Development**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **API URL**: `http://127.0.0.1:54321`
- **Studio URL**: `http://127.0.0.1:54323`

## Important Notes:
- All tables have RLS enabled with appropriate policies
- Foreign key relationships are properly maintained
- Indexes are created for performance optimization
- Functions are secured with proper permissions
- The schema supports both local development and production deployment
