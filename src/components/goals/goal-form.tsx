"use client";

import { useState, useEffect } from "react";
import { FormInput, FormTextarea, FormSelect, Button } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { createGoal, updateGoal, type GoalFormData } from "@/lib/actions/goals";
import type { Goal } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
  existingCodes: string[];
}

function defaults(): GoalFormData {
  return {
    code: "",
    title: "",
    strategic_theme: "",
    description: "",
    success_metric_label: "",
    baseline_value: null,
    target_value: null,
    current_value: null,
    progress_percentage: 0,
    status: "نشط",
    priority: 1,
    color: "#026D69",
    start_date: null,
    target_date: null,
    executive_comment: "",
  };
}

function fromRow(g: Goal): GoalFormData {
  return {
    code: g.code,
    title: g.title,
    strategic_theme: g.strategic_theme ?? "",
    description: g.description ?? "",
    success_metric_label: g.success_metric_label ?? "",
    baseline_value: g.baseline_value,
    target_value: g.target_value,
    current_value: g.current_value,
    progress_percentage: g.progress_percentage,
    status: g.status,
    priority: g.priority,
    color: g.color ?? "#026D69",
    start_date: g.start_date,
    target_date: g.target_date,
    executive_comment: g.executive_comment ?? "",
  };
}

export function GoalForm({ open, onClose, goal, existingCodes }: Props) {
  const isEdit = !!goal;
  const [form, setForm] = useState<GoalFormData>(goal ? fromRow(goal) : defaults());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(goal ? fromRow(goal) : defaults());
      setErrors({});
    }
  }, [open, goal]);

  const set = <K extends keyof GoalFormData>(key: K, value: GoalFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = "رمز الهدف مطلوب";
    else if (!isEdit && existingCodes.includes(form.code.trim())) e.code = "هذا الرمز مستخدم";
    if (!form.title.trim()) e.title = "عنوان الهدف مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = isEdit ? await updateGoal(goal!.id, form) : await createGoal(form);
    setSaving(false);
    if (result.success) {
      toast(isEdit ? "تم تحديث الهدف بنجاح" : "تم إضافة الهدف بنجاح", "success");
      onClose();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الهدف" : "إضافة هدف جديد"}>
      <div className="space-y-4">
        {/* Row 1: Code + Title */}
        <div className="grid grid-cols-4 gap-3">
          <FormInput
            label="الرمز"
            required
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
            error={errors.code}
            placeholder="g5"
            autoFocus
          />
          <FormInput
            label="عنوان الهدف"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            error={errors.title}
            wrapperClassName="col-span-3"
          />
        </div>

        {/* Row 2: Theme + Status + Priority */}
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="المحور الاستراتيجي"
            value={form.strategic_theme ?? ""}
            onChange={(e) => set("strategic_theme", e.target.value)}
          />
          <FormSelect
            label="الحالة"
            value={form.status}
            onChange={(e) => set("status", e.target.value as GoalFormData["status"])}
            options={[
              { value: "نشط", label: "نشط" },
              { value: "مكتمل", label: "مكتمل" },
              { value: "متأخر", label: "متأخر" },
              { value: "معلق", label: "معلق" },
            ]}
          />
          <FormInput
            label="الأولوية"
            type="number"
            min={1}
            value={form.priority ?? 1}
            onChange={(e) => set("priority", Number(e.target.value))}
          />
        </div>

        {/* Row 3: Metrics */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-gray-500">مؤشر الأداء</p>
          <FormInput
            label="مسمى المؤشر"
            value={form.success_metric_label ?? ""}
            onChange={(e) => set("success_metric_label", e.target.value)}
            placeholder="مثال: نسبة اكتمال المشاريع"
          />
          <div className="grid grid-cols-3 gap-3">
            <FormInput
              label="خط الأساس"
              type="number"
              value={form.baseline_value ?? ""}
              onChange={(e) => set("baseline_value", e.target.value ? Number(e.target.value) : null)}
            />
            <FormInput
              label="المستهدف"
              type="number"
              value={form.target_value ?? ""}
              onChange={(e) => set("target_value", e.target.value ? Number(e.target.value) : null)}
            />
            <FormInput
              label="الحالي"
              type="number"
              value={form.current_value ?? ""}
              onChange={(e) => set("current_value", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <FormInput
            label="نسبة التقدم %"
            type="number"
            min={0}
            max={100}
            value={form.progress_percentage ?? 0}
            onChange={(e) => set("progress_percentage", Number(e.target.value))}
          />
        </div>

        {/* Row 4: Dates */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="تاريخ البداية"
            type="date"
            value={form.start_date ?? ""}
            onChange={(e) => set("start_date", e.target.value || null)}
          />
          <FormInput
            label="التاريخ المستهدف"
            type="date"
            value={form.target_date ?? ""}
            onChange={(e) => set("target_date", e.target.value || null)}
          />
        </div>

        {/* Row 5: Description */}
        <FormTextarea
          label="الوصف"
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />

        <FormTextarea
          label="ملاحظة تنفيذية"
          value={form.executive_comment ?? ""}
          onChange={(e) => set("executive_comment", e.target.value)}
          rows={2}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "تحديث" : "حفظ الهدف"}
          </Button>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}
