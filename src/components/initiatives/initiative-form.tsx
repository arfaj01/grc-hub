"use client";

import { useState, useEffect } from "react";
import { FormInput, FormTextarea, FormSelect, Button } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { createInitiative, updateInitiative, type InitiativeFormData } from "@/lib/actions/initiatives";
import type { Initiative, Goal } from "@/types/database";

const PILLAR_OPTIONS = [
  { value: "الخدمات والمنتجات", label: "الخدمات والمنتجات" },
  { value: "التنظيمي والمؤسسي", label: "التنظيمي والمؤسسي" },
  { value: "القدرات والتمكين", label: "القدرات والتمكين" },
];

const STATUS_OPTIONS = [
  { value: "لم يبدأ", label: "لم يبدأ" },
  { value: "دراسة أولية", label: "دراسة أولية" },
  { value: "في التصميم", label: "في التصميم" },
  { value: "جاري الطرح", label: "جاري الطرح" },
  { value: "طور الترسية", label: "طور الترسية" },
  { value: "جاري", label: "جاري" },
  { value: "مكتمل", label: "مكتمل" },
  { value: "متوقف", label: "متوقف" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  initiative?: Initiative | null;
  goals: Pick<Goal, "id" | "code" | "title">[];
}

function defaults(): InitiativeFormData {
  return {
    title: "",
    goal_id: null,
    pillar: "",
    description: "",
    current_state: "",
    target_state: "",
    status: "لم يبدأ",
    priority: 1,
    start_date: null,
    target_date: null,
    progress_percentage: 0,
    impact_statement: "",
    notes: "",
  };
}

function fromRow(i: Initiative): InitiativeFormData {
  return {
    title: i.title,
    goal_id: i.goal_id,
    pillar: i.pillar ?? "",
    description: i.description ?? "",
    current_state: i.current_state ?? "",
    target_state: i.target_state ?? "",
    status: i.status,
    priority: i.priority,
    start_date: i.start_date,
    target_date: i.target_date,
    progress_percentage: i.progress_percentage,
    impact_statement: i.impact_statement ?? "",
    notes: i.notes ?? "",
  };
}

export function InitiativeForm({ open, onClose, initiative, goals }: Props) {
  const isEdit = !!initiative;
  const [form, setForm] = useState<InitiativeFormData>(initiative ? fromRow(initiative) : defaults());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initiative ? fromRow(initiative) : defaults());
      setErrors({});
    }
  }, [open, initiative]);

  const set = <K extends keyof InitiativeFormData>(key: K, value: InitiativeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "اسم المبادرة مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = isEdit ? await updateInitiative(initiative!.id, form) : await createInitiative(form);
    setSaving(false);
    if (result.success) {
      toast(isEdit ? "تم تحديث المبادرة بنجاح" : "تم إضافة المبادرة بنجاح", "success");
      onClose();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل المبادرة" : "إضافة مبادرة جديدة"}>
      <div className="space-y-4">
        {/* Title */}
        <FormInput
          label="اسم المبادرة"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* Pillar + Goal + Status */}
        <div className="grid grid-cols-3 gap-3">
          <FormSelect
            label="المحور"
            value={form.pillar ?? ""}
            onChange={(e) => set("pillar", e.target.value)}
            placeholder="— اختر المحور —"
            options={PILLAR_OPTIONS}
          />
          <FormSelect
            label="الهدف المرتبط"
            value={form.goal_id ?? ""}
            onChange={(e) => set("goal_id", e.target.value || null)}
            placeholder="— اختياري —"
            options={goals.map((g) => ({ value: g.id, label: `${g.code}: ${g.title}` }))}
          />
          <FormSelect
            label="الحالة"
            value={form.status}
            onChange={(e) => set("status", e.target.value as InitiativeFormData["status"])}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Progress + Priority */}
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="نسبة الإنجاز %"
            type="number"
            min={0}
            max={100}
            value={form.progress_percentage ?? 0}
            onChange={(e) => set("progress_percentage", Number(e.target.value))}
          />
          <FormInput
            label="الأولوية"
            type="number"
            min={1}
            value={form.priority ?? 1}
            onChange={(e) => set("priority", Number(e.target.value))}
          />
          <div /> {/* spacer */}
        </div>

        {/* Dates */}
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

        {/* State transition */}
        <div className="grid grid-cols-2 gap-3">
          <FormTextarea
            label="الوضع الحالي"
            value={form.current_state ?? ""}
            onChange={(e) => set("current_state", e.target.value)}
            rows={2}
          />
          <FormTextarea
            label="الوضع المستهدف"
            value={form.target_state ?? ""}
            onChange={(e) => set("target_state", e.target.value)}
            rows={2}
          />
        </div>

        {/* Optional detail */}
        <details className="group">
          <summary className="text-sm font-medium text-brand-teal cursor-pointer hover:text-brand-teal-deep select-none">
            تفاصيل إضافية
          </summary>
          <div className="mt-3 space-y-3 pt-3 border-t">
            <FormTextarea
              label="الوصف"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
            <FormTextarea
              label="الأثر المتوقع"
              value={form.impact_statement ?? ""}
              onChange={(e) => set("impact_statement", e.target.value)}
              rows={2}
            />
            <FormTextarea
              label="ملاحظات"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "تحديث" : "حفظ المبادرة"}
          </Button>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}
