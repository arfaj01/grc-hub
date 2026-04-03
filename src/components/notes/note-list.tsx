"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, StickyNote, Search } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { NoteForm } from "./note-form";
import { toast } from "@/components/ui/toast";
import { deleteNote } from "@/lib/actions/notes";
import type { Note, Goal, Initiative, Achievement } from "@/types/database";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "عام": { bg: "bg-gray-100", text: "text-gray-600" },
  "استراتيجي": { bg: "bg-blue-50", text: "text-blue-700" },
  "تحدي": { bg: "bg-red-50", text: "text-red-600" },
  "فرصة": { bg: "bg-green-50", text: "text-green-700" },
  "مستقبلي": { bg: "bg-purple-50", text: "text-purple-700" },
  "ملاحظة تقرير": { bg: "bg-amber-50", text: "text-amber-700" },
};

const TYPE_LABELS: Record<string, string> = {
  "عام": "عام",
  "استراتيجي": "تأمل",
  "تحدي": "مخاطر",
  "فرصة": "فرصة",
  "مستقبلي": "قرار",
  "ملاحظة تقرير": "تقرير",
};

interface Props {
  notes: Note[];
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title">[];
  achievements: Pick<Achievement, "id" | "title">[];
}

export function NoteList({ notes, goals, initiatives, achievements }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");

  const filtered = notes.filter((n) => {
    if (search && !n.body.includes(search) && !n.title?.includes(search)) return false;
    if (filterType && n.note_type !== filterType) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteNote(deleting.id);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف الملاحظة", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملاحظات</h1>
          <p className="text-sm text-muted-foreground mt-1">ملاحظات وتأملات تنفيذية — {notes.length} ملاحظة</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            ملاحظة جديدة
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل الأنواع</option>
          <option value="عام">عام</option>
          <option value="استراتيجي">تأمل استراتيجي</option>
          <option value="تحدي">مخاطر / تحدي</option>
          <option value="فرصة">فرصة</option>
          <option value="مستقبلي">قرار / توجيه</option>
          <option value="ملاحظة تقرير">ملاحظة تقرير</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{search || filterType ? "لا توجد نتائج" : "لم تتم إضافة ملاحظات بعد"}</p>
          {!search && !filterType && (
            <Button size="sm" className="mt-4" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                أول ملاحظة
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map((n) => {
            const tc = TYPE_COLORS[n.note_type] ?? TYPE_COLORS["عام"];
            return (
              <div
                key={n.id}
                className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group cursor-pointer"
                onClick={() => { setEditing(n); setFormOpen(true); }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
                    {TYPE_LABELS[n.note_type] ?? n.note_type}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(n); setFormOpen(true); }}
                      className="p-1 rounded text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleting(n); }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {n.title && <p className="text-sm font-bold text-gray-900 mb-1">{n.title}</p>}
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-2">{n.note_date}</p>
              </div>
            );
          })}
        </div>
      )}

      <NoteForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        note={editing}
        goals={goals}
        initiatives={initiatives}
        achievements={achievements}
      />

      <ConfirmDelete
        open={!!deleting}
        title={deleting?.title ?? "هذه الملاحظة"}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
