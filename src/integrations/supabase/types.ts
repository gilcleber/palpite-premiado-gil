export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          id: string
          tenant_id: string | null
          role: 'super_admin' | 'admin' | null
          created_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          role?: 'super_admin' | 'admin' | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          role?: 'super_admin' | 'admin' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          draw_date: string | null
          id: string
          prize_description: string
          prize_image_url: string | null
          prize_title: string
          updated_at: string | null
          team_a: string | null
          team_b: string | null
          team_a_logo_url: string | null
          team_b_logo_url: string | null
          score_team_a: number | null
          score_team_b: number | null
          radio_logo_url: string | null
          radio_slogan: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          draw_date?: string | null
          id?: string
          prize_description?: string
          prize_image_url?: string | null
          prize_title?: string
          updated_at?: string | null
          team_a?: string | null
          team_b?: string | null
          team_a_logo_url?: string | null
          team_b_logo_url?: string | null
          score_team_a?: number | null
          score_team_b?: number | null
          radio_logo_url?: string | null
          radio_slogan?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          draw_date?: string | null
          id?: string
          prize_description?: string
          prize_image_url?: string | null
          prize_title?: string
          updated_at?: string | null
          team_a?: string | null
          team_b?: string | null
          team_a_logo_url?: string | null
          team_b_logo_url?: string | null
          score_team_a?: number | null
          score_team_b?: number | null
          radio_logo_url?: string | null
          radio_slogan?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      palpites: {
        Row: {
          cidade: string
          cpf: string
          created_at: string | null
          escolha: string
          game_date: string
          id: string
          instagram_handle: string | null
          nome_completo: string
          placar_time_a: number | null
          placar_time_b: number | null
          telefone: string
          time_a: string
          time_b: string
          tenant_id: string | null
        }
        Insert: {
          cidade: string
          cpf: string
          created_at?: string | null
          escolha: string
          game_date?: string
          id?: string
          instagram_handle?: string | null
          nome_completo: string
          placar_time_a?: number | null
          placar_time_b?: number | null
          telefone: string
          time_a: string
          time_b: string
          tenant_id?: string | null
        }
        Update: {
          cidade?: string
          cpf?: string
          created_at?: string | null
          escolha?: string
          game_date?: string
          id?: string
          instagram_handle?: string | null
          nome_completo?: string
          placar_time_a?: number | null
          placar_time_b?: number | null
          telefone?: string
          time_a?: string
          time_b?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "palpites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      prizes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prizes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          owner_email: string
          valid_until: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_email: string
          valid_until?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_email?: string
          valid_until?: string | null
          status?: string | null
          created_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
