"use client";

import { useState } from "react";
import { ArrowRight, Printer, RefreshCw, CheckCircle, Send, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/form-field";
import { toast } from "@/components/ui/toast";
import { updateReport, updateReportStatus, regenerateSnapshot } from "@/lib/actions/reports";
import { MonthlyTemplate } from "./monthly-template";
import { QuarterlyTemplate } from "./quarterly-template";
import { AnnualTemplate } from "./annual-template";
import type { Report, ReportSection, ReportPeriod } from "@/types/database";
import type { ReportSnapshot } from "@/lib/queries/reports";

interface Props {
  report: Report & { period: ReportPeriod | null };
  sections: ReportSection[];
}

export function ReportEditor({ report, sections }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const snapshot = report.generated_snapshot as unknown as ReportSnapshot | null;

  const startEditing = (field: string, value: string | null) => {
    setEditingField(field);
    setEditValue(value ?? "");
  };

  const saveField = async () => {
    if (!editingField) return;
    setSaving(true);
    const result = await updateReport(report.id, { [editingField]: editValue || null });
    setSaving(false);
    if (result.success) {
      toast("تم الحفظ", "success");
      setEditingField(null);
    } else {
      toast(result.error, "error");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await regenerateSnapshot(report.id);
    setRefreshing(false);
    if (result.success) {
      toast("تم تحديث البيانات", "success");
    } else {
      toast(result.error, "error");
    }
  };

  const handleStatusChange = async (status: "معتمد" | "منشور") => {
    setStatusLoading(true);
    const result = await updateReportStatus(report.id, status);
    setStatusLoading(false);
    if (result.success) {
      toast(`تم تغيير الحالة إلى ${status}`, "success");
    } else {
      toast(result.error, "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Editable summary section component
  const EditableSummary = ({
    label,
    field,
    value,
    placeholder,
  }: {
    label: string;
    field: string;
    value: string | null;
    placeholder: string;
  }) => (
    <div className="print:hidden">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {editingField !== field && (
          <button
            onClick={() => startEditing(field, value)}
            className="p-1 rounded text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {editingField === field ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex gap-1">
            <Button size="sm" onClick={saveField} loading={saving}>
              <span className="flex items-center gap-1"><Save className="w-3 h-3" /> حفظ</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>إلغاء</Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 min-h-[2.5rem]">
          {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <a href="/reports" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <ArrowRight className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-sm text-muted-foreground">{report.period?.label ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleRefresh} loading={refreshing}>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              تحديث البيانات
            </span>
          </Button>
          {report.status === "مسودة" && (
            <Button variant="secondary" size="sm" onClick={() => handleStatusChange("معتمد")} loading={statusLoading}>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                اعتماد
              </span>
            </Button>
          )}
          {report.status === "معتمد" && (
            <Button variant="secondary" size="sm" onClick={() => handleStatusChange("منشور")} loading={statusLoading}>
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                نشر
              </span>
            </Button>
          )}
          <Button size="sm" onClick={handlePrint}>
            <span className="flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              طباعة
            </span>
          </Button>
        </div>
      </div>

      {/* Editable summaries */}
      <div className="bg-white rounded-2xl border p-6 space-y-4 print:hidden">
        <h2 className="text-base font-bold text-gray-900 mb-2">الملخصات التنفيذية</h2>
        <EditableSummary
          label="الملخص التنفيذي"
          field="executive_summary"
          value={report.executive_summary}
          placeholder="اكتب ملخصًا تنفيذيًا يلخص أهم الإنجازات والتطورات..."
        />
        <EditableSummary
          label="ملخص التقدم العام"
          field="overall_progress_summary"
          value={report.overall_progress_summary}
          placeholder="وصف مختصر لمستوى التقدم العام في الأهداف والمبادرات..."
        />
        <EditableSummary
          label="ملخص المنجزات"
          field="achievements_summary"
          value={report.achievements_summary}
          placeholder="أبرز المنجزات المحققة خلال هذه الفترة..."
        />
        <EditableSummary
          label="التحديات والمعوقات"
          field="challenges_summary"
          value={report.challenges_summary}
          placeholder="أبرز التحديات التي واجهت العمل..."
        />
        <EditableSummary
          label="الخطوات القادمة"
          field="next_steps_summary"
          value={report.next_steps_summary}
          placeholder="الأولويات والخطوات المخططة للفترة القادمة..."
        />
      </div>

      {/* Printable template */}
      {snapshot && (
        <div className="print:m-0">
          {report.report_type === "monthly" && (
            <MonthlyTemplate snapshot={snapshot} report={report} />
          )}
          {report.report_type === "quarterly" && (
            <QuarterlyTemplate snapshot={snapshot} report={report} />
          )}
          {report.report_type === "annual" && (
            <AnnualTemplate snapshot={snapshot} report={report} />
          )}
        </div>
      )}
    </div>
  );
}
