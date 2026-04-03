/**
 * Strategic Insight Engine
 * ────────────────────────
 * Analyses a ReportSnapshot and produces structured executive insights.
 * Rule-based: no LLM dependency — pure data interpretation.
 *
 * Design principles:
 *  • Every insight must add value beyond the raw number
 *  • Executive tone — concise, decision-oriented
 *  • No repetition of data already visible in other sections
 */

import type { ReportSnapshot, GoalSnapshot, InitiativeSnapshot, AchievementSnapshot } from "@/lib/queries/reports";

/* ═══════════════════════════════════════════════════════════════
   Output types
   ═══════════════════════════════════════════════════════════════ */

export type InsightSeverity = "positive" | "warning" | "critical" | "neutral";

export type Insight = {
  text: string;
  severity: InsightSeverity;
};

export type DecisionPoint = {
  action: string;
  rationale: string;
  priority: "عاجل" | "مهم" | "للمتابعة";
};

export type StrategicInsights = {
  performance: Insight[];
  interpretation: Insight[];
  executive: Insight[];
  decisions: DecisionPoint[];
};

/* ═══════════════════════════════════════════════════════════════
   Thresholds
   ═══════════════════════════════════════════════════════════════ */

const GOAL_STRONG = 70;       // % — above this = strong
const GOAL_WEAK = 40;         // % — below this = weak
const INIT_STALLED = 20;      // % — below this with status "جاري" = stalled
const HIGHLIGHT_RATIO = 0.15; // highlights / total — below = too few
const PROGRESS_DIFF = 15;     // % gap between best and worst goal = imbalance

/* ═══════════════════════════════════════════════════════════════
   Main entry point
   ═══════════════════════════════════════════════════════════════ */

export function generateInsights(snapshot: ReportSnapshot): StrategicInsights {
  const performance = analysePerformance(snapshot);
  const interpretation = analyseChanges(snapshot);
  const executive = analysePatterns(snapshot);
  const decisions = deriveDecisions(snapshot, performance, interpretation);

  return { performance, interpretation, executive, decisions };
}

/* ═══════════════════════════════════════════════════════════════
   1. Performance Analysis
   ═══════════════════════════════════════════════════════════════ */

function analysePerformance(s: ReportSnapshot): Insight[] {
  const insights: Insight[] = [];
  const { goals, goalsAvgProgress, initiatives, initiativesAvgProgress, totalAchievements, highlights } = s;

  // Overall pace
  if (goalsAvgProgress >= GOAL_STRONG) {
    insights.push({ text: `متوسط تقدم الأهداف (${goalsAvgProgress}%) يتجاوز الحد المقبول — الأداء متقدم عن المستهدف`, severity: "positive" });
  } else if (goalsAvgProgress < GOAL_WEAK) {
    insights.push({ text: `متوسط تقدم الأهداف (${goalsAvgProgress}%) أقل من المتوقع — يتطلب تدخلًا عاجلًا لتسريع الإنجاز`, severity: "critical" });
  } else {
    insights.push({ text: `متوسط تقدم الأهداف (${goalsAvgProgress}%) ضمن النطاق المقبول مع وجود فرص للتحسين`, severity: "neutral" });
  }

  // Strong goals
  const strong = goals.filter((g) => g.progress_percentage >= GOAL_STRONG);
  if (strong.length > 0) {
    insights.push({
      text: `${strong.length} ${strong.length === 1 ? "هدف يتقدم" : "أهداف تتقدم"} بقوة: ${strong.map((g) => g.code).join("، ")}`,
      severity: "positive",
    });
  }

  // Weak goals
  const weak = goals.filter((g) => g.progress_percentage < GOAL_WEAK && g.status !== "مكتمل");
  if (weak.length > 0) {
    insights.push({
      text: `${weak.length} ${weak.length === 1 ? "هدف دون" : "أهداف دون"} مستوى التقدم المطلوب: ${weak.map((g) => g.code).join("، ")}`,
      severity: "warning",
    });
  }

  // Imbalance between goals
  if (goals.length >= 2) {
    const max = Math.max(...goals.map((g) => g.progress_percentage));
    const min = Math.min(...goals.filter((g) => g.status !== "مكتمل").map((g) => g.progress_percentage));
    if (max - min > PROGRESS_DIFF) {
      insights.push({
        text: `فجوة أداء (${max - min} نقطة) بين الأهداف — يُوصى بإعادة توزيع الموارد لتقليل التفاوت`,
        severity: "warning",
      });
    }
  }

  // Initiatives health
  const stalled = initiatives.filter((i) => i.status === "جاري" && i.progress_percentage < INIT_STALLED);
  if (stalled.length > 0) {
    insights.push({
      text: `${stalled.length} ${stalled.length === 1 ? "مبادرة تبدو متعثرة" : "مبادرات تبدو متعثرة"} رغم حالتها "جاري" — التقدم أقل من ${INIT_STALLED}%`,
      severity: "critical",
    });
  }

  const stopped = initiatives.filter((i) => i.status === "متوقف");
  if (stopped.length > 0) {
    insights.push({
      text: `${stopped.length} ${stopped.length === 1 ? "مبادرة متوقفة" : "مبادرات متوقفة"} — تتطلب قرارًا بالاستمرار أو الإلغاء`,
      severity: "warning",
    });
  }

  // Highlight ratio
  if (totalAchievements > 0) {
    const ratio = highlights.length / totalAchievements;
    if (ratio < HIGHLIGHT_RATIO && totalAchievements >= 5) {
      insights.push({
        text: `نسبة الإنجازات البارزة (${highlights.length} من ${totalAchievements}) منخفضة — التركيز على الأعمال الروتينية أكثر من المبادرات التحولية`,
        severity: "neutral",
      });
    }
  }

  return insights;
}

/* ═══════════════════════════════════════════════════════════════
   2. Strategic Interpretation
   ═══════════════════════════════════════════════════════════════ */

function analyseChanges(s: ReportSnapshot): Insight[] {
  const insights: Insight[] = [];
  const { goals, initiatives, achievements, achievementsByCategory, highlights } = s;

  // Category distribution
  const strategic = (achievementsByCategory["استراتيجي"] ?? []).length;
  const operational = (achievementsByCategory["تنفيذي"] ?? []).length;
  const total = strategic + operational;

  if (total > 0) {
    if (strategic > operational) {
      insights.push({
        text: `الغالبية (${strategic} من ${total}) منجزات استراتيجية — الإدارة تعمل على المستوى التحولي`,
        severity: "positive",
      });
    } else if (operational > strategic * 2) {
      insights.push({
        text: `${operational} منجز تنفيذي مقابل ${strategic} استراتيجي — الطابع التشغيلي يغلب، فرصة لرفع الأثر الاستراتيجي`,
        severity: "neutral",
      });
    }
  }

  // Completed goals
  const completed = goals.filter((g) => g.status === "مكتمل");
  if (completed.length > 0) {
    insights.push({
      text: `تم إنجاز ${completed.length} ${completed.length === 1 ? "هدف" : "أهداف"} بالكامل خلال الفترة: ${completed.map((g) => g.code).join("، ")}`,
      severity: "positive",
    });
  }

  // Delayed goals
  const delayed = goals.filter((g) => g.status === "متأخر");
  if (delayed.length > 0) {
    insights.push({
      text: `${delayed.length} ${delayed.length === 1 ? "هدف متأخر" : "أهداف متأخرة"}: ${delayed.map((g) => g.code).join("، ")} — التأخر يحتاج تفسيرًا وخطة تعافٍ`,
      severity: "critical",
    });
  }

  // Initiatives completing
  const completedInits = initiatives.filter((i) => i.status === "مكتمل");
  if (completedInits.length > 0) {
    insights.push({
      text: `${completedInits.length} ${completedInits.length === 1 ? "مبادرة مكتملة" : "مبادرات مكتملة"} — يُوصى بتقييم أثرها وتوثيق الدروس المستفادة`,
      severity: "positive",
    });
  }

  // Unlinked achievements
  const unlinked = s.achievementsByGoal["__unlinked__"] ?? [];
  if (unlinked.length > 0 && total > 0) {
    const pct = Math.round((unlinked.length / total) * 100);
    if (pct > 25) {
      insights.push({
        text: `${pct}% من المنجزات غير مرتبطة بأهداف — جهد مبذول خارج الخطة الاستراتيجية`,
        severity: "warning",
      });
    }
  }

  // Quarterly: monthly trend analysis
  if (s.monthlyBreakdown && s.monthlyBreakdown.length >= 2) {
    const counts = s.monthlyBreakdown.map((m) => m.achievementCount);
    const trend = counts[counts.length - 1] - counts[0];
    if (trend > 2) {
      insights.push({ text: `مسار تصاعدي واضح في المنجزات خلال الربع — الزخم يتزايد`, severity: "positive" });
    } else if (trend < -2) {
      insights.push({ text: `تراجع في وتيرة الإنجاز خلال الربع — يحتاج إعادة تقييم الأولويات`, severity: "warning" });
    }
  }

  // Annual: quarter comparison
  if (s.quarterlyBreakdown && s.quarterlyBreakdown.length >= 2) {
    const counts = s.quarterlyBreakdown.map((q) => q.achievementCount);
    const best = s.quarterlyBreakdown.reduce((a, b) => a.achievementCount > b.achievementCount ? a : b);
    const worst = s.quarterlyBreakdown.reduce((a, b) => a.achievementCount < b.achievementCount ? a : b);
    if (best.achievementCount > 0 && worst.achievementCount >= 0) {
      insights.push({
        text: `أعلى إنتاجية في ${best.label} (${best.achievementCount} منجز)، وأدنى في ${worst.label} (${worst.achievementCount}) — فرصة لتحليل العوامل الموسمية`,
        severity: "neutral",
      });
    }
  }

  return insights;
}

/* ═══════════════════════════════════════════════════════════════
   3. Executive Insights (patterns & risks)
   ═══════════════════════════════════════════════════════════════ */

function analysePatterns(s: ReportSnapshot): Insight[] {
  const insights: Insight[] = [];
  const { goals, initiatives, achievements, challenges, opportunities, highlights } = s;

  // Concentration risk: one goal has too many achievements
  if (goals.length >= 2 && achievements.length >= 5) {
    const maxGoal = goals.reduce((best, g) => {
      const count = (s.achievementsByGoal[g.id] ?? []).length;
      return count > (s.achievementsByGoal[best.id] ?? []).length ? g : best;
    }, goals[0]);
    const maxCount = (s.achievementsByGoal[maxGoal.id] ?? []).length;
    const ratio = maxCount / achievements.length;
    if (ratio > 0.5) {
      insights.push({
        text: `تركّز ${Math.round(ratio * 100)}% من المنجزات على ${maxGoal.code} — خطر إهمال الأهداف الأخرى`,
        severity: "warning",
      });
    }
  }

  // Challenge density
  if (challenges.length > 3) {
    insights.push({
      text: `تم رصد ${challenges.length} تحديات — الكثافة مرتفعة وتتطلب جلسة مراجعة مخصصة`,
      severity: "warning",
    });
  }

  // Opportunities not acted on
  if (opportunities.length > 0 && highlights.length === 0) {
    insights.push({
      text: `${opportunities.length} فرص مسجلة لكن بدون إنجازات بارزة — فرص غير مُستغلة`,
      severity: "neutral",
    });
  }

  // Pillar balance (if initiatives have pillars)
  const pillarCounts: Record<string, number> = {};
  for (const init of initiatives) {
    if (init.pillar) {
      pillarCounts[init.pillar] = (pillarCounts[init.pillar] || 0) + 1;
    }
  }
  const pillars = Object.entries(pillarCounts);
  if (pillars.length >= 2) {
    const maxPillar = pillars.reduce((a, b) => a[1] > b[1] ? a : b);
    const minPillar = pillars.reduce((a, b) => a[1] < b[1] ? a : b);
    if (maxPillar[1] >= minPillar[1] * 3) {
      insights.push({
        text: `محور "${maxPillar[0]}" يستحوذ على ${maxPillar[1]} مبادرات مقابل ${minPillar[1]} لـ"${minPillar[0]}" — خلل في التوازن`,
        severity: "neutral",
      });
    }
  }

  // Risk: high-progress goals with no highlights
  for (const goal of goals) {
    const goalHighlights = (s.achievementsByGoal[goal.id] ?? []).filter((a) => a.is_highlight);
    if (goal.progress_percentage >= 60 && goalHighlights.length === 0 && (s.achievementsByGoal[goal.id] ?? []).length > 0) {
      insights.push({
        text: `${goal.code} يتقدم بنسبة ${goal.progress_percentage}% لكن بدون إنجازات بارزة — التقدم كمّي وليس نوعي`,
        severity: "neutral",
      });
    }
  }

  return insights;
}

/* ═══════════════════════════════════════════════════════════════
   4. Required Decisions
   ═══════════════════════════════════════════════════════════════ */

function deriveDecisions(
  s: ReportSnapshot,
  perf: Insight[],
  interp: Insight[],
): DecisionPoint[] {
  const decisions: DecisionPoint[] = [];
  const { goals, initiatives, challenges } = s;

  // Weak goals → resource reallocation
  const weak = goals.filter((g) => g.progress_percentage < GOAL_WEAK && g.status !== "مكتمل");
  if (weak.length > 0) {
    decisions.push({
      action: `مراجعة خطط الأهداف المتأخرة (${weak.map((g) => g.code).join("، ")}) وتخصيص موارد إضافية`,
      rationale: `تقدم دون ${GOAL_WEAK}% في ${weak.length} أهداف — استمرار الوتيرة الحالية يعرّض المستهدفات السنوية للخطر`,
      priority: "عاجل",
    });
  }

  // Stopped initiatives → decision needed
  const stopped = initiatives.filter((i) => i.status === "متوقف");
  if (stopped.length > 0) {
    decisions.push({
      action: `اتخاذ قرار بشأن المبادرات المتوقفة: ${stopped.map((i) => i.title).join("، ")}`,
      rationale: `مبادرات معلّقة بدون مسار واضح — تستهلك حيّزًا تخطيطيًا بدون عائد`,
      priority: "مهم",
    });
  }

  // Stalled "جاري" initiatives
  const stalled = initiatives.filter((i) => i.status === "جاري" && i.progress_percentage < INIT_STALLED);
  if (stalled.length > 0) {
    decisions.push({
      action: `التحقق من أسباب تعثّر: ${stalled.map((i) => i.title).join("، ")}`,
      rationale: `حالة "جاري" مع تقدم أقل من ${INIT_STALLED}% — قد تكون الحالة غير محدّثة أو هناك عوائق غير مُبلّغة`,
      priority: "عاجل",
    });
  }

  // High challenge count
  if (challenges.length > 3) {
    decisions.push({
      action: `عقد اجتماع مراجعة مخصص للتحديات (${challenges.length} تحدي مسجّل)`,
      rationale: `كثافة التحديات تتجاوز المعدل الطبيعي — معالجة فردية لن تكفي`,
      priority: "مهم",
    });
  }

  // Imbalanced goals
  if (goals.length >= 2) {
    const progresses = goals.filter((g) => g.status !== "مكتمل").map((g) => g.progress_percentage);
    if (progresses.length >= 2) {
      const max = Math.max(...progresses);
      const min = Math.min(...progresses);
      if (max - min > PROGRESS_DIFF * 1.5) {
        decisions.push({
          action: `إعادة توزيع الجهد بين الأهداف لتقليل فجوة الأداء (${max - min} نقطة)`,
          rationale: `التفاوت الكبير يعني أن بعض الأهداف تحصل على اهتمام أكبر على حساب أخرى`,
          priority: "للمتابعة",
        });
      }
    }
  }

  // Unlinked achievement ratio
  const unlinked = (s.achievementsByGoal["__unlinked__"] ?? []).length;
  if (unlinked > 0 && s.totalAchievements > 0) {
    const pct = Math.round((unlinked / s.totalAchievements) * 100);
    if (pct > 30) {
      decisions.push({
        action: `ربط ${unlinked} منجزًا بالأهداف الاستراتيجية أو مراجعة مدى توافقها مع الخطة`,
        rationale: `${pct}% من الجهد خارج الإطار الاستراتيجي — يُضعف قدرة القياس`,
        priority: "للمتابعة",
      });
    }
  }

  // If no decisions generated — positive signal
  if (decisions.length === 0) {
    decisions.push({
      action: `استمرار المسار الحالي مع التركيز على رفع نسبة الإنجازات البارزة`,
      rationale: `لم تُرصد مخاطر جوهرية — الأداء ضمن المستهدفات`,
      priority: "للمتابعة",
    });
  }

  // Sort by priority
  const order: Record<string, number> = { "عاجل": 0, "مهم": 1, "للمتابعة": 2 };
  decisions.sort((a, b) => order[a.priority] - order[b.priority]);

  return decisions;
}
