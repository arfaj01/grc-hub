"use client";

/**
 * Shared report header — used by all three templates.
 * Ministry branding, department name, period label.
 */

interface Props {
  periodLabel: string;
  reportTypeLabel: string;
}

export function ReportHeader({ periodLabel, reportTypeLabel }: Props) {
  return (
    <div className="mb-8 text-center border-b-2 border-brand-teal pb-6">
      {/* Ministry */}
      <p className="text-[11px] text-gray-500 tracking-wide mb-1">وزارة البلديات والإسكان</p>
      {/* Department */}
      <p className="text-sm font-bold text-brand-teal mb-3">إدارة التطوير والتأهيل</p>
      {/* Decorative line */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-px w-16 bg-brand-teal/30" />
        <div className="w-2 h-2 rounded-full bg-brand-teal" />
        <div className="h-px w-16 bg-brand-teal/30" />
      </div>
      {/* Report type + period */}
      <h1 className="text-xl font-bold text-gray-900 mb-1">{reportTypeLabel}</h1>
      <p className="text-base text-brand-teal font-medium">{periodLabel}</p>
    </div>
  );
}

/**
 * Section heading for the printable report.
 */
export function SectionHeading({ title, number }: { title: string; number?: number }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-8 first:mt-0">
      {number && (
        <span className="w-7 h-7 rounded-lg bg-brand-teal text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
      )}
      <h2 className="text-base font-bold text-gray-900 border-b border-brand-teal/20 pb-1 flex-1">{title}</h2>
    </div>
  );
}

/**
 * Key-value stat row for dashboards inside reports.
 */
export function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color ?? "text-gray-900"}`}>{value}</span>
    </div>
  );
}

/**
 * Report footer with generation timestamp.
 */
export function ReportFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <div className="mt-10 pt-4 border-t border-gray-200 text-center">
      <p className="text-[10px] text-gray-400">
        تم إنشاء هذا التقرير آليًا بواسطة منصة DRD Executive Hub — {new Date(generatedAt).toLocaleDateString("ar-SA")}
      </p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="h-px w-12 bg-gray-200" />
        <span className="text-[9px] text-gray-300">إدارة التطوير والتأهيل</span>
        <div className="h-px w-12 bg-gray-200" />
      </div>
    </div>
  );
}
