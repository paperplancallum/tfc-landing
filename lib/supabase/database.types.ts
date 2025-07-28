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
          first_name: string | null
          last_name: string | null
          phone: string | null
          home_city_id: string | null
          plan: 'free' | 'premium'
          plan_renews_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          home_city_id?: string | null
          plan?: 'free' | 'premium'
          plan_renews_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          home_city_id?: string | null
          plan?: 'free' | 'premium'
          plan_renews_at?: string | null
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          iata_code: string
          timezone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          iata_code: string
          timezone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          iata_code?: string
          timezone?: string
          created_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          departure_city_id: string
          destination: string
          price: number
          currency: string
          trip_length: number
          travel_month: string
          photo_url: string | null
          found_at: string
          is_premium: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          departure_city_id: string
          destination: string
          price: number
          currency?: string
          trip_length: number
          travel_month: string
          photo_url?: string | null
          found_at?: string
          is_premium?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          departure_city_id?: string
          destination?: string
          price?: number
          currency?: string
          trip_length?: number
          travel_month?: string
          photo_url?: string | null
          found_at?: string
          is_premium?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_sub_id: string
          plan: 'premium_3mo' | 'premium_6mo' | 'premium_year'
          status: string
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_sub_id: string
          plan: 'premium_3mo' | 'premium_6mo' | 'premium_year'
          status: string
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_sub_id?: string
          plan?: 'premium_3mo' | 'premium_6mo' | 'premium_year'
          status?: string
          current_period_end?: string
          created_at?: string
        }
      }
      emails_sent: {
        Row: {
          id: string
          user_id: string
          template: string
          sent_at: string
          open_at: string | null
          click_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          template: string
          sent_at?: string
          open_at?: string | null
          click_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          template?: string
          sent_at?: string
          open_at?: string | null
          click_at?: string | null
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event?: string
          metadata?: Json | null
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