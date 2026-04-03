"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, Search, Eye, CheckCircle, Clock, Send } from "lucide-react";
import { Button, ConfirmDelete } from "@/components/ui/form-field";
import { ReportGenerator } from "./report-generator";
import { toast } from "@/components/ui/toast";
import { deleteReport } from "@/lib/actions/reports";
import type { ReportWithPeriod } from "@/lib/queries/reports";

const TYPE_LABELS: Record<string, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  annual: "سنوي",
  executive_summary: "ملخص تنفيذي",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  "مسودة": { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  "معتمد": { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  "منشور": { bg: "bg-blue-50", text: "text-blue-700", icon: Send },
};

interface Props {
  reports: ReportWithPeriod[];
}

export function ReportList({ reports }: Props) {
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [deleting, setDeleting] = useState<ReportWithPeriod | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");

  const filtered = reports.filter((r) => {
    if (search && !r.title.includes(search)) return false;
    if (filterType && r.report_type !== filterType) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteReport(deleting.id);
    setDeleteLoading(false);
    if (result.success) {
      toast("تم حذف التقرير", "success");
      setDeleting(null);
    } else {
      toast(result.error ?? "حدث خطأ", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-sm text-muted-foreground mt-1">إنشاء وإدارة التقارير الدورية — {reports.length} تقرير</p>
        </div>
        <Button onClick={() => setGeneratorOpen(true)}>
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إنشاء تقرير
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالعنوان..."
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
          <option value="monthly">شهري</option>
          <option value="quarterly">ربع سنوي</option>
          <option value="annual">سنوي</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{search || filterType ? "لا توجد نتائج" : "لم يتم إنشاء تقارير بعد"}</p>
          {!search && !filterType && (
            <Button size="sm" className="mt-4" onClick={() => setGeneratorOpen(true)}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                إنشاء أول تقرير
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((report) => {
            const sc = STATUS_CONFIG[report.status] ?? STATUS_CONFIG["مسودة"];
            const StatusIcon = sc.icon;
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                        {TYPE_LABELS[report.report_type] ?? report.report_type}
                      </span>
                      <span>·</span>
                      <span>{report.period?.label ?? "—"}</span>
                      <span>·</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${sc.bg} ${sc.text} font-medium`}>
                        <StatusIcon className="w-3 h-3" />
                        {report.status}
                      </span>
                      <span>·</span>
                      <span>{new Date(report.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                    {report.executive_summary && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{report.executive_summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <a
                      href={`/reports/${report.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
                      title="عرض التقرير"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setDeleting(report)}
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

      <ReportGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
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
