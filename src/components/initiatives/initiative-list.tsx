"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Layers, Search } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { InitiativeForm } from "./initiative-form";
import { toast } from "@/components/ui/toast";
import { deleteInitiative } from "@/lib/actions/initiatives";
import { STATUS_COLORS, progressColor } from "@/lib/constants/brand";
import { AR } from "@/lib/constants/ar";
import type { Initiative, Goal } from "@/types/database";

interface Props {
  initiatives: Initiative[];
  goals: Pick<Goal, "id" | "code" | "title">[];
}

export function InitiativeList({ initiatives, goals }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [deleting, setDeleting] = useState<Initiative | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPillar, setFilterPillar] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const goalMap = Object.fromEntries(goals.map((g) => [g.id, `${g.code}`]));

  const filtered = initiatives.filter((i) => {
    if (search && !i.title.includes(search)) return false;
    if (filterPillar && i.pillar !== filterPillar) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteInitiative(deleting.id);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف المبادرة", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  // Group by pillar for visual clarity
  const pillars = [...new Set(initiatives.map((i) => i.pillar).filter(Boolean))] as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">خطة التطوير</h1>
          <p className="text-sm text-muted-foreground mt-1">مبادرات التطوير والمشاريع — {initiatives.length} مبادرة</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة مبادرة
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المبادرات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          />
        </div>
        <select
          value={filterPillar}
          onChange={(e) => setFilterPillar(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل المحاور</option>
          {pillars.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        >
          <option value="">كل الحالات</option>
          <option value="لم يبدأ">لم يبدأ</option>
          <option value="دراسة أولية">دراسة أولية</option>
          <option value="في التصميم">في التصميم</option>
          <option value="جاري الطرح">جاري الطرح</option>
          <option value="طور الترسية">طور الترسية</option>
          <option value="جاري">جاري</option>
          <option value="مكتمل">مكتمل</option>
          <option value="متوقف">متوقف</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">{search || filterPillar || filterStatus ? "لا توجد نتائج مطابقة" : AR.empty.initiatives}</p>
          {!search && !filterPillar && !filterStatus && (
            <Button size="sm" className="mt-4" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                إضافة أول مبادرة
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group cursor-pointer"
              onClick={() => { setEditing(i); setFormOpen(true); }}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: STATUS_COLORS[i.status] || "#95a5a6" }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{i.title}</h3>
                    {i.goal_id && goalMap[i.goal_id] && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-medium">
                        {goalMap[i.goal_id]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium"
                      style={{ backgroundColor: STATUS_COLORS[i.status] || "#95a5a6" }}
                    >
                      {i.status}
                    </span>
                    {i.pillar && (
                      <span className="text-gray-500">{i.pillar}</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(i.progress_percentage, 100)}%`,
                          backgroundColor: progressColor(i.progress_percentage),
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: progressColor(i.progress_percentage) }}>
                      {i.progress_percentage}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(i); setFormOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(i); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
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

      <InitiativeForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        initiative={editing}
        goals={goals}
      />

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
