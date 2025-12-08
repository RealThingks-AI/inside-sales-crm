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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company_name: string | null
          contact_name: string
          contact_owner: string | null
          contact_source: string | null
          created_by: string | null
          created_time: string | null
          description: string | null
          email: string | null
          id: string
          industry: string | null
          linkedin: string | null
          modified_by: string | null
          modified_time: string | null
          phone_no: string | null
          position: string | null
          region: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          contact_name: string
          contact_owner?: string | null
          contact_source?: string | null
          created_by?: string | null
          created_time?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          modified_by?: string | null
          modified_time?: string | null
          phone_no?: string | null
          position?: string | null
          region?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          contact_name?: string
          contact_owner?: string | null
          contact_source?: string | null
          created_by?: string | null
          created_time?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          modified_by?: string | null
          modified_time?: string | null
          phone_no?: string | null
          position?: string | null
          region?: string | null
          website?: string | null
        }
        Relationships: []
      }
      dashboard_preferences: {
        Row: {
          card_order: Json | null
          created_at: string | null
          id: string
          layout_view: string | null
          updated_at: string | null
          user_id: string
          visible_widgets: Json | null
        }
        Insert: {
          card_order?: Json | null
          created_at?: string | null
          id?: string
          layout_view?: string | null
          updated_at?: string | null
          user_id: string
          visible_widgets?: Json | null
        }
        Update: {
          card_order?: Json | null
          created_at?: string | null
          id?: string
          layout_view?: string | null
          updated_at?: string | null
          user_id?: string
          visible_widgets?: Json | null
        }
        Relationships: []
      }
      deal_action_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          deal_id: string
          due_date: string | null
          id: string
          next_action: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          deal_id: string
          due_date?: string | null
          id?: string
          next_action: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string
          due_date?: string | null
          id?: string
          next_action?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_action_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          action_items: string | null
          budget: string | null
          business_value: string | null
          closing: string | null
          created_at: string | null
          created_by: string
          currency_type: string | null
          current_status: string | null
          customer_challenges: string | null
          customer_name: string | null
          customer_need: string | null
          deal_name: string
          decision_maker_level: string | null
          drop_reason: string | null
          end_date: string | null
          expected_closing_date: string | null
          handoff_status: string | null
          id: string
          implementation_start_date: string | null
          internal_comment: string | null
          is_recurring: string | null
          lead_name: string | null
          lead_owner: string | null
          lost_reason: string | null
          modified_at: string | null
          modified_by: string | null
          need_improvement: string | null
          priority: number | null
          probability: number | null
          project_duration: number | null
          project_name: string | null
          proposal_due_date: string | null
          quarterly_revenue_q1: number | null
          quarterly_revenue_q2: number | null
          quarterly_revenue_q3: number | null
          quarterly_revenue_q4: number | null
          region: string | null
          relationship_strength: string | null
          rfq_received_date: string | null
          rfq_status: string | null
          signed_contract_date: string | null
          stage: string
          start_date: string | null
          total_contract_value: number | null
          total_revenue: number | null
          won_reason: string | null
        }
        Insert: {
          action_items?: string | null
          budget?: string | null
          business_value?: string | null
          closing?: string | null
          created_at?: string | null
          created_by: string
          currency_type?: string | null
          current_status?: string | null
          customer_challenges?: string | null
          customer_name?: string | null
          customer_need?: string | null
          deal_name: string
          decision_maker_level?: string | null
          drop_reason?: string | null
          end_date?: string | null
          expected_closing_date?: string | null
          handoff_status?: string | null
          id?: string
          implementation_start_date?: string | null
          internal_comment?: string | null
          is_recurring?: string | null
          lead_name?: string | null
          lead_owner?: string | null
          lost_reason?: string | null
          modified_at?: string | null
          modified_by?: string | null
          need_improvement?: string | null
          priority?: number | null
          probability?: number | null
          project_duration?: number | null
          project_name?: string | null
          proposal_due_date?: string | null
          quarterly_revenue_q1?: number | null
          quarterly_revenue_q2?: number | null
          quarterly_revenue_q3?: number | null
          quarterly_revenue_q4?: number | null
          region?: string | null
          relationship_strength?: string | null
          rfq_received_date?: string | null
          rfq_status?: string | null
          signed_contract_date?: string | null
          stage?: string
          start_date?: string | null
          total_contract_value?: number | null
          total_revenue?: number | null
          won_reason?: string | null
        }
        Update: {
          action_items?: string | null
          budget?: string | null
          business_value?: string | null
          closing?: string | null
          created_at?: string | null
          created_by?: string
          currency_type?: string | null
          current_status?: string | null
          customer_challenges?: string | null
          customer_name?: string | null
          customer_need?: string | null
          deal_name?: string
          decision_maker_level?: string | null
          drop_reason?: string | null
          end_date?: string | null
          expected_closing_date?: string | null
          handoff_status?: string | null
          id?: string
          implementation_start_date?: string | null
          internal_comment?: string | null
          is_recurring?: string | null
          lead_name?: string | null
          lead_owner?: string | null
          lost_reason?: string | null
          modified_at?: string | null
          modified_by?: string | null
          need_improvement?: string | null
          priority?: number | null
          probability?: number | null
          project_duration?: number | null
          project_name?: string | null
          proposal_due_date?: string | null
          quarterly_revenue_q1?: number | null
          quarterly_revenue_q2?: number | null
          quarterly_revenue_q3?: number | null
          quarterly_revenue_q4?: number | null
          region?: string | null
          relationship_strength?: string | null
          rfq_received_date?: string | null
          rfq_status?: string | null
          signed_contract_date?: string | null
          stage?: string
          start_date?: string | null
          total_contract_value?: number | null
          total_revenue?: number | null
          won_reason?: string | null
        }
        Relationships: []
      }
      keep_alive: {
        Row: {
          "Able to read DB": string | null
          created_at: string
          id: number
        }
        Insert: {
          "Able to read DB"?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          "Able to read DB"?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      lead_action_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          lead_id: string
          next_action: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          next_action: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          next_action?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company_name: string | null
          contact_owner: string | null
          contact_source: string | null
          country: string | null
          created_by: string | null
          created_time: string | null
          description: string | null
          email: string | null
          id: string
          industry: string | null
          lead_name: string
          lead_status: string | null
          linkedin: string | null
          modified_by: string | null
          modified_time: string | null
          phone_no: string | null
          position: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          contact_owner?: string | null
          contact_source?: string | null
          country?: string | null
          created_by?: string | null
          created_time?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lead_name: string
          lead_status?: string | null
          linkedin?: string | null
          modified_by?: string | null
          modified_time?: string | null
          phone_no?: string | null
          position?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          contact_owner?: string | null
          contact_source?: string | null
          country?: string | null
          created_by?: string | null
          created_time?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lead_name?: string
          lead_status?: string | null
          linkedin?: string | null
          modified_by?: string | null
          modified_time?: string | null
          phone_no?: string | null
          position?: string | null
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_item_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          message: string
          notification_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_item_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          message: string
          notification_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_item_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          message?: string
          notification_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          "Email ID": string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          "Email ID"?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          "Email ID"?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          filter_type: string
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_type?: string
          filters: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_type?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      yearly_revenue_targets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          total_target: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          total_target?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          total_target?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_admin_by_metadata: { Args: never; Returns: boolean }
      is_user_admin: { Args: { user_id?: string }; Returns: boolean }
      log_data_access: {
        Args: {
          p_operation: string
          p_record_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: undefined
      }
      update_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      user_role: ["admin", "manager", "user"],
    },
  },
} as const
