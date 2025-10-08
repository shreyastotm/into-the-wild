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
          user_id: string
          trek_id: number
          registration_date: string | null
          payment_status: string | null
          payment_proof_url: string | null
        }
        Insert: {
          user_id: string
          trek_id: number
          registration_date?: string | null
          payment_status?: string | null
          payment_proof_url?: string | null
        }
        Update: {
          user_id?: string
          trek_id?: number
          registration_date?: string | null
          payment_status?: string | null
          payment_proof_url?: string | null
        }
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
