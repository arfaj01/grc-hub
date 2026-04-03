"use client";

import { useState } from "react";
import { Plus, Trash2, FileIcon, FileText, Image, FileSpreadsheet, File, Search, Download, Paperclip } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { UploadForm } from "./upload-form";
import { toast } from "@/components/ui/toast";
import { deleteAttachment } from "@/lib/actions/attachments";
import { createClient } from "@/lib/supabase/client";
import type { Attachment, Goal, Initiative, Achievement } from "@/types/database";

function fileIcon(type: string | null) {
  if (!type) return File;
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf")) return FileText;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return FileSpreadsheet;
  if (type.includes("word") || type.includes("document")) return FileText;
  return FileIcon;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  attachments: Attachment[];
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title">[];
  achievements: Pick<Achievement, "id" | "title">[];
}

export function ArchiveList({ attachments, goals, initiatives, achievements }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<Attachment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState<string>("");

  const goalMap = Object.fromEntries(goals.map((g) => [g.id, g.code]));
  const initMap = Object.fromEntries(initiatives.map((i) => [i.id, i.title]));
  const achMap = Object.fromEntries(achievements.map((a) => [a.id, a.title]));

  const filtered = attachments.filter((a) => {
    if (search && !a.file_name.toLowerCase().includes(search.toLowerCase()) && !a.notes?.includes(search)) return false;
    if (filterEntity === "goal" && !a.goal_id) return false;
    if (filterEntity === "initiative" && !a.initiative_id) return false;
    if (filterEntity === "achievement" && !a.achievement_id) return false;
    if (filterEntity === "unlinked" && (a.goal_id || a.initiative_id || a.achievement_id)) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteAttachment(deleting.id, deleting.file_path);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف الملف", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  const handleDownload = async (att: Attachment) => {
    const supabase = createClient();
    const { data } = await supabase.storage.from("attachments").createSignedUrl(att.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast("فشل الحصول على رابط التحميل", "error");
    }
  };

  const linkedLabel = (a: Attachment): string | null => {
    if (a.goal_id && goalMap[a.goal_id]) return goalMap[a.goal_id];
    if (a.initiative_id && initMap[a.initiative_id]) return initMap[a.initiative_id];
    if (a.achievement_id && achMap[a.achievement_id]) return achMap[a.achievement_id];
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأرشيف</h1>
          <p className="text-sm text-muted-foreground mt-1">المرفقات والوثائق — {attachments.length} ملف</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            رفع ملف
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث باسم الملف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          />
        </div>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل الملفات</option>
          <option value="goal">مرتبط بهدف</option>
          <option value="initiative">مرتبط بمبادرة</option>
          <option value="achievement">مرتبط بمنجز</option>
          <option value="unlinked">غير مرتبط</option>
        </select>
      </div>

      {/* File list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Paperclip className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{search || filterEntity ? "لا توجد نتائج" : "لم يتم رفع ملفات بعد"}</p>
          {!search && !filterEntity && (
            <Button size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                رفع أول ملف
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((att) => {
            const Icon = fileIcon(att.file_type);
            const link = linkedLabel(att);
            return (
              <div key={att.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{att.file_name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span>{formatSize(att.file_size)}</span>
                      <span>·</span>
                      <span>{new Date(att.created_at).toLocaleDateString("ar-SA")}</span>
                      {link && (
                        <>
                          <span>·</span>
                          <span className="text-brand-teal truncate max-w-[150px]">{link}</span>
                        </>
                      )}
                    </div>
                    {att.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{att.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleDownload(att)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
                      title="تحميل"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleting(att)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadForm
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        goals={goals}
        initiatives={initiatives}
        achievements={achievements}
      />

      <ConfirmDelete
        open={!!deleting}
        title={deleting?.file_name ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
