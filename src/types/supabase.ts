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
          id: string
          email: string
          name: string
          password: string
          instance: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password: string
          instance: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password?: string
          instance?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      stats: {
        Row: {
          id: string
          user_id: string
          total_messages_sent: number
          total_contacts: number
          total_messages_failed: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_messages_sent?: number
          total_contacts?: number
          total_messages_failed?: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_messages_sent?: number
          total_contacts?: number
          total_messages_failed?: number
          updated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 