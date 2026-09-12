export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          date_awarded: string | null
          description_conversational: string | null
          description_professional: string | null
          id: string
          issuer: string | null
          profile_id: string
          sort_order: number
          title: string
          url: string | null
        }
        Insert: {
          date_awarded?: string | null
          description_conversational?: string | null
          description_professional?: string | null
          id?: string
          issuer?: string | null
          profile_id: string
          sort_order?: number
          title: string
          url?: string | null
        }
        Update: {
          date_awarded?: string | null
          description_conversational?: string | null
          description_professional?: string | null
          id?: string
          issuer?: string | null
          profile_id?: string
          sort_order?: number
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "awards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          credential_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string
          profile_id: string
          sort_order: number
          title: string
          verification_url: string | null
        }
        Insert: {
          credential_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer: string
          profile_id: string
          sort_order?: number
          title: string
          verification_url?: string | null
        }
        Update: {
          credential_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string
          profile_id?: string
          sort_order?: number
          title?: string
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          description_conversational: string | null
          description_professional: string | null
          end_date: string | null
          id: string
          institution: string
          profile_id: string
          qualification: string
          sort_order: number
          specialisation: string | null
          start_date: string | null
        }
        Insert: {
          description_conversational?: string | null
          description_professional?: string | null
          end_date?: string | null
          id?: string
          institution: string
          profile_id: string
          qualification: string
          sort_order?: number
          specialisation?: string | null
          start_date?: string | null
        }
        Update: {
          description_conversational?: string | null
          description_professional?: string | null
          end_date?: string | null
          id?: string
          institution?: string
          profile_id?: string
          qualification?: string
          sort_order?: number
          specialisation?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          achievements_conversational: Json
          achievements_professional: Json
          company: string
          country: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean
          job_title: string
          profile_id: string
          skills: Json
          sort_order: number
          start_date: string | null
          summary_conversational: string | null
          summary_professional: string | null
        }
        Insert: {
          achievements_conversational?: Json
          achievements_professional?: Json
          company: string
          country?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title: string
          profile_id: string
          skills?: Json
          sort_order?: number
          start_date?: string | null
          summary_conversational?: string | null
          summary_professional?: string | null
        }
        Update: {
          achievements_conversational?: Json
          achievements_professional?: Json
          company?: string
          country?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title?: string
          profile_id?: string
          skills?: Json
          sort_order?: number
          start_date?: string | null
          summary_conversational?: string | null
          summary_professional?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          email: string | null
          first_name: string
          headline: string | null
          id: string
          linkedin_url: string | null
          profile_photo_url: string | null
          quick_facts: Json
          resume_url_conversational: string | null
          resume_url_professional: string | null
          summary_conversational: string | null
          summary_professional: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          email?: string | null
          first_name?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          profile_photo_url?: string | null
          quick_facts?: Json
          resume_url_conversational?: string | null
          resume_url_professional?: string | null
          summary_conversational?: string | null
          summary_professional?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          email?: string | null
          first_name?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          profile_photo_url?: string | null
          quick_facts?: Json
          resume_url_conversational?: string | null
          resume_url_professional?: string | null
          summary_conversational?: string | null
          summary_professional?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      skill_groups: {
        Row: {
          id: string
          name: string
          profile_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          profile_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          profile_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_groups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          skill_group_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          skill_group_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          skill_group_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_skill_group_id_fkey"
            columns: ["skill_group_id"]
            isOneToOne: false
            referencedRelation: "skill_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
