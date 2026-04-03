"use client";

import { TrendingUp, AlertTriangle, AlertCircle, Lightbulb, Target, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import type { StrategicInsights, Insight, InsightSeverity, DecisionPoint } from "@/lib/reports/insights";

/* ═══════════════════════════════════════════════════════════════
   Severity → visual mapping
   ═══════════════════════════════════════════════════════════════ */

const SEVERITY_STYLE: Record<InsightSeverity, { bg: string; border: string; text: string; icon: typeof TrendingUp }> = {
  positive: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: ArrowUpCircle },
  warning:  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: AlertTriangle },
  critical: { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     icon: AlertCircle },
  neutral:  { bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-600",   icon: MinusCircle },
};

const PRIORITY_STYLE: Record<string, string> = {
  "عاجل":    "bg-red-100 text-red-700",
  "مهم":     "bg-amber-100 text-amber-700",
  "للمتابعة": "bg-slate-100 text-slate-600",
};

/* ─── Single insight pill ─── */
function InsightItem({ insight }: { insight: Insight }) {
  const s = SEVERITY_STYLE[insight.severity];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3 ${s.bg} ${s.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.text}`} />
      <p className={`text-sm leading-relaxed ${s.text}`}>{insight.text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Full Insight Layer — drop into any template
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  insights: StrategicInsights;
  startNumber: number; // section numbering continues from parent
}

export function InsightLayer({ insights, startNumber }: Props) {
  let sec = startNumber;

  return (
    <>
      {/* ─── Performance Analysis ─── */}
      {insights.performance.length > 0 && (
        <>
          <SectionHead title="تحليل الأداء" number={sec++} icon={TrendingUp} color="text-brand-teal" />
          <div className="space-y-2">
            {insights.performance.map((ins, i) => <InsightItem key={i} insight={ins} />)}
          </div>
        </>
      )}

      {/* ─── Strategic Interpretation ─── */}
      {insights.interpretation.length > 0 && (
        <>
          <SectionHead title="القراءة الاستراتيجية" number={sec++} icon={Lightbulb} color="text-brand-blue" />
          <div className="space-y-2">
            {insights.interpretation.map((ins, i) => <InsightItem key={i} insight={ins} />)}
          </div>
        </>
      )}

      {/* ─── Executive Insights ─── */}
      {insights.executive.length > 0 && (
        <>
          <SectionHead title="ملاحظات تنفيذية" number={sec++} icon={Lightbulb} color="text-brand-gold" />
          <div className="space-y-2">
            {insights.executive.map((ins, i) => <InsightItem key={i} insight={ins} />)}
          </div>
        </>
      )}

      {/* ─── Required Decisions ─── */}
      {insights.decisions.length > 0 && (
        <>
          <SectionHead title="قرارات مطلوبة" number={sec++} icon={Target} color="text-red-600" />
          <div className="space-y-2">
            {insights.decisions.map((dec, i) => (
              <DecisionCard key={i} decision={dec} index={i + 1} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ─── Section head (reused inside this component) ─── */
function SectionHead({ title, number, icon: Icon, color }: { title: string; number: number; icon: typeof TrendingUp; color: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3">
      <span className="w-7 h-7 rounded-lg bg-brand-teal text-white text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      <div className="flex items-center gap-2 flex-1 border-b border-brand-teal/20 pb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
    </div>
  );
}

/* ─── Decision card ─── */
function DecisionCard({ decision, index }: { decision: DecisionPoint; index: number }) {
  const prStyle = PRIORITY_STYLE[decision.priority] ?? PRIORITY_STYLE["للمتابعة"];
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-gray-900">{decision.action}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${prStyle}`}>
              {decision.priority}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{decision.rationale}</p>
        </div>
      </div>
    </div>
  );
}
