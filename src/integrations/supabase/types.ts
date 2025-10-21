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
      trek_event_images: {
        Row: {
          id: number
          trek_id: number
          image_url: string
          position: number
          created_at: string | null
        }
        Insert: {
          id?: number
          trek_id: number
          image_url: string
          position: number
          created_at?: string | null
        }
        Update: {
          id?: number
          trek_id?: number
          image_url?: string
          position?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trek_event_images_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          }
        ]
      }
      trek_event_videos: {
        Row: {
          id: number
          trek_id: number
          video_url: string
          file_size_mb: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          trek_id: number
          video_url: string
          file_size_mb?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          trek_id?: number
          video_url?: string
          file_size_mb?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trek_event_videos_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          }
        ]
      }
      user_trek_images: {
        Row: {
          id: number
          trek_id: number
          uploaded_by: string
          image_url: string
          status: string
          moderated_by: string | null
          moderated_at: string | null
          moderation_notes: string | null
          is_promoted_to_official: boolean
          created_at: string | null
        }
        Insert: {
          id?: number
          trek_id: number
          uploaded_by: string
          image_url: string
          status?: string
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          is_promoted_to_official?: boolean
          created_at?: string | null
        }
        Update: {
          id?: number
          trek_id?: number
          uploaded_by?: string
          image_url?: string
          status?: string
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          is_promoted_to_official?: boolean
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_trek_images_trek_id_fkey"
            columns: ["trek_id"]
            isOneToOne: false
            referencedRelation: "trek_events"
            referencedColumns: ["trek_id"]
          },
          {
            foreignKeyName: "user_trek_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      image_tags: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      image_tag_assignments: {
        Row: {
          id: number
          image_id: number
          image_type: string
          tag_id: number
          assigned_by: string | null
          assigned_at: string | null
        }
        Insert: {
          id?: number
          image_id: number
          image_type: string
          tag_id: number
          assigned_by?: string | null
          assigned_at?: string | null
        }
        Update: {
          id?: number
          image_id?: number
          image_type?: string
          tag_id?: number
          assigned_by?: string | null
          assigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "image_tags"
            referencedColumns: ["id"]
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
      get_all_image_tags: {
        Args: Record<string, never>
        Returns: {
          id: number
          name: string
          color: string
        }[]
      }
      get_image_tags: {
        Args: {
          p_image_id: number
          p_image_type: string
        }
        Returns: {
          tag_id: number
        }[]
      }
      assign_image_tags: {
        Args: {
          p_image_id: number
          p_image_type: string
          p_tag_ids: number[]
        }
        Returns: string
      }
      search_treks_by_tags: {
        Args: {
          p_tag_ids: number[]
        }
        Returns: {
          trek_id: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
