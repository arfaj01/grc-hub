"use client";

import { ReportHeader, SectionHeading, ReportFooter } from "./report-header";
import { InsightLayer } from "./insight-sections";
import { generateInsights } from "@/lib/reports/insights";
import { progressColor } from "@/lib/constants/brand";
import type { Report } from "@/types/database";
import type { ReportSnapshot } from "@/lib/queries/reports";

interface Props {
  snapshot: ReportSnapshot;
  report: Report;
}

export function AnnualTemplate({ snapshot, report }: Props) {
  const { goals, initiatives, highlights, challenges, decisions, quarterlyBreakdown } = snapshot;
  const goalMap = Object.fromEntries(goals.map((g) => [g.id, g]));
  const insights = generateInsights(snapshot);

  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  return (
    <div className="bg-white rounded-2xl border print:border-0 print:rounded-none p-8 print:p-0 max-w-4xl mx-auto print:max-w-none" dir="rtl">
      <ReportHeader
        periodLabel={snapshot.periodLabel}
        reportTypeLabel="التقرير السنوي"
      />

      {/* ───────────── Executive Summary ───────────── */}
      {report.executive_summary && (
        <>
          <SectionHeading title="الملخص التنفيذي" number={nextSection()} />
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.executive_summary}</p>
        </>
      )}

      {/* ───────────── Year at a Glance ───────────── */}
      <SectionHeading title="نظرة عامة على العام" number={nextSection()} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-brand-teal/5 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-brand-teal">{snapshot.totalAchievements}</p>
          <p className="text-xs text-gray-500 mt-1">إجمالي المنجزات</p>
        </div>
        <div className="bg-brand-lime/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-brand-lime">{highlights.length}</p>
          <p className="text-xs text-gray-500 mt-1">إنجاز بارز</p>
        </div>
        <div className="bg-brand-blue/5 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-brand-blue">{snapshot.goalsAvgProgress}%</p>
          <p className="text-xs text-gray-500 mt-1">تحقيق الأهداف</p>
        </div>
        <div className="bg-brand-gold/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-brand-gold">{initiatives.length}</p>
          <p className="text-xs text-gray-500 mt-1">مبادرة تطويرية</p>
        </div>
      </div>

      {/* ───────────── Quarterly Distribution ───────────── */}
      {quarterlyBreakdown && quarterlyBreakdown.length > 0 && (
        <>
          <SectionHeading title="توزيع المنجزات الربعي" number={nextSection()} />
          <div className="grid grid-cols-4 gap-3 mb-4">
            {quarterlyBreakdown.map((qb) => (
              <div key={qb.quarter} className="border rounded-xl p-3 text-center">
                <p className="text-[10px] font-medium text-gray-500 mb-1">{qb.label}</p>
                <p className="text-xl font-bold text-brand-teal">{qb.achievementCount}</p>
                <p className="text-[10px] text-gray-400">منجز</p>
              </div>
            ))}
          </div>
          {/* Stacked bar visual */}
          <div className="flex h-4 rounded-full overflow-hidden mb-6">
            {quarterlyBreakdown.map((qb, idx) => {
              const total = snapshot.totalAchievements || 1;
              const pct = (qb.achievementCount / total) * 100;
              const colors = ["bg-brand-teal", "bg-brand-blue", "bg-brand-gold", "bg-brand-lime"];
              return (
                <div
                  key={qb.quarter}
                  className={`${colors[idx]} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${qb.label}: ${qb.achievementCount}`}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ───────────── Goal Achievement ───────────── */}
      <SectionHeading title="مستوى تحقيق الأهداف الاستراتيجية" number={nextSection()} />
      {report.overall_progress_summary && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.overall_progress_summary}</p>
      )}
      <div className="space-y-4">
        {goals.map((goal) => {
          const color = progressColor(goal.progress_percentage);
          const goalAch = snapshot.achievementsByGoal[goal.id] ?? [];
          return (
            <div key={goal.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue font-bold">{goal.code}</span>
                <p className="text-sm font-bold text-gray-900 flex-1">{goal.title}</p>
              </div>
              {/* KPI metrics if available */}
              {(goal.baseline_value != null || goal.target_value != null) && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {goal.baseline_value != null && (
                    <div className="text-center bg-gray-50 rounded-lg py-2">
                      <p className="text-[10px] text-gray-400">خط الأساس</p>
                      <p className="text-sm font-bold text-gray-700">{goal.baseline_value}</p>
                    </div>
                  )}
                  {goal.current_value != null && (
                    <div className="text-center bg-brand-teal/5 rounded-lg py-2">
                      <p className="text-[10px] text-gray-400">الحالي</p>
                      <p className="text-sm font-bold text-brand-teal">{goal.current_value}</p>
                    </div>
                  )}
                  {goal.target_value != null && (
                    <div className="text-center bg-brand-lime/5 rounded-lg py-2">
                      <p className="text-[10px] text-gray-400">المستهدف</p>
                      <p className="text-sm font-bold text-brand-lime">{goal.target_value}</p>
                    </div>
                  )}
                </div>
              )}
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${goal.progress_percentage}%`, backgroundColor: color }} />
                </div>
                <span className="text-sm font-bold w-12 text-left" style={{ color }}>{goal.progress_percentage}%</span>
              </div>
              {goal.executive_comment && (
                <p className="text-xs text-gray-500 italic mb-2">{goal.executive_comment}</p>
              )}
              {goalAch.length > 0 && (
                <details className="mt-2 pt-2 border-t border-gray-100">
                  <summary className="text-[10px] text-brand-teal cursor-pointer font-medium">
                    {goalAch.length} منجز مرتبط — عرض التفاصيل
                  </summary>
                  <ul className="space-y-1 mr-2 mt-2">
                    {goalAch.map((ach) => (
                      <li key={ach.id} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${ach.is_highlight ? "bg-brand-lime" : "bg-gray-300"}`} />
                        <div>
                          <span className={ach.is_highlight ? "font-medium text-gray-900" : ""}>{ach.title}</span>
                          <span className="text-gray-400 mr-1 text-[10px]">{ach.achievement_date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {/* ───────────── Major Achievements ───────────── */}
      {report.achievements_summary && (
        <>
          <SectionHeading title="أبرز الإنجازات السنوية" number={nextSection()} />
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.achievements_summary}</p>
        </>
      )}

      {/* ───────────── Top Highlights ───────────── */}
      {highlights.length > 0 && (
        <>
          <SectionHeading title="الإنجازات التحولية" number={nextSection()} />
          <div className="space-y-3">
            {highlights.map((ach, idx) => (
              <div key={ach.id} className="bg-gradient-to-l from-brand-lime/5 to-transparent border border-brand-lime/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-lime/20 text-brand-lime text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ach.title}</p>
                    {ach.summary && <p className="text-xs text-gray-600 mt-1">{ach.summary}</p>}
                    {ach.impact && (
                      <p className="text-xs text-brand-teal mt-1 font-medium bg-brand-teal/5 rounded px-2 py-1 inline-block">
                        الأثر: {ach.impact}
                      </p>
                    )}
                    {ach.goal_id && goalMap[ach.goal_id] && (
                      <span className="text-[10px] mr-1 px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue">
                        {goalMap[ach.goal_id].code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ───────────── Initiatives Summary ───────────── */}
      <SectionHeading title="ملخص خطة التطوير" number={nextSection()} />
      {/* By status summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(snapshot.initiativesByStatus).map(([status, count]) => (
          <div key={status} className="px-3 py-1.5 rounded-full bg-gray-50 border text-xs">
            <span className="font-medium text-gray-900">{count}</span>
            <span className="text-gray-500 mr-1">{status}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-brand-teal/20">
              <th className="text-right py-2 text-xs font-bold text-gray-500">المبادرة</th>
              <th className="text-center py-2 text-xs font-bold text-gray-500 w-20">المحور</th>
              <th className="text-center py-2 text-xs font-bold text-gray-500 w-20">الحالة</th>
              <th className="text-center py-2 text-xs font-bold text-gray-500 w-24">التقدم</th>
            </tr>
          </thead>
          <tbody>
            {initiatives.map((init) => (
              <tr key={init.id} className="border-b border-gray-100">
                <td className="py-2">
                  <p className="text-gray-900">{init.title}</p>
                  {init.impact_statement && <p className="text-[10px] text-gray-400 mt-0.5">{init.impact_statement}</p>}
                </td>
                <td className="py-2 text-center text-[10px] text-gray-500">{init.pillar ?? "—"}</td>
                <td className="py-2 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{init.status}</span>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${init.progress_percentage}%`, backgroundColor: progressColor(init.progress_percentage) }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-8 text-left">{init.progress_percentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ───────────── Challenges & Observations ───────────── */}
      {(challenges.length > 0 || report.challenges_summary) && (
        <>
          <SectionHeading title="التحديات والملاحظات" number={nextSection()} />
          {report.challenges_summary && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.challenges_summary}</p>}
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

      {/* ───────────── Strategic Directions ───────────── */}
      {(decisions.length > 0 || report.next_steps_summary) && (
        <>
          <SectionHeading title="التوجهات الاستراتيجية للعام القادم" number={nextSection()} />
          {report.next_steps_summary && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.next_steps_summary}</p>}
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
      <InsightLayer insights={insights} startNumber={sectionNum + 1} />

      <ReportFooter generatedAt={snapshot.generatedAt} />
    </div>
  );
}
