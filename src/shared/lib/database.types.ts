export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      couple_members: {
        Row: {
          couple_id: string;
          joined_at: string;
          user_id: string;
        };
        Insert: {
          couple_id: string;
          joined_at?: string;
          user_id: string;
        };
        Update: {
          couple_id?: string;
          joined_at?: string;
          user_id?: string;
        };
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
        Row: {
          created_at: string;
          id: string;
          invite_code: string;
          started_on: string | null;
        };
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
      list_items: {
        Row: {
          content: string;
          couple_id: string;
          created_at: string;
          done: boolean;
          done_by: string | null;
          id: string;
          list_id: string;
        };
        Insert: {
          content: string;
          couple_id: string;
          created_at?: string;
          done?: boolean;
          done_by?: string | null;
          id?: string;
          list_id: string;
        };
        Update: {
          content?: string;
          couple_id?: string;
          created_at?: string;
          done?: boolean;
          done_by?: string | null;
          id?: string;
          list_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'list_items_done_by_fkey';
            columns: ['done_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_items_list_id_couple_id_fkey';
            columns: ['list_id', 'couple_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id', 'couple_id'];
          },
        ];
      };
      lists: {
        Row: {
          couple_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          title: string;
        };
        Insert: {
          couple_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          title: string;
        };
        Update: {
          couple_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lists_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lists_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          author_id: string | null;
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
        Row: {
          platform: string;
          token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          platform: string;
          token: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          platform?: string;
          token?: string;
          updated_at?: string;
          user_id?: string;
        };
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_couple: {
        Args: never;
        Returns: {
          created_at: string;
          id: string;
          invite_code: string;
          started_on: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'couples';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      join_couple: {
        Args: { code: string };
        Returns: {
          created_at: string;
          id: string;
          invite_code: string;
          started_on: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'couples';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      register_push_token: {
        Args: { new_platform: string; new_token: string };
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
