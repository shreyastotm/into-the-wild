export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          name: string | null
          email: string | null
          user_type: string | null
          created_at: string | null
          updated_at: string | null
          id_verification_status: string | null
          avatar_url: string | null
        }
        Insert: {
          user_id: string
          name?: string | null
          email?: string | null
          user_type?: string | null
          created_at?: string | null
          updated_at?: string | null
          id_verification_status?: string | null
          avatar_url?: string | null
        }
        Update: {
          user_id?: string
          name?: string | null
          email?: string | null
          user_type?: string | null
          created_at?: string | null
          updated_at?: string | null
          id_verification_status?: string | null
          avatar_url?: string | null
        }
      }
      trek_events: {
        Row: {
          trek_id: number
          name: string | null
          description: string | null
          category: string | null
          base_price: number | null
          start_datetime: string | null
          max_participants: number | null
          image_url: string | null
          location: string | null
          status: string | null
          duration: string | null
          cancellation_policy: string | null
          event_creator_type: string | null
          transport_mode: string | null
          event_type: string | null
        }
        Insert: {
          trek_id?: number
          name?: string | null
          description?: string | null
          category?: string | null
          base_price?: number | null
          start_datetime?: string | null
          max_participants?: number | null
          image_url?: string | null
          location?: string | null
          status?: string | null
          duration?: string | null
          cancellation_policy?: string | null
          event_creator_type?: string | null
          transport_mode?: string | null
          event_type?: string | null
        }
        Update: {
          trek_id?: number
          name?: string | null
          description?: string | null
          category?: string | null
          base_price?: number | null
          start_datetime?: string | null
          max_participants?: number | null
          image_url?: string | null
          location?: string | null
          status?: string | null
          duration?: string | null
          cancellation_policy?: string | null
          event_creator_type?: string | null
          transport_mode?: string | null
          event_type?: string | null
        }
      }
      trek_registrations: {
        Row: {
          registration_id: number
          user_id: string
          trek_id: number
          booking_datetime: string | null
          cancellation_datetime: string | null
          penalty_applied: number | null
          created_at: string | null
          pickup_location_id: number | null
          is_driver: boolean | null
          payment_status: string | null
          indemnity_agreed: boolean | null
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          registrant_name: string | null
          registrant_phone: string | null
          payment_proof_url: string | null
        }
        Insert: {
          registration_id?: number
          user_id: string
          trek_id: number
          booking_datetime?: string | null
          cancellation_datetime?: string | null
          penalty_applied?: number | null
          created_at?: string | null
          pickup_location_id?: number | null
          is_driver?: boolean | null
          payment_status?: string | null
          indemnity_agreed?: boolean | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          registrant_name?: string | null
          registrant_phone?: string | null
          payment_proof_url?: string | null
        }
        Update: {
          registration_id?: number
          user_id?: string
          trek_id?: number
          booking_datetime?: string | null
          cancellation_datetime?: string | null
          penalty_applied?: number | null
          created_at?: string | null
          pickup_location_id?: number | null
          is_driver?: boolean | null
          payment_status?: string | null
          indemnity_agreed?: boolean | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          registrant_name?: string | null
          registrant_phone?: string | null
          payment_proof_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trek_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trek_registrations_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_trek_participant_count: {
        Args: {
          p_trek_id: number
        }
        Returns: number
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
