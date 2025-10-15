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
          government_id_required: boolean | null
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
          government_id_required?: boolean | null
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
          government_id_required?: boolean | null
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
          id_verification_status: string | null
          id_verification_notes: string | null
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
          id_verification_status?: string | null
          id_verification_notes?: string | null
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
          id_verification_status?: string | null
          id_verification_notes?: string | null
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
      trek_costs: {
        Row: {
          id: number
          trek_id: number
          cost_type: string
          description: string | null
          amount: number
          url: string | null
          file_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          trek_id: number
          cost_type: string
          description?: string | null
          amount: number
          url?: string | null
          file_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          trek_id?: number
          cost_type?: string
          description?: string | null
          amount?: number
          url?: string | null
          file_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trek_costs_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          }
        ]
      }
      id_types: {
        Row: {
          id_type_id: number
          name: string
          display_name: string
          description: string | null
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id_type_id?: number
          name: string
          display_name: string
          description?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id_type_id?: number
          name?: string
          display_name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      trek_id_requirements: {
        Row: {
          requirement_id: number
          trek_id: number
          id_type_id: number
          is_mandatory: boolean
          created_at: string | null
        }
        Insert: {
          requirement_id?: number
          trek_id: number
          id_type_id: number
          is_mandatory?: boolean
          created_at?: string | null
        }
        Update: {
          requirement_id?: number
          trek_id?: number
          id_type_id?: number
          is_mandatory?: boolean
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trek_id_requirements_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          },
          {
            foreignKeyName: "trek_id_requirements_id_type_id_fkey"
            columns: ["id_type_id"]
            isOneToOne: false
            referencedRelation: "id_types"
            referencedColumns: ["id_type_id"]
          }
        ]
      }
      registration_id_proofs: {
        Row: {
          proof_id: number
          registration_id: number
          id_type_id: number
          proof_url: string
          uploaded_by: string
          uploaded_at: string | null
          verified_by: string | null
          verified_at: string | null
          verification_status: string
          admin_notes: string | null
        }
        Insert: {
          proof_id?: number
          registration_id: number
          id_type_id: number
          proof_url: string
          uploaded_by: string
          uploaded_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verification_status?: string
          admin_notes?: string | null
        }
        Update: {
          proof_id?: number
          registration_id?: number
          id_type_id?: number
          proof_url?: string
          uploaded_by?: string
          uploaded_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          verification_status?: string
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_id_proofs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "trek_registrations"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "registration_id_proofs_id_type_id_fkey"
            columns: ["id_type_id"]
            isOneToOne: false
            referencedRelation: "id_types"
            referencedColumns: ["id_type_id"]
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
