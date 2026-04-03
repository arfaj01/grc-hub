"use client";

import { useState, useEffect } from "react";
import { FormInput, FormTextarea, FormSelect, Button } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { createNote, updateNote, type NoteFormData } from "@/lib/actions/notes";
import type { Note, Goal, Initiative, Achievement } from "@/types/database";

const NOTE_TYPE_OPTIONS = [
  { value: "عام", label: "عام" },
  { value: "استراتيجي", label: "تأمل استراتيجي" },
  { value: "تحدي", label: "مخاطر / تحدي" },
  { value: "فرصة", label: "فرصة" },
  { value: "مستقبلي", label: "قرار / توجيه" },
  { value: "ملاحظة تقرير", label: "ملاحظة تقرير" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  note?: Note | null;
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title">[];
  achievements: Pick<Achievement, "id" | "title">[];
}

const todayStr = () => new Date().toISOString().split("T")[0];

function defaults(): NoteFormData {
  return {
    title: "",
    body: "",
    note_type: "عام",
    note_date: todayStr(),
    goal_id: null,
    initiative_id: null,
    achievement_id: null,
  };
}

function fromRow(n: Note): NoteFormData {
  return {
    title: n.title ?? "",
    body: n.body,
    note_type: n.note_type,
    note_date: n.note_date,
    goal_id: n.goal_id,
    initiative_id: n.initiative_id,
    achievement_id: n.achievement_id,
  };
}

export function NoteForm({ open, onClose, note, goals, initiatives, achievements }: Props) {
  const isEdit = !!note;
  const [form, setForm] = useState<NoteFormData>(note ? fromRow(note) : defaults());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(note ? fromRow(note) : defaults());
      setErrors({});
    }
  }, [open, note]);

  const set = <K extends keyof NoteFormData>(key: K, value: NoteFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.body.trim()) e.body = "محتوى الملاحظة مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = isEdit ? await updateNote(note!.id, form) : await createNote(form);
    setSaving(false);
    if (result.success) {
      toast(isEdit ? "تم تحديث الملاحظة" : "تم إضافة الملاحظة", "success");
      onClose();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الملاحظة" : "ملاحظة جديدة"} size="md">
      <div className="space-y-4">
        {/* Body first — fastest entry */}
        <FormTextarea
          label="المحتوى"
          required
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          error={errors.body}
          rows={4}
          autoFocus
          placeholder="اكتب ملاحظتك هنا..."
        />

        {/* Type + Date */}
        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="النوع"
            value={form.note_type}
            onChange={(e) => set("note_type", e.target.value as NoteFormData["note_type"])}
            options={NOTE_TYPE_OPTIONS}
          />
          <FormInput
            label="التاريخ"
            type="date"
            value={form.note_date}
            onChange={(e) => set("note_date", e.target.value)}
          />
        </div>

        {/* Optional title */}
        <FormInput
          label="العنوان (اختياري)"
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="عنوان مختصر..."
        />

        {/* Entity linking — collapsed */}
        <details className="group">
          <summary className="text-sm font-medium text-brand-teal cursor-pointer hover:text-brand-teal-deep select-none">
            ربط بعنصر (اختياري)
          </summary>
          <div className="mt-3 space-y-3 pt-3 border-t">
            <FormSelect
              label="الهدف"
              value={form.goal_id ?? ""}
              onChange={(e) => set("goal_id", e.target.value || null)}
              placeholder="— بدون ربط —"
              options={goals.map((g) => ({ value: g.id, label: `${g.code}: ${g.title}` }))}
            />
            <FormSelect
              label="المبادرة"
              value={form.initiative_id ?? ""}
              onChange={(e) => set("initiative_id", e.target.value || null)}
              placeholder="— بدون ربط —"
              options={initiatives.map((i) => ({ value: i.id, label: i.title }))}
            />
            <FormSelect
              label="المنجز"
              value={form.achievement_id ?? ""}
              onChange={(e) => set("achievement_id", e.target.value || null)}
              placeholder="— بدون ربط —"
              options={achievements.map((a) => ({ value: a.id, label: a.title }))}
            />
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "تحديث" : "حفظ"}
          </Button>
          {!isEdit && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (!validate()) return;
                setSaving(true);
                const result = await createNote(form);
                setSaving(false);
                if (result.success) {
                  toast("تم إضافة الملاحظة", "success");
                  setForm(defaults());
                  setErrors({});
                } else {
                  toast(result.error, "error");
                }
              }}
              loading={saving}
            >
              حفظ وإضافة أخرى
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}
