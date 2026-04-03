"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { FormInput, FormTextarea, FormSelect, Button } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { createAttachment } from "@/lib/actions/attachments";
import { createClient } from "@/lib/supabase/client";
import type { Goal, Initiative, Achievement } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title">[];
  achievements: Pick<Achievement, "id" | "title">[];
}

export function UploadForm({ open, onClose, goals, initiatives, achievements }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [goalId, setGoalId] = useState<string>("");
  const [initiativeId, setInitiativeId] = useState<string>("");
  const [achievementId, setAchievementId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setNotes("");
      setGoalId("");
      setInitiativeId("");
      setAchievementId("");
    }
  }, [open]);

  const handleFile = (f: File | null) => {
    if (f && f.size > 10 * 1024 * 1024) {
      toast("حجم الملف يتجاوز 10 ميجابايت", "error");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const supabase = createClient();

      // Generate unique path
      const ext = file.name.split(".").pop() || "bin";
      const timestamp = Date.now();
      const path = `uploads/${timestamp}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast(`فشل الرفع: ${uploadError.message}`, "error");
        setUploading(false);
        return;
      }

      // Save metadata to DB
      const result = await createAttachment({
        file_name: file.name,
        file_path: path,
        file_type: file.type || null,
        file_size: file.size,
        notes: notes || undefined,
        goal_id: goalId || null,
        initiative_id: initiativeId || null,
        achievement_id: achievementId || null,
      });

      if (result.success) {
        toast("تم رفع الملف بنجاح", "success");
        onClose();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("حدث خطأ غير متوقع", "error");
    }

    setUploading(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal open={open} onClose={onClose} title="رفع ملف" size="md">
      <div className="space-y-4">
        {/* Drop zone */}
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-brand-teal bg-brand-teal/5" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">اسحب الملف هنا أو اضغط للاختيار</p>
            <p className="text-xs text-gray-400 mt-1">الحد الأقصى 10 ميجابايت</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 rounded text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Notes */}
        <FormTextarea
          label="ملاحظات (اختياري)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="وصف مختصر للملف..."
        />

        {/* Entity linking */}
        <details className="group">
          <summary className="text-sm font-medium text-brand-teal cursor-pointer hover:text-brand-teal-deep select-none">
            ربط بعنصر (اختياري)
          </summary>
          <div className="mt-3 space-y-3 pt-3 border-t">
            <FormSelect
              label="الهدف"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              placeholder="— بدون ربط —"
              options={goals.map((g) => ({ value: g.id, label: `${g.code}: ${g.title}` }))}
            />
            <FormSelect
              label="المبادرة"
              value={initiativeId}
              onChange={(e) => setInitiativeId(e.target.value)}
              placeholder="— بدون ربط —"
              options={initiatives.map((i) => ({ value: i.id, label: i.title }))}
            />
            <FormSelect
              label="المنجز"
              value={achievementId}
              onChange={(e) => setAchievementId(e.target.value)}
              placeholder="— بدون ربط —"
              options={achievements.map((a) => ({ value: a.id, label: a.title }))}
            />
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleUpload} loading={uploading} disabled={!file}>
            رفع الملف
          </Button>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </Modal>
  );
}
