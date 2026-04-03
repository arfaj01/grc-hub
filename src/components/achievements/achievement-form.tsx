"use client";

import { useState, useEffect } from "react";
import { FormInput, FormTextarea, FormSelect, FormToggle, Button } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { createAchievement, updateAchievement, type AchievementFormData } from "@/lib/actions/achievements";
import type { Achievement, Goal, Initiative } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  achievement?: Achievement | null;
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title" | "goal_id">[];
}

const todayStr = () => new Date().toISOString().split("T")[0];

function defaults(): AchievementFormData {
  return {
    title: "",
    achievement_date: todayStr(),
    category: "تنفيذي",
    summary: "",
    description: "",
    impact: "",
    status: "مسودة",
    goal_id: null,
    initiative_id: null,
    source_reference: "",
    is_monthly_reportable: true,
    is_quarterly_reportable: false,
    is_annual_reportable: false,
    is_highlight: false,
  };
}

function fromRow(a: Achievement): AchievementFormData {
  return {
    title: a.title,
    achievement_date: a.achievement_date,
    category: a.category,
    summary: a.summary ?? "",
    description: a.description ?? "",
    impact: a.impact ?? "",
    status: a.status,
    goal_id: a.goal_id,
    initiative_id: a.initiative_id,
    source_reference: a.source_reference ?? "",
    is_monthly_reportable: a.is_monthly_reportable,
    is_quarterly_reportable: a.is_quarterly_reportable,
    is_annual_reportable: a.is_annual_reportable,
    is_highlight: a.is_highlight,
  };
}

export function AchievementForm({ open, onClose, achievement, goals, initiatives }: Props) {
  const isEdit = !!achievement;
  const [form, setForm] = useState<AchievementFormData>(achievement ? fromRow(achievement) : defaults());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens or achievement changes
  useEffect(() => {
    if (open) {
      setForm(achievement ? fromRow(achievement) : defaults());
      setErrors({});
    }
  }, [open, achievement]);

  const set = <K extends keyof AchievementFormData>(key: K, value: AchievementFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // Filter initiatives by selected goal
  const filteredInitiatives = form.goal_id
    ? initiatives.filter((i) => i.goal_id === form.goal_id)
    : initiatives;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "عنوان المنجز مطلوب";
    if (!form.achievement_date) e.achievement_date = "التاريخ مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const result = isEdit
      ? await updateAchievement(achievement!.id, form)
      : await createAchievement(form);

    setSaving(false);

    if (result.success) {
      toast(isEdit ? "تم تحديث المنجز بنجاح" : "تم إضافة المنجز بنجاح", "success");
      onClose();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل المنجز" : "إضافة منجز جديد"} size="lg">
      <div className="space-y-5">
        {/* Row 1: Title (full width — fastest entry) */}
        <FormInput
          label="عنوان المنجز"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
          placeholder="مثال: إطلاق منصة حوكمة البيانات"
          autoFocus
        />

        {/* Row 2: Date + Category + Status */}
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="التاريخ"
            type="date"
            required
            value={form.achievement_date}
            onChange={(e) => set("achievement_date", e.target.value)}
            error={errors.achievement_date}
          />
          <FormSelect
            label="التصنيف"
            value={form.category}
            onChange={(e) => set("category", e.target.value as AchievementFormData["category"])}
            options={[
              { value: "تنفيذي", label: "تنفيذي" },
              { value: "استراتيجي", label: "استراتيجي" },
            ]}
          />
          <FormSelect
            label="الحالة"
            value={form.status}
            onChange={(e) => set("status", e.target.value as AchievementFormData["status"])}
            options={[
              { value: "مسودة", label: "مسودة" },
              { value: "معتمد", label: "معتمد" },
              { value: "مميز", label: "مميز" },
            ]}
          />
        </div>

        {/* Row 3: Summary */}
        <FormTextarea
          label="الملخص"
          value={form.summary ?? ""}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="وصف مختصر للمنجز (سيظهر في التقارير الشهرية)"
          rows={2}
        />

        {/* Row 4: Goal + Initiative linking */}
        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="الهدف المرتبط"
            value={form.goal_id ?? ""}
            onChange={(e) => {
              set("goal_id", e.target.value || null);
              // Reset initiative if goal changes
              if (e.target.value !== form.goal_id) set("initiative_id", null);
            }}
            placeholder="— اختياري —"
            options={goals.map((g) => ({
              value: g.id,
              label: `${g.code}: ${g.title}`,
            }))}
          />
          <FormSelect
            label="المبادرة المرتبطة"
            value={form.initiative_id ?? ""}
            onChange={(e) => set("initiative_id", e.target.value || null)}
            placeholder="— اختياري —"
            options={filteredInitiatives.map((i) => ({
              value: i.id,
              label: i.title,
            }))}
          />
        </div>

        {/* Row 5: Reportability flags — quick toggles */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-gray-500 mb-1">إدراج في التقارير</p>
          <div className="grid grid-cols-2 gap-3">
            <FormToggle
              label="التقرير الشهري"
              checked={form.is_monthly_reportable}
              onChange={(v) => set("is_monthly_reportable", v)}
            />
            <FormToggle
              label="التقرير الربعي"
              checked={form.is_quarterly_reportable}
              onChange={(v) => set("is_quarterly_reportable", v)}
            />
            <FormToggle
              label="التقرير السنوي"
              checked={form.is_annual_reportable}
              onChange={(v) => set("is_annual_reportable", v)}
            />
            <FormToggle
              label="منجز مميز"
              checked={form.is_highlight}
              onChange={(v) => set("is_highlight", v)}
            />
          </div>
        </div>

        {/* Row 6: Expandable detail fields */}
        <details className="group">
          <summary className="text-sm font-medium text-brand-teal cursor-pointer hover:text-brand-teal-deep select-none">
            تفاصيل إضافية (اختياري)
          </summary>
          <div className="mt-3 space-y-3 pt-3 border-t">
            <FormTextarea
              label="الوصف التفصيلي"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
            <FormTextarea
              label="الأثر"
              value={form.impact ?? ""}
              onChange={(e) => set("impact", e.target.value)}
              placeholder="ما هو أثر هذا المنجز على الإدارة أو الوزارة؟"
              rows={2}
            />
            <FormInput
              label="مرجع المصدر"
              value={form.source_reference ?? ""}
              onChange={(e) => set("source_reference", e.target.value)}
              placeholder="بريد، خطاب، رقم معاملة..."
            />
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "تحديث" : "حفظ المنجز"}
          </Button>
          {!isEdit && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (!validate()) return;
                setSaving(true);
                const result = await createAchievement(form);
                setSaving(false);
                if (result.success) {
                  toast("تم إضافة المنجز بنجاح", "success");
                  setForm(defaults()); // Reset for next entry
                  setErrors({});
                } else {
                  toast(result.error, "error");
                }
              }}
              loading={saving}
            >
              حفظ وإضافة آخر
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
