export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          is_active: boolean;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          is_active?: boolean;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          is_active?: boolean;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tests: {
        Row: {
          id: number;
          title: string;
          slug: string;
          description: string | null;
          access_type: "demo" | "paid";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          title: string;
          slug: string;
          description?: string | null;
          access_type: "demo" | "paid";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          access_type?: "demo" | "paid";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recordings: {
        Row: {
          id: number;
          test_id: number;
          title: string | null;
          wpm: number;
          audio_url: string;
          reference_transcript: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          test_id: number;
          title?: string | null;
          wpm: number;
          audio_url: string;
          reference_transcript: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          test_id?: number;
          title?: string | null;
          wpm?: number;
          audio_url?: string;
          reference_transcript?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recordings_test_id_fkey";
            columns: ["test_id"];
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      attempts: {
        Row: {
          id: number;
          user_id: string;
          recording_id: number;
          submitted_transcript: string;
          accuracy: number;
          matched_words: number;
          reference_word_count: number;
          submitted_word_count: number;
          mistake_count: number;
          mistake_details: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          recording_id: number;
          submitted_transcript: string;
          accuracy: number;
          matched_words: number;
          reference_word_count: number;
          submitted_word_count: number;
          mistake_count: number;
          mistake_details?: Json;
          created_at?: string;
        };
        Update: {
          submitted_transcript?: string;
          accuracy?: number;
          matched_words?: number;
          reference_word_count?: number;
          submitted_word_count?: number;
          mistake_count?: number;
          mistake_details?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_recording_id_fkey";
            columns: ["recording_id"];
            referencedRelation: "recordings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
