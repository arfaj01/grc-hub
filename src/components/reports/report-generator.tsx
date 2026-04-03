"use client";

import { useState } from "react";
import { FileText, Calendar, BarChart3, BookOpen } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FormSelect, Button } from "@/components/ui/form-field";
import { toast } from "@/components/ui/toast";
import { generateReport } from "@/lib/actions/reports";
import { useRouter } from "next/navigation";

const MONTHS = [
  { value: "1", label: "يناير" },
  { value: "2", label: "فبراير" },
  { value: "3", label: "مارس" },
  { value: "4", label: "أبريل" },
  { value: "5", label: "مايو" },
  { value: "6", label: "يونيو" },
  { value: "7", label: "يوليو" },
  { value: "8", label: "أغسطس" },
  { value: "9", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

const QUARTERS = [
  { value: "1", label: "الربع الأول (يناير – مارس)" },
  { value: "2", label: "الربع الثاني (أبريل – يونيو)" },
  { value: "3", label: "الربع الثالث (يوليو – سبتمبر)" },
  { value: "4", label: "الربع الرابع (أكتوبر – ديسمبر)" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - 2 + i),
  label: String(currentYear - 2 + i),
}));

type ReportType = "monthly" | "quarterly" | "annual";

const TYPE_CARDS: { type: ReportType; icon: typeof FileText; title: string; desc: string; color: string }[] = [
  { type: "monthly", icon: Calendar, title: "تقرير شهري", desc: "المنجزات والتحديثات لشهر واحد", color: "border-brand-teal text-brand-teal bg-brand-teal/5" },
  { type: "quarterly", icon: BarChart3, title: "تقرير ربع سنوي", desc: "ملخص ثلاثة أشهر مع التوجهات", color: "border-brand-blue text-brand-blue bg-brand-blue/5" },
  { type: "annual", icon: BookOpen, title: "تقرير سنوي", desc: "نظرة شاملة على إنجازات العام", color: "border-brand-gold text-brand-gold bg-brand-gold/5" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReportGenerator({ open, onClose }: Props) {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [quarter, setQuarter] = useState("");
  const [generating, setGenerating] = useState(false);

  const resetForm = () => {
    setReportType(null);
    setYear(String(currentYear));
    setMonth("");
    setQuarter("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canGenerate = () => {
    if (!reportType || !year) return false;
    if (reportType === "monthly" && !month) return false;
    if (reportType === "quarterly" && !quarter) return false;
    return true;
  };

  const handleGenerate = async () => {
    if (!canGenerate() || !reportType) return;
    setGenerating(true);

    const result = await generateReport({
      periodType: reportType,
      year: parseInt(year),
      month: reportType === "monthly" ? parseInt(month) : undefined,
      quarter: reportType === "quarterly" ? parseInt(quarter) : undefined,
    });

    setGenerating(false);

    if (result.success) {
      toast("تم إنشاء التقرير بنجاح", "success");
      handleClose();
      router.push(`/reports/${result.id}`);
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="إنشاء تقرير جديد" size="lg">
      <div className="space-y-6">
        {/* Step 1: Choose type */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">نوع التقرير</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TYPE_CARDS.map((card) => {
              const Icon = card.icon;
              const selected = reportType === card.type;
              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => setReportType(card.type)}
                  className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                    selected
                      ? card.color + " ring-2 ring-offset-1 ring-current/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${selected ? "" : "text-gray-400"}`} />
                  <p className={`text-sm font-bold ${selected ? "" : "text-gray-900"}`}>{card.title}</p>
                  <p className={`text-[11px] mt-0.5 ${selected ? "opacity-80" : "text-gray-400"}`}>{card.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose period */}
        {reportType && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">تحديد الفترة</p>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="السنة"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={YEARS}
              />
              {reportType === "monthly" && (
                <FormSelect
                  label="الشهر"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="— اختر الشهر —"
                  options={MONTHS}
                />
              )}
              {reportType === "quarterly" && (
                <FormSelect
                  label="الربع"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  placeholder="— اختر الربع —"
                  options={QUARTERS}
                />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {reportType && (
          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={handleGenerate} loading={generating} disabled={!canGenerate()}>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                إنشاء التقرير
              </span>
            </Button>
            <Button variant="ghost" onClick={handleClose}>إلغاء</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
