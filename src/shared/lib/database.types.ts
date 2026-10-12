export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type PetRow = {
  best_streak: number;
  couple_id: string;
  created_at: string;
  fullness: number;
  happiness: number;
  last_action: string | null;
  last_actor: string | null;
  last_care_on: string | null;
  name: string;
  streak: number;
  updated_at: string;
  xp: number;
};

type CoupleRow = {
  created_at: string;
  id: string;
  invite_code: string;
  started_on: string | null;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      couple_members: {
        Row: { couple_id: string; joined_at: string; user_id: string };
        Insert: { couple_id: string; joined_at?: string; user_id: string };
        Update: { couple_id?: string; joined_at?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: 'couple_members_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      couples: {
        Row: CoupleRow;
        Insert: {
          created_at?: string;
          id?: string;
          invite_code: string;
          started_on?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          invite_code?: string;
          started_on?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          couple_id: string;
          created_at: string;
          created_by: string | null;
          details: string;
          end_time: string | null;
          ends_on: string | null;
          id: string;
          outing_streak: number | null;
          start_time: string | null;
          starts_on: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          created_by?: string | null;
          details?: string;
          end_time?: string | null;
          ends_on?: string | null;
          id?: string;
          outing_streak?: number | null;
          start_time?: string | null;
          starts_on: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          created_by?: string | null;
          details?: string;
          end_time?: string | null;
          ends_on?: string | null;
          id?: string;
          outing_streak?: number | null;
          start_time?: string | null;
          starts_on?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      important_dates: {
        Row: {
          couple_id: string;
          created_at: string;
          date: string;
          id: string;
          repeats_yearly: boolean;
          title: string;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          date: string;
          id?: string;
          repeats_yearly?: boolean;
          title: string;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          date?: string;
          id?: string;
          repeats_yearly?: boolean;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'important_dates_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          author_id: string | null;
          color: string;
          content: string;
          couple_id: string;
          created_at: string;
          id: string;
          pinned: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          color?: string;
          content?: string;
          couple_id: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          title?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          color?: string;
          content?: string;
          couple_id?: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
        ];
      };
      nudges: {
        Row: {
          couple_id: string;
          created_at: string;
          id: string;
          kind: string;
          sender_id: string | null;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          id?: string;
          kind: string;
          sender_id?: string | null;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          sender_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'nudges_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'nudges_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      outing_ideas: {
        Row: {
          emoji: string;
          key: string;
          title: string;
        };
        Insert: {
          emoji: string;
          key: string;
          title: string;
        };
        Update: {
          emoji?: string;
          key?: string;
          title?: string;
        };
        Relationships: [];
      };
      pet_outings: {
        Row: {
          couple_id: string;
          created_at: string;
          created_by: string | null;
          event_id: string | null;
          id: string;
          idea_key: string;
          reached_on: string;
          status: string;
          streak: number;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          created_by?: string | null;
          event_id?: string | null;
          id?: string;
          idea_key: string;
          reached_on: string;
          status?: string;
          streak: number;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          created_by?: string | null;
          event_id?: string | null;
          id?: string;
          idea_key?: string;
          reached_on?: string;
          status?: string;
          streak?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'pet_outings_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pet_outings_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pet_outings_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pet_outings_idea_key_fkey';
            columns: ['idea_key'];
            isOneToOne: false;
            referencedRelation: 'outing_ideas';
            referencedColumns: ['key'];
          },
        ];
      };
      pets: {
        Row: PetRow;
        Insert: {
          best_streak?: number;
          couple_id: string;
          created_at?: string;
          fullness?: number;
          happiness?: number;
          last_action?: string | null;
          last_actor?: string | null;
          last_care_on?: string | null;
          name: string;
          streak?: number;
          updated_at?: string;
          xp?: number;
        };
        Update: {
          best_streak?: number;
          couple_id?: string;
          created_at?: string;
          fullness?: number;
          happiness?: number;
          last_action?: string | null;
          last_actor?: string | null;
          last_care_on?: string | null;
          name?: string;
          streak?: number;
          updated_at?: string;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'pets_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: true;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pets_last_actor_fkey';
            columns: ['last_actor'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          caption: string | null;
          couple_id: string;
          created_at: string;
          height: number;
          id: string;
          storage_path: string;
          uploaded_by: string | null;
          width: number;
        };
        Insert: {
          caption?: string | null;
          couple_id: string;
          created_at?: string;
          height: number;
          id?: string;
          storage_path: string;
          uploaded_by?: string | null;
          width: number;
        };
        Update: {
          caption?: string | null;
          couple_id?: string;
          created_at?: string;
          height?: number;
          id?: string;
          storage_path?: string;
          uploaded_by?: string | null;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      places: {
        Row: {
          couple_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          note: string;
          photo_id: string | null;
          visited_on: string | null;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          note?: string;
          photo_id?: string | null;
          visited_on?: string | null;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          note?: string;
          photo_id?: string | null;
          visited_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'places_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_photo_fkey';
            columns: ['photo_id', 'couple_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id', 'couple_id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          display_name: string;
          id: string;
          mood: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          display_name?: string;
          id: string;
          mood?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          display_name?: string;
          id?: string;
          mood?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: { platform: string; token: string; updated_at: string; user_id: string };
        Insert: { platform: string; token: string; updated_at?: string; user_id: string };
        Update: { platform?: string; token?: string; updated_at?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: 'push_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reactions: {
        Row: {
          couple_id: string;
          created_at: string;
          emoji: string;
          id: string;
          note_id: string | null;
          photo_id: string | null;
          user_id: string;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          emoji: string;
          id?: string;
          note_id?: string | null;
          photo_id?: string | null;
          user_id?: string;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          emoji?: string;
          id?: string;
          note_id?: string | null;
          photo_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reactions_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reactions_note_fkey';
            columns: ['note_id', 'couple_id'];
            isOneToOne: false;
            referencedRelation: 'notes';
            referencedColumns: ['id', 'couple_id'];
          },
          {
            foreignKeyName: 'reactions_photo_fkey';
            columns: ['photo_id', 'couple_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id', 'couple_id'];
          },
          {
            foreignKeyName: 'reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      adopt_pet: {
        Args: { pet_name: string };
        Returns: PetRow;
        SetofOptions: { from: '*'; to: 'pets'; isOneToOne: true; isSetofReturn: false };
      };
      care_for_pet: {
        Args: { action: string; local_day?: string };
        Returns: PetRow;
        SetofOptions: { from: '*'; to: 'pets'; isOneToOne: true; isSetofReturn: false };
      };
      create_couple: {
        Args: never;
        Returns: CoupleRow;
        SetofOptions: { from: '*'; to: 'couples'; isOneToOne: true; isSetofReturn: false };
      };
      join_couple: {
        Args: { code: string };
        Returns: CoupleRow;
        SetofOptions: { from: '*'; to: 'couples'; isOneToOne: true; isSetofReturn: false };
      };
      register_push_token: {
        Args: { new_platform: string; new_token: string };
        Returns: undefined;
      };
      schedule_outing: {
        Args: { outing_day: string; outing_id: string };
        Returns: Database['public']['Tables']['events']['Row'];
        SetofOptions: { from: '*'; to: 'events'; isOneToOne: true; isSetofReturn: false };
      };
      dismiss_outing: {
        Args: { outing_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
