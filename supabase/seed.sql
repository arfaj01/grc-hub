-- ============================================================
-- DRD Executive Hub — Seed Data
-- Real data from existing system (Nov 2025 — Mar 2026)
-- ============================================================
-- IMPORTANT: Replace 'USER_ID_HERE' with actual auth.users id
-- after creating the admin account in Supabase Auth.
-- ============================================================

-- Variable for user ID (set after account creation)
-- Run: SELECT id FROM auth.users LIMIT 1;
-- Then replace all occurrences below.

-- ────────────────────────────────────────
-- SETTINGS
-- ────────────────────────────────────────
INSERT INTO settings (user_id, department_name, ministry_name, report_header, report_footer)
VALUES (
  'USER_ID_HERE',
  'إدارة التطوير والتأهيل',
  'وزارة البلديات والإسكان',
  'وزارة البلديات والإسكان — إدارة التطوير والتأهيل',
  'وثيقة رسمية — سري'
);

-- ────────────────────────────────────────
-- GOALS (4 strategic goals)
-- ────────────────────────────────────────
INSERT INTO goals (user_id, code, title, strategic_theme, color, status, progress_percentage, sort_order) VALUES
('USER_ID_HERE', 'g1', 'التحول الرقمي', 'تعزيز القدرات الرقمية والأتمتة', '1A5276', 'نشط', 25, 1),
('USER_ID_HERE', 'g2', 'التعاقدات', 'رفع كفاءة إدارة التعاقدات والمشاريع', 'A8872C', 'نشط', 60, 2),
('USER_ID_HERE', 'g3', 'ديوان الوزارة', 'تطوير وتأهيل مبنى ديوان الوزارة', '86B940', 'نشط', 75, 3),
('USER_ID_HERE', 'g4', 'بناء القدرات', 'تطوير الكفاءات والقدرات البشرية', '026D69', 'نشط', 10, 4);

-- ────────────────────────────────────────
-- DEVELOPMENT INITIATIVES (14 projects across 3 tracks)
-- ────────────────────────────────────────

-- Track 1: مسار تطوير مبنى ديوان الوزارة (goal: g3)
INSERT INTO development_initiatives (user_id, goal_id, title, pillar, status, progress_percentage, sort_order) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع أنسنة البيئة المحيطة بالديوان', 'مسار تطوير مبنى ديوان الوزارة', 'جاري', 90, 1),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع إعادة تأهيل الواجهات الخارجية', 'مسار تطوير مبنى ديوان الوزارة', 'مكتمل', 100, 2),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع تطوير قاعة الاتفاقيات', 'مسار تطوير مبنى ديوان الوزارة', 'مكتمل', 100, 3),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع تركيب كاميرات المراقبة', 'مسار تطوير مبنى ديوان الوزارة', 'مكتمل', 100, 4),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع تطوير منظومة الإضاءة الداخلية', 'مسار تطوير مبنى ديوان الوزارة', 'مكتمل', 100, 5),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع تحسين أنظمة التكييف', 'مسار تطوير مبنى ديوان الوزارة', 'جاري', 65, 6),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع حلول الوصول الشامل', 'مسار تطوير مبنى ديوان الوزارة', 'جاري', 45, 7),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع تطوير المداخل والممرات', 'مسار تطوير مبنى ديوان الوزارة', 'جاري', 30, 8),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1), 'مشروع التوسعة الإنشائية للمبنى', 'مسار تطوير مبنى ديوان الوزارة', 'في التصميم', 15, 9);

-- Track 2: مسار تطوير مراكز الإيواء (goal: g2)
INSERT INTO development_initiatives (user_id, goal_id, title, pillar, status, progress_percentage, sort_order) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1), 'مشروع الرفع المساحي لمراكز الإيواء', 'مسار تطوير مراكز الإيواء بالمشاعر المقدسة', 'مكتمل', 100, 10),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1), 'مشروع الدراسات والتصاميم لتأهيل المراكز', 'مسار تطوير مراكز الإيواء بالمشاعر المقدسة', 'جاري الطرح', 40, 11),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1), 'مشروع الفيديو التوثيقي الاستراتيجي', 'مسار تطوير مراكز الإيواء بالمشاعر المقدسة', 'مكتمل', 100, 12);

-- Track 3: مسار تطوير مركز الوثائق (goal: g1)
INSERT INTO development_initiatives (user_id, goal_id, title, pillar, status, progress_percentage, sort_order) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g1' LIMIT 1), 'مشروع إعادة تأهيل مبنى الوثائق', 'مسار تطوير مركز الوثائق والمحفوظات', 'في التصميم', 25, 13),
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g1' LIMIT 1), 'مشروع الأرشفة الإلكترونية', 'مسار تطوير مركز الوثائق والمحفوظات', 'دراسة أولية', 10, 14);

-- ────────────────────────────────────────
-- TAGS
-- ────────────────────────────────────────
INSERT INTO tags (user_id, name, color) VALUES
('USER_ID_HERE', 'استراتيجي', '1A5276'),
('USER_ID_HERE', 'تنفيذي', 'A8872C');

-- ────────────────────────────────────────
-- ACHIEVEMENTS (15 records: Nov 2025 — Mar 2026)
-- ────────────────────────────────────────

-- November 2025
INSERT INTO achievements (user_id, goal_id, title, achievement_date, category, description, impact, status) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'إنتاج فيديو توثيقي استراتيجي لمراكز الإيواء بالمشاعر المقدسة',
 '2025-11-10', 'استراتيجي',
 'تم تنفيذ فيديو احترافي باستخدام تقنيات التصوير الجوي (درونز) لتوثيق الوضع الراهن لمراكز الإيواء',
 'فيديو توثيقي استراتيجي عالي الجودة', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'تصميم حلول الوصول الشامل لمقر الوزارة خلال فترة التوسعة',
 '2025-11-18', 'استراتيجي',
 'إعداد تصور هندسي وتنظيمي شامل لضمان سهولة الوصول لجميع المستفيدين',
 'تصور هندسي متكامل لحلول الوصول الشامل', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'إعادة تجهيز قاعة الاتفاقيات بديوان الوزارة',
 '2025-11-25', 'تنفيذي',
 'إعادة تجهيز وتأهيل قاعة الاتفاقيات وفق تطلعات معالي الوزير',
 'قاعة اتفاقيات مجهزة بالكامل', 'معتمد');

-- December 2025
INSERT INTO achievements (user_id, goal_id, title, achievement_date, category, description, impact, status) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'استكمال تجهيز وثائق مشروعين إضافيين للطرح عبر منصة اعتماد',
 '2025-12-08', 'استراتيجي',
 'استكمال تجهيز وثائق مشروعين إضافيين (المشروعان 3 و4 من أصل 6) استعداداً للطرح عبر منصة اعتماد',
 'وثائق مشروعين جاهزة للطرح', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'تنسيق طرح مشروع الدراسات والتصاميم لتأهيل مراكز الإيواء',
 '2025-12-12', 'استراتيجي',
 'استكمال تنسيق طرح مشروع الدراسات والتصاميم لتأهيل مراكز الإيواء بالمشاعر المقدسة',
 'مشروع جاهز للطرح عبر المنصة', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'استكمال 90% من أعمال أنسنة البيئة المحيطة بديوان الوزارة',
 '2025-12-18', 'تنفيذي',
 'تقدم ملموس في مشروع أنسنة البيئة المحيطة بمبنى ديوان الوزارة',
 'نسبة إنجاز 90% من المشروع', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'رفع نسبة الصرف على المشاريع إلى 82%',
 '2025-12-22', 'تنفيذي',
 'تحسين أداء الصرف على المشاريع الجارية',
 'نسبة صرف 82%', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'استكمال تركيب كاميرات المراقبة في مرافق الوزارة',
 '2025-12-28', 'تنفيذي',
 'تركيب منظومة كاميرات المراقبة في كافة مرافق الوزارة',
 'منظومة مراقبة متكاملة', 'معتمد');

-- January 2026
INSERT INTO achievements (user_id, goal_id, title, achievement_date, category, description, impact, status) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'تطوير مفهوم تصميمي لتوسعة مقر الوزارة',
 '2026-01-15', 'استراتيجي',
 'تطوير مفهوم تصميمي يعزز كفاءة استيعاب الاحتياجات المستقبلية للوزارة',
 'مفهوم تصميمي متكامل للتوسعة', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'إنهاء الرفع المساحي لمراكز الإيواء بالمشاعر المقدسة',
 '2026-01-22', 'تنفيذي',
 'إنهاء أعمال الرفع المساحي قبل الموعد المخطط',
 'رفع مساحي مكتمل لجميع المراكز', 'معتمد');

-- February 2026
INSERT INTO achievements (user_id, goal_id, title, achievement_date, category, description, impact, status) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g3' LIMIT 1),
 'تطوير مفهوم تصميمي لتوسعة مقر الوزارة',
 '2026-02-10', 'استراتيجي',
 'يعزز كفاءة استيعاب الاحتياجات المستقبلية',
 'مفهوم تصميمي معتمد', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'إنهاء أعمال الرفع المساحي لمراكز الإيواء',
 '2026-02-20', 'تنفيذي',
 'إنهاء أعمال الرفع المساحي قبل الموعد المخطط',
 'رفع مساحي مكتمل', 'معتمد');

-- March 2026
INSERT INTO achievements (user_id, goal_id, title, achievement_date, category, description, impact, status) VALUES
('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'استكمال ترسية ثلاثة عقود من أصل خمسة ضمن خطة الطرح السنوية لعام 2026',
 '2026-03-10', 'استراتيجي',
 'تسريع وتيرة التنفيذ وتحقيق نسبة إنجاز 60% من خطة التعاقد السنوية',
 'ثلاثة عقود مرساة من أصل خمسة', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g1' LIMIT 1),
 'تطوير منصة رقمية متكاملة لمتابعة المطالبات المالية وأوامر الصرف (مرحلة البرمجة)',
 '2026-03-18', 'استراتيجي',
 'رفع كفاءة متابعة المستحقات المالية وتقليل زمن دورة الصرف وتوفير رؤية شاملة للوضع المالي',
 'منصة رقمية في مرحلة البرمجة', 'معتمد'),

('USER_ID_HERE', (SELECT id FROM goals WHERE code='g2' LIMIT 1),
 'إغلاق خمسة مشاريع نشطة بنسبة إنجاز 100%',
 '2026-03-25', 'تنفيذي',
 'تخفيض عدد المشاريع النشطة وتحرير الموارد الفنية والإدارية وتحسين مؤشر كفاءة إدارة المحفظة',
 'خمسة مشاريع مغلقة بنجاح', 'معتمد');

-- ────────────────────────────────────────
-- REPORT PERIODS (Nov 2025 — Mar 2026)
-- ────────────────────────────────────────
INSERT INTO report_periods (user_id, period_type, label, year, month, start_date, end_date) VALUES
('USER_ID_HERE', 'monthly', 'نوفمبر 2025', 2025, 11, '2025-11-01', '2025-11-30'),
('USER_ID_HERE', 'monthly', 'ديسمبر 2025', 2025, 12, '2025-12-01', '2025-12-31'),
('USER_ID_HERE', 'monthly', 'يناير 2026', 2026, 1, '2026-01-01', '2026-01-31'),
('USER_ID_HERE', 'monthly', 'فبراير 2026', 2026, 2, '2026-02-01', '2026-02-28'),
('USER_ID_HERE', 'monthly', 'مارس 2026', 2026, 3, '2026-03-01', '2026-03-31');
