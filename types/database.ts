export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipe_equipment: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name?: string;
          amount?: number;
          unit?: string;
          created_at?: string;
        };
      };
      recipe_outputs: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      recipe_steps: {
        Row: {
          id: string;
          recipe_id: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipe_experiments: {
        Row: {
          id: string;
          recipe_id: string;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          memo?: string | null;
          created_at?: string;
        };
      };
      experiment_photos: {
        Row: {
          id: string;
          experiment_id: string;
          url: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          url: string;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          url?: string;
          order?: number;
          created_at?: string;
        };
      };
      experiment_equipment: {
        Row: {
          id: string;
          experiment_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      experiment_ingredients: {
        Row: {
          id: string;
          experiment_id: string;
          name: string;
          amount: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          name: string;
          amount: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          name?: string;
          amount?: number;
          unit?: string;
          created_at?: string;
        };
      };
      experiment_outputs: {
        Row: {
          id: string;
          experiment_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      experiment_steps: {
        Row: {
          id: string;
          experiment_id: string;
          content: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          content: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          content?: Json;
          created_at?: string;
        };
      };
      user_passkeys: {
        Row: {
          id: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter: number;
          transports: string[] | null;
          device_name: string | null;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_id: string;
          public_key: string;
          counter?: number;
          transports?: string[] | null;
          device_name?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_id?: string;
          public_key?: string;
          counter?: number;
          transports?: string[] | null;
          device_name?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
      };
      webauthn_challenges: {
        Row: {
          id: string;
          user_id: string | null;
          challenge: string;
          type: "registration" | "authentication";
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          challenge: string;
          type: "registration" | "authentication";
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          challenge?: string;
          type?: "registration" | "authentication";
          expires_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
