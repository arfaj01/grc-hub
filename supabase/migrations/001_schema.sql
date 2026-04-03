-- ============================================================
-- DRD Executive Hub — Full Schema
-- Single-user executive management OS
-- Ministry of Municipalities & Housing
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT,
  department_name TEXT NOT NULL DEFAULT 'إدارة التطوير والتأهيل',
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────
-- 2. SETTINGS
-- ────────────────────────────────────────
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL DEFAULT 'إدارة التطوير والتأهيل',
  ministry_name TEXT NOT NULL DEFAULT 'وزارة البلديات والإسكان',
  report_header TEXT,
  report_footer TEXT,
  default_language TEXT NOT NULL DEFAULT 'ar',
  fiscal_year_start INTEGER NOT NULL DEFAULT 1 CHECK (fiscal_year_start BETWEEN 1 AND 12),
  theme_primary_color TEXT DEFAULT '026D69',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ────────────────────────────────────────
-- 3. GOALS
-- ────────────────────────────────────────
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  strategic_theme TEXT,
  description TEXT,
  success_metric_label TEXT,
  baseline_value NUMERIC,
  target_value NUMERIC,
  current_value NUMERIC,
  progress_percentage INTEGER NOT NULL DEFAULT 0
    CHECK (progress_percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'نشط'
    CHECK (status IN ('نشط','مكتمل','متأخر','معلق')),
  priority INTEGER NOT NULL DEFAULT 1,
  color TEXT,
  start_date DATE,
  target_date DATE,
  executive_comment TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, code)
);

CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

-- ────────────────────────────────────────
-- 4. DEVELOPMENT INITIATIVES
-- ────────────────────────────────────────
CREATE TABLE development_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  pillar TEXT,
  description TEXT,
  current_state TEXT,
  target_state TEXT,
  status TEXT NOT NULL DEFAULT 'جاري'
    CHECK (status IN ('جاري','مكتمل','جاري الطرح','في التصميم','دراسة أولية','لم يبدأ','متوقف','طور الترسية')),
  priority INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  target_date DATE,
  progress_percentage INTEGER NOT NULL DEFAULT 0
    CHECK (progress_percentage BETWEEN 0 AND 100),
  impact_statement TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_initiatives_user ON development_initiatives(user_id);
CREATE INDEX idx_initiatives_goal ON development_initiatives(goal_id);
CREATE INDEX idx_initiatives_status ON development_initiatives(status);

-- ────────────────────────────────────────
-- 5. ACHIEVEMENTS
-- ────────────────────────────────────────
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  initiative_id UUID REFERENCES development_initiatives(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  achievement_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'تنفيذي'
    CHECK (category IN ('استراتيجي','تنفيذي')),
  summary TEXT,
  description TEXT,
  impact TEXT,
  status TEXT NOT NULL DEFAULT 'معتمد'
    CHECK (status IN ('مسودة','معتمد','مميز')),
  is_monthly_reportable BOOLEAN NOT NULL DEFAULT true,
  is_quarterly_reportable BOOLEAN NOT NULL DEFAULT true,
  is_annual_reportable BOOLEAN NOT NULL DEFAULT true,
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_date ON achievements(achievement_date DESC);
CREATE INDEX idx_achievements_goal ON achievements(goal_id);
CREATE INDEX idx_achievements_initiative ON achievements(initiative_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_reporting ON achievements(is_monthly_reportable, is_quarterly_reportable, is_annual_reportable);

-- ────────────────────────────────────────
-- 6. TAGS
-- ────────────────────────────────────────
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '026D69',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- ────────────────────────────────────────
-- 7. ACHIEVEMENT_TAGS (junction)
-- ────────────────────────────────────────
CREATE TABLE achievement_tags (
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (achievement_id, tag_id)
);

-- ────────────────────────────────────────
-- 8. REPORT PERIODS
-- ────────────────────────────────────────
CREATE TABLE report_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL
    CHECK (period_type IN ('monthly','quarterly','annual')),
  label TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'مفتوح'
    CHECK (status IN ('مفتوح','مغلق','منشور')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (period_type = 'monthly' AND month IS NOT NULL) OR
    (period_type = 'quarterly' AND quarter IS NOT NULL) OR
    (period_type = 'annual')
  )
);

CREATE INDEX idx_report_periods_user ON report_periods(user_id);
CREATE INDEX idx_report_periods_type ON report_periods(period_type);
CREATE INDEX idx_report_periods_dates ON report_periods(start_date, end_date);

-- ────────────────────────────────────────
-- 9. REPORTS
-- ────────────────────────────────────────
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_id UUID REFERENCES report_periods(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL
    CHECK (report_type IN ('monthly','quarterly','annual','executive_summary')),
  title TEXT NOT NULL,
  executive_summary TEXT,
  overall_progress_summary TEXT,
  achievements_summary TEXT,
  challenges_summary TEXT,
  next_steps_summary TEXT,
  generated_snapshot JSONB,
  status TEXT NOT NULL DEFAULT 'مسودة'
    CHECK (status IN ('مسودة','معتمد','منشور')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_period ON reports(period_id);
CREATE INDEX idx_reports_type ON reports(report_type);

-- ────────────────────────────────────────
-- 10. REPORT SECTIONS
-- ────────────────────────────────────────
CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_sections_report ON report_sections(report_id);

-- ────────────────────────────────────────
-- 11. ATTACHMENTS
-- ────────────────────────────────────────
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  initiative_id UUID REFERENCES development_initiatives(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_user ON attachments(user_id);
CREATE INDEX idx_attachments_achievement ON attachments(achievement_id);
CREATE INDEX idx_attachments_goal ON attachments(goal_id);
CREATE INDEX idx_attachments_initiative ON attachments(initiative_id);

-- ────────────────────────────────────────
-- 12. NOTES
-- ────────────────────────────────────────
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  initiative_id UUID REFERENCES development_initiatives(id) ON DELETE SET NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'عام'
    CHECK (note_type IN ('عام','استراتيجي','تحدي','فرصة','مستقبلي','ملاحظة تقرير')),
  title TEXT,
  body TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_type ON notes(note_type);
CREATE INDEX idx_notes_date ON notes(note_date DESC);

-- ────────────────────────────────────────
-- AUTO-UPDATE TIMESTAMPS
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_initiatives_updated BEFORE UPDATE ON development_initiatives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_report_periods_updated BEFORE UPDATE ON report_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_report_sections_updated BEFORE UPDATE ON report_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────
-- ROW LEVEL SECURITY (simplified single-user)
-- ────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Single-user policies: authenticated user owns all their rows
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own settings" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own initiatives" ON development_initiatives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tags" ON tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own achievement_tags" ON achievement_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM achievements a WHERE a.id = achievement_id AND a.user_id = auth.uid()));
CREATE POLICY "Users manage own report_periods" ON report_periods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reports" ON reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own report_sections" ON report_sections FOR ALL
  USING (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND r.user_id = auth.uid()));
CREATE POLICY "Users manage own attachments" ON attachments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────
-- STORAGE BUCKET
-- ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users manage attachments" ON storage.objects
  FOR ALL USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');
