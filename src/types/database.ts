export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          title: string | null;
          department_name: string;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at"> & {
          department_name?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          title: string;
          strategic_theme: string | null;
          description: string | null;
          success_metric_label: string | null;
          baseline_value: number | null;
          target_value: number | null;
          current_value: number | null;
          progress_percentage: number;
          status: "نشط" | "مكتمل" | "متأخر" | "معلق";
          priority: number;
          color: string | null;
          start_date: string | null;
          target_date: string | null;
          executive_comment: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          progress_percentage?: number;
          status?: "نشط" | "مكتمل" | "متأخر" | "معلق";
          priority?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
      development_initiatives: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          title: string;
          pillar: string | null;
          description: string | null;
          current_state: string | null;
          target_state: string | null;
          status: "جاري" | "مكتمل" | "جاري الطرح" | "في التصميم" | "دراسة أولية" | "لم يبدأ" | "متوقف" | "طور الترسية";
          priority: number;
          start_date: string | null;
          target_date: string | null;
          progress_percentage: number;
          impact_statement: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["development_initiatives"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          status?: "جاري" | "مكتمل" | "جاري الطرح" | "في التصميم" | "دراسة أولية" | "لم يبدأ" | "متوقف" | "طور الترسية";
          priority?: number;
          progress_percentage?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["development_initiatives"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          initiative_id: string | null;
          title: string;
          achievement_date: string;
          category: "استراتيجي" | "تنفيذي";
          summary: string | null;
          description: string | null;
          impact: string | null;
          status: "مسودة" | "معتمد" | "مميز";
          is_monthly_reportable: boolean;
          is_quarterly_reportable: boolean;
          is_annual_reportable: boolean;
          is_highlight: boolean;
          source_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          category?: "استراتيجي" | "تنفيذي";
          status?: "مسودة" | "معتمد" | "مميز";
          is_monthly_reportable?: boolean;
          is_quarterly_reportable?: boolean;
          is_annual_reportable?: boolean;
          is_highlight?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tags"]["Row"], "id" | "created_at"> & {
          id?: string;
          color?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      achievement_tags: {
        Row: {
          achievement_id: string;
          tag_id: string;
        };
        Insert: Database["public"]["Tables"]["achievement_tags"]["Row"];
        Update: Partial<Database["public"]["Tables"]["achievement_tags"]["Insert"]>;
      };
      report_periods: {
        Row: {
          id: string;
          user_id: string;
          period_type: "monthly" | "quarterly" | "annual";
          label: string;
          year: number;
          month: number | null;
          quarter: number | null;
          start_date: string;
          end_date: string;
          status: "مفتوح" | "مغلق" | "منشور";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_periods"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          status?: "مفتوح" | "مغلق" | "منشور";
        };
        Update: Partial<Database["public"]["Tables"]["report_periods"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          period_id: string | null;
          report_type: "monthly" | "quarterly" | "annual" | "executive_summary";
          title: string;
          executive_summary: string | null;
          overall_progress_summary: string | null;
          achievements_summary: string | null;
          challenges_summary: string | null;
          next_steps_summary: string | null;
          generated_snapshot: Record<string, unknown> | null;
          status: "مسودة" | "معتمد" | "منشور";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          status?: "مسودة" | "معتمد" | "منشور";
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      report_sections: {
        Row: {
          id: string;
          report_id: string;
          section_key: string;
          title: string;
          body: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_sections"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["report_sections"]["Insert"]>;
      };
      attachments: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string | null;
          goal_id: string | null;
          initiative_id: string | null;
          report_id: string | null;
          file_name: string;
          file_path: string;
          file_type: string | null;
          file_size: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attachments"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          initiative_id: string | null;
          achievement_id: string | null;
          report_id: string | null;
          note_type: "عام" | "استراتيجي" | "تحدي" | "فرصة" | "مستقبلي" | "ملاحظة تقرير";
          title: string | null;
          body: string;
          note_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          note_type?: "عام" | "استراتيجي" | "تحدي" | "فرصة" | "مستقبلي" | "ملاحظة تقرير";
          note_date?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          department_name: string;
          ministry_name: string;
          report_header: string | null;
          report_footer: string | null;
          default_language: string;
          fiscal_year_start: number;
          theme_primary_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          department_name?: string;
          ministry_name?: string;
          default_language?: string;
          fiscal_year_start?: number;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
};

// Convenience aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Initiative = Database["public"]["Tables"]["development_initiatives"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type ReportPeriod = Database["public"]["Tables"]["report_periods"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportSection = Database["public"]["Tables"]["report_sections"]["Row"];
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type AchievementTag = Database["public"]["Tables"]["achievement_tags"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
