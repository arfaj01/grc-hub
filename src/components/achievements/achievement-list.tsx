"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star, FileText, Search } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { AchievementForm } from "./achievement-form";
import { toast } from "@/components/ui/toast";
import { deleteAchievement } from "@/lib/actions/achievements";
import { STATUS_COLORS, CATEGORY_COLORS } from "@/lib/constants/brand";
import { AR } from "@/lib/constants/ar";
import type { Achievement, Goal, Initiative } from "@/types/database";

interface Props {
  achievements: Achievement[];
  goals: Pick<Goal, "id" | "code" | "title">[];
  initiatives: Pick<Initiative, "id" | "title" | "goal_id">[];
}

export function AchievementList({ achievements, goals, initiatives }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [deleting, setDeleting] = useState<Achievement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filtered = achievements.filter((a) => {
    if (search && !a.title.includes(search) && !a.summary?.includes(search)) return false;
    if (filterCategory && a.category !== filterCategory) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteAchievement(deleting.id);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف المنجز", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  const goalMap = Object.fromEntries(goals.map((g) => [g.id, `${g.code}: ${g.title}`]));

  const reportBadges = (a: Achievement) => {
    const badges: string[] = [];
    if (a.is_monthly_reportable) badges.push("شهري");
    if (a.is_quarterly_reportable) badges.push("ربعي");
    if (a.is_annual_reportable) badges.push("سنوي");
    return badges;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنجزات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تسجيل ومتابعة المنجزات — {achievements.length} سجل
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة منجز
          </span>
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المنجزات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل التصنيفات</option>
          <option value="استراتيجي">استراتيجي</option>
          <option value="تنفيذي">تنفيذي</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل الحالات</option>
          <option value="مسودة">مسودة</option>
          <option value="معتمد">معتمد</option>
          <option value="مميز">مميز</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">{search || filterCategory || filterStatus ? "لا توجد نتائج مطابقة" : AR.empty.achievements}</p>
          {!search && !filterCategory && !filterStatus && (
            <Button size="sm" className="mt-4" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                إضافة أول منجز
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group cursor-pointer"
              onClick={() => { setEditing(a); setFormOpen(true); }}
            >
              <div className="flex items-start gap-3">
                {/* Category indicator */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: CATEGORY_COLORS[a.category] }}
                />

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{a.title}</h3>
                    {a.is_highlight && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-gray-500">{a.achievement_date}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium"
                      style={{ backgroundColor: CATEGORY_COLORS[a.category] }}
                    >
                      {a.category}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium"
                    >
                      {a.status}
                    </span>
                    {a.goal_id && goalMap[a.goal_id] && (
                      <span className="text-brand-teal text-[10px]">{goalMap[a.goal_id]}</span>
                    )}
                    {/* Report badges */}
                    {reportBadges(a).map((b) => (
                      <span key={b} className="px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal text-[10px]">
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Summary */}
                  {a.summary && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{a.summary}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(a); setFormOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(a); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AchievementForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        achievement={editing}
        goals={goals}
        initiatives={initiatives}
      />

      {/* Delete confirmation */}
      <ConfirmDelete
        open={!!deleting}
        title={deleting?.title ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
