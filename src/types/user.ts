export interface UserProfile {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  interests?: string[] | Record<string, unknown> | null; // Can be string[] or JSON
  trekking_experience?: string | null;
  health_data?: Record<string, unknown> | null; // JSON
  image_url?: string | null;
  avatar_url?: string | null;
  user_type?: 'trekker' | 'micro_community' | 'admin' | null;
  partner_id?: string | null;
  verification_status?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  verification_docs?: Record<string, unknown> | null; // Should be a JSON type
  points?: number | null;
  badges?: Record<string, unknown> | null; // JSON
  legacy_int_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  has_car?: boolean | null;
  car_seating_capacity?: number | null;
  vehicle_number?: string | null;
  pet_details?: Record<string, unknown> | null; // JSON
  subscription_type?: 'community' | 'self_service';
  subscription_status?: 'active' | 'inactive' | 'cancelled';
  subscription_expiry?: string;
} 