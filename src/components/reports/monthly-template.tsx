"use client";

import { ReportHeader, SectionHeading, ReportFooter } from "./report-header";
import { InsightLayer } from "./insight-sections";
import { generateInsights } from "@/lib/reports/insights";
import { progressColor } from "@/lib/constants/brand";
import type { Report } from "@/types/database";
import type { ReportSnapshot, GoalSnapshot } from "@/lib/queries/reports";

interface Props {
  snapshot: ReportSnapshot;
  report: Report;
}

export function MonthlyTemplate({ snapshot, report }: Props) {
  const { goals, achievements, initiatives, highlights, challenges, opportunities, decisions } = snapshot;
  const insights = generateInsights(snapshot);

  return (
    <div className="bg-white rounded-2xl border print:border-0 print:rounded-none p-8 print:p-0 max-w-4xl mx-auto print:max-w-none" dir="rtl">
      <ReportHeader
        periodLabel={snapshot.periodLabel}
        reportTypeLabel="التقرير الشهري"
      />

      {/* ───────────── Executive Summary ───────────── */}
      {report.executive_summary && (
        <>
          <SectionHeading title="الملخص التنفيذي" number={1} />
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.executive_summary}</p>
        </>
      )}

      {/* ───────────── KPI Summary ───────────── */}
      <SectionHeading title="المؤشرات الرئيسية" number={report.executive_summary ? 2 : 1} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <div className="bg-brand-teal/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-teal">{snapshot.totalAchievements}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">منجز محقق</p>
        </div>
        <div className="bg-brand-lime/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-lime">{highlights.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">إنجاز بارز</p>
        </div>
        <div className="bg-brand-blue/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-blue">{snapshot.goalsAvgProgress}%</p>
          <p className="text-[11px] text-gray-500 mt-0.5">متوسط تقدم الأهداف</p>
        </div>
        <div className="bg-brand-gold/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-gold">{snapshot.initiativesAvgProgress}%</p>
          <p className="text-[11px] text-gray-500 mt-0.5">متوسط تقدم المبادرات</p>
        </div>
      </div>

      {/* ───────────── Key Achievements ───────────── */}
      <SectionHeading title="أبرز المنجزات" number={report.executive_summary ? 3 : 2} />
      {report.achievements_summary && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.achievements_summary}</p>
      )}

      {/* Highlights first */}
      {highlights.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-brand-lime mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime inline-block" />
            إنجازات بارزة
          </p>
          <div className="space-y-2">
            {highlights.map((ach) => (
              <div key={ach.id} className="bg-brand-lime/5 border border-brand-lime/20 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{ach.title}</p>
                {ach.summary && <p className="text-xs text-gray-600 mt-1">{ach.summary}</p>}
                {ach.impact && <p className="text-xs text-brand-teal mt-1 font-medium">الأثر: {ach.impact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All achievements grouped by goal */}
      {goals.map((goal) => {
        const goalAchievements = snapshot.achievementsByGoal[goal.id];
        if (!goalAchievements || goalAchievements.length === 0) return null;
        return (
          <div key={goal.id} className="mb-4">
            <p className="text-xs font-bold text-brand-blue mb-2 flex items-center gap-1.5">
              <span className="bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded text-[10px]">{goal.code}</span>
              {goal.title}
            </p>
            <ul className="space-y-1.5 mr-3">
              {goalAchievements.filter((a) => !a.is_highlight).map((ach) => (
                <li key={ach.id} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                  <div>
                    <span className="font-medium">{ach.title}</span>
                    {ach.summary && <span className="text-gray-500"> — {ach.summary}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Unlinked achievements */}
      {snapshot.achievementsByGoal["__unlinked__"] && snapshot.achievementsByGoal["__unlinked__"].length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 mb-2">منجزات عامة</p>
          <ul className="space-y-1.5 mr-3">
            {snapshot.achievementsByGoal["__unlinked__"].filter((a) => !a.is_highlight).map((ach) => (
              <li key={ach.id} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                <div>
                  <span className="font-medium">{ach.title}</span>
                  {ach.summary && <span className="text-gray-500"> — {ach.summary}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ───────────── Goals Progress Snapshot ───────────── */}
      <SectionHeading title="لقطة تقدم الأهداف" number={report.executive_summary ? 4 : 3} />
      {report.overall_progress_summary && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.overall_progress_summary}</p>
      )}
      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalProgressRow key={goal.id} goal={goal} />
        ))}
      </div>

      {/* ───────────── Initiatives Update ───────────── */}
      <SectionHeading title="تحديث المبادرات التطويرية" number={report.executive_summary ? 5 : 4} />
      <div className="space-y-2">
        {initiatives.map((init) => (
          <div key={init.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{init.title}</p>
              {init.pillar && <p className="text-[10px] text-gray-400">{init.pillar}</p>}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{init.status}</span>
            <div className="w-20 shrink-0">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${init.progress_percentage}%`, backgroundColor: progressColor(init.progress_percentage) }}
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">{init.progress_percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* ───────────── Challenges ───────────── */}
      {(challenges.length > 0 || report.challenges_summary) && (
        <>
          <SectionHeading title="التحديات والمعوقات" number={report.executive_summary ? 6 : 5} />
          {report.challenges_summary && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.challenges_summary}</p>
          )}
          {challenges.length > 0 && (
            <ul className="space-y-2 mr-3">
              {challenges.map((note) => (
                <li key={note.id} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div>
                    {note.title && <span className="font-medium">{note.title}: </span>}
                    <span>{note.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ───────────── Opportunities ───────────── */}
      {opportunities.length > 0 && (
        <>
          <SectionHeading title="الفرص" />
          <ul className="space-y-2 mr-3">
            {opportunities.map((note) => (
              <li key={note.id} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <div>
                  {note.title && <span className="font-medium">{note.title}: </span>}
                  <span>{note.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ───────────── Next Steps ───────────── */}
      {(decisions.length > 0 || report.next_steps_summary) && (
        <>
          <SectionHeading title="الخطوات والأولويات القادمة" number={report.executive_summary ? 7 : 6} />
          {report.next_steps_summary && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.next_steps_summary}</p>
          )}
          {decisions.length > 0 && (
            <ul className="space-y-2 mr-3">
              {decisions.map((note) => (
                <li key={note.id} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div>
                    {note.title && <span className="font-medium">{note.title}: </span>}
                    <span>{note.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ───────────── Strategic Insight Layer ───────────── */}
      <InsightLayer insights={insights} startNumber={report.executive_summary ? 8 : 7} />

      <ReportFooter generatedAt={snapshot.generatedAt} />
    </div>
  );
}

/* ─── Goal progress row ─── */
function GoalProgressRow({ goal }: { goal: GoalSnapshot }) {
  const color = progressColor(goal.progress_percentage);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue font-bold shrink-0">{goal.code}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{goal.title}</p>
      </div>
      <div className="w-24 shrink-0">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress_percentage}%`, backgroundColor: color }} />
        </div>
      </div>
      <span className="text-sm font-bold w-10 text-left shrink-0" style={{ color }}>{goal.progress_percentage}%</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{goal.status}</span>
    </div>
  );
}
