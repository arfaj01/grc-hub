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

export function QuarterlyTemplate({ snapshot, report }: Props) {
  const { goals, initiatives, highlights, challenges, decisions, monthlyBreakdown } = snapshot;
  const goalMap = Object.fromEntries(goals.map((g) => [g.id, g]));
  const insights = generateInsights(snapshot);

  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  return (
    <div className="bg-white rounded-2xl border print:border-0 print:rounded-none p-8 print:p-0 max-w-4xl mx-auto print:max-w-none" dir="rtl">
      <ReportHeader
        periodLabel={snapshot.periodLabel}
        reportTypeLabel="التقرير الربع سنوي"
      />

      {/* ───────────── Executive Summary ───────────── */}
      {report.executive_summary && (
        <>
          <SectionHeading title="الملخص التنفيذي" number={nextSection()} />
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.executive_summary}</p>
        </>
      )}

      {/* ───────────── Quarter at a Glance ───────────── */}
      <SectionHeading title="نظرة عامة على الربع" number={nextSection()} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-brand-teal/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-teal">{snapshot.totalAchievements}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">منجز خلال الربع</p>
        </div>
        <div className="bg-brand-lime/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-lime">{highlights.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">إنجاز بارز</p>
        </div>
        <div className="bg-brand-blue/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-blue">{snapshot.goalsAvgProgress}%</p>
          <p className="text-[11px] text-gray-500 mt-0.5">تقدم الأهداف</p>
        </div>
        <div className="bg-brand-gold/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-gold">{snapshot.initiativesAvgProgress}%</p>
          <p className="text-[11px] text-gray-500 mt-0.5">تقدم المبادرات</p>
        </div>
      </div>

      {/* ───────────── Monthly Breakdown ───────────── */}
      {monthlyBreakdown && monthlyBreakdown.length > 0 && (
        <>
          <SectionHeading title="توزيع المنجزات الشهري" number={nextSection()} />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {monthlyBreakdown.map((mb) => (
              <div key={mb.month} className="border rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">{mb.label}</p>
                <p className="text-xl font-bold text-brand-teal">{mb.achievementCount}</p>
                <p className="text-[10px] text-gray-400">منجز</p>
              </div>
            ))}
          </div>

          {/* Per-month details */}
          {monthlyBreakdown.map((mb) => {
            if (mb.achievements.length === 0) return null;
            return (
              <div key={mb.month} className="mb-4">
                <p className="text-xs font-bold text-brand-teal mb-2 border-b border-brand-teal/10 pb-1">{mb.label}</p>
                <ul className="space-y-1.5 mr-3">
                  {mb.achievements.map((ach) => (
                    <li key={ach.id} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ach.is_highlight ? "bg-brand-lime" : "bg-gray-400"}`} />
                      <div>
                        <span className="font-medium">{ach.title}</span>
                        {ach.summary && <span className="text-gray-500"> — {ach.summary}</span>}
                        {ach.goal_id && goalMap[ach.goal_id] && (
                          <span className="text-[10px] mr-1 px-1 py-0.5 rounded bg-brand-blue/10 text-brand-blue">{goalMap[ach.goal_id].code}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}

      {/* ───────────── Goals Progress ───────────── */}
      <SectionHeading title="تقدم الأهداف الاستراتيجية" number={nextSection()} />
      {report.overall_progress_summary && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.overall_progress_summary}</p>
      )}
      <div className="space-y-4">
        {goals.map((goal) => {
          const goalAch = snapshot.achievementsByGoal[goal.id] ?? [];
          const color = progressColor(goal.progress_percentage);
          return (
            <div key={goal.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue font-bold">{goal.code}</span>
                <p className="text-sm font-bold text-gray-900 flex-1">{goal.title}</p>
                <span className="text-sm font-bold" style={{ color }}>{goal.progress_percentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${goal.progress_percentage}%`, backgroundColor: color }} />
              </div>
              {goal.executive_comment && (
                <p className="text-xs text-gray-500 italic mb-2">{goal.executive_comment}</p>
              )}
              {goalAch.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1">{goalAch.length} منجز مرتبط</p>
                  <ul className="space-y-1 mr-2">
                    {goalAch.slice(0, 5).map((ach) => (
                      <li key={ach.id} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        {ach.title}
                      </li>
                    ))}
                    {goalAch.length > 5 && (
                      <li className="text-[10px] text-gray-400">و {goalAch.length - 5} منجزات أخرى</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ───────────── Initiatives ───────────── */}
      <SectionHeading title="تحديث خطة التطوير" number={nextSection()} />
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
                <td className="py-2 text-gray-900">{init.title}</td>
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

      {/* ───────────── Highlights ───────────── */}
      {highlights.length > 0 && (
        <>
          <SectionHeading title="الإنجازات البارزة للربع" number={nextSection()} />
          <div className="space-y-2">
            {highlights.map((ach) => (
              <div key={ach.id} className="bg-brand-lime/5 border border-brand-lime/20 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{ach.title}</p>
                {ach.summary && <p className="text-xs text-gray-600 mt-1">{ach.summary}</p>}
                {ach.impact && <p className="text-xs text-brand-teal mt-1 font-medium">الأثر: {ach.impact}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ───────────── Challenges ───────────── */}
      {(challenges.length > 0 || report.challenges_summary) && (
        <>
          <SectionHeading title="التحديات والقيود" number={nextSection()} />
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

      {/* ───────────── Next Focus ───────────── */}
      {(decisions.length > 0 || report.next_steps_summary) && (
        <>
          <SectionHeading title="التوجهات والأولويات القادمة" number={nextSection()} />
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
