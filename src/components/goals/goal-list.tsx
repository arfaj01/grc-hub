"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { GoalForm } from "./goal-form";
import { toast } from "@/components/ui/toast";
import { deleteGoal } from "@/lib/actions/goals";
import { progressColor } from "@/lib/constants/brand";
import { AR } from "@/lib/constants/ar";
import type { Goal } from "@/types/database";

interface Props {
  goals: Goal[];
}

export function GoalList({ goals }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const existingCodes = goals.map((g) => g.code);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteGoal(deleting.id);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف الهدف", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأهداف الاستراتيجية</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة ومتابعة الأهداف السنوية — {goals.length} هدف</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة هدف
          </span>
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">{AR.empty.goals}</p>
          <Button size="sm" className="mt-4" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              إضافة أول هدف
            </span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow group cursor-pointer"
              onClick={() => { setEditing(g); setFormOpen(true); }}
            >
              <div className="flex items-start gap-4">
                {/* Code badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: g.color || "#026D69" }}
                >
                  {g.code}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900">{g.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                      {g.status}
                    </span>
                  </div>

                  {g.strategic_theme && (
                    <p className="text-xs text-gray-500 mb-2">{g.strategic_theme}</p>
                  )}

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(g.progress_percentage, 100)}%`,
                          backgroundColor: progressColor(g.progress_percentage),
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: progressColor(g.progress_percentage) }}>
                      {g.progress_percentage}%
                    </span>
                  </div>

                  {g.success_metric_label && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      {g.success_metric_label}
                      {g.target_value != null && ` — المستهدف: ${g.target_value}`}
                      {g.current_value != null && ` — الحالي: ${g.current_value}`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(g); setFormOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(g); }}
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

      <GoalForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        goal={editing}
        existingCodes={isEditing(editing) ? existingCodes.filter((c) => c !== editing!.code) : existingCodes}
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

// Helper to narrow editing state for code validation
function isEditing(g: Goal | null): g is Goal {
  return g !== null;
}
