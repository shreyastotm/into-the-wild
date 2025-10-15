export enum TrekEventStatus {
  DRAFT = 'Draft',
  UPCOMING = 'Upcoming',
  OPEN_FOR_REGISTRATION = 'Open for Registration',
  REGISTRATION_CLOSED = 'Registration Closed',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum EventType {
  TREK = 'trek',
  CAMPING = 'camping'
}

// Camping event specific types
export interface CampingActivity {
  time: string;
  activity: string;
  location: string;
  volunteers_needed?: number;
  equipment?: string[];
  description?: string;
}

export interface CampingItineraryDay {
  date: string;
  activities: CampingActivity[];
}

export interface CampingItinerary {
  [key: string]: CampingItineraryDay; // day_1, day_2, etc.
}

export interface VolunteerRole {
  id: string;
  name: string;
  description: string;
  slots: number;
  requirements?: string[];
  assigned_users?: string[]; // UUIDs of assigned volunteers
}

export interface VolunteerRoles {
  roles: VolunteerRole[];
}

export interface ActivitySchedule {
  activities: CampingActivity[];
  notes?: string;
}

// Base event interface (common to both treks and camping)
export interface BaseEvent {
  trek_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  duration?: string | null;
  base_price?: number | null;
  cost?: number | null;
  cancellation_policy?: string | null;
  penalty_details?: number | null;
  max_participants: number;
  current_participants?: number;
  booking_amount?: number | null;
  collect_full_fee?: boolean;
  image_url?: string | null;
  transport_mode?: string | null;
  government_id_required?: boolean;
  transport_plan?: {
    allowed_modes?: Array<'self_drive' | 'mini_van' | 'bus' | 'hybrid'>;
    default_mode?: 'self_drive' | 'mini_van' | 'bus' | 'hybrid';
    booked_vehicle?: {
      type: 'mini_van' | 'bus';
      seats: number;
      vendor?: string;
      cost?: number;
    } | null;
    self_drive_policy?: {
      allow_volunteer_drivers: boolean;
      max_car_seats_per_driver?: number;
    };
  } | null;
  vendor_contacts?: Record<string, unknown> | null;
  pickup_time_window?: string | null;
  event_creator_type?: string | null;
  partner_id?: string | null;
  created_at?: string;
  updated_at?: string;
  gpx_file_url?: string | null;
  is_finalized?: boolean;
  created_by?: string | null;
  status?: TrekEventStatus | string | null;
  event_type: EventType;
}

// Trek-specific interface
export interface TrekEvent extends BaseEvent {
  event_type: EventType.TREK;
  difficulty?: string | null;
  route_data?: Record<string, unknown> | null;
  // Trek-specific fields
}

// Camping-specific interface  
export interface CampingEvent extends BaseEvent {
  event_type: EventType.CAMPING;
  itinerary?: CampingItinerary | null;
  activity_schedule?: ActivitySchedule | null;
  volunteer_roles?: VolunteerRoles | null;
  // Camping-specific fields
}

// Union type for any event
export type Event = TrekEvent | CampingEvent;

// Legacy compatibility - keep existing interface for now
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TrekEventListItem extends BaseEvent {
  // This interface is kept for backward compatibility
  // Will be gradually replaced with the new Event types
}

export interface TrekCost {
  id: number;
  trek_id: number;
  description: string | null;
  amount: number;
  cost_type: string;
  url?: string | null;
  file_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Tent rental types
export interface TentType {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  rental_price_per_night: number;
  is_active: boolean;
}

export interface TentInventory {
  id: number;
  event_id: number;
  tent_type_id: number;
  total_available: number;
  reserved_count: number;
  tent_type?: TentType;
}

export interface TentRequest {
  id?: number;
  event_id: number;
  user_id: string;
  tent_type_id: number;
  quantity_requested: number;
  nights: number;
  total_cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  request_notes?: string;
  admin_notes?: string;
  tent_type?: TentType;
}

// Update camping event to include tent inventory
export interface CampingEventWithTents extends CampingEvent {
  tent_inventory?: TentInventory[];
} 