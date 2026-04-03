import { fetchDashboardData } from "@/lib/queries/dashboard";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { GoalsProgress } from "@/components/dashboard/goals-progress";
import { AchievementsInsights } from "@/components/dashboard/achievements-insights";
import { InitiativesOverview } from "@/components/dashboard/initiatives-overview";
import { RecentAchievements } from "@/components/dashboard/recent-achievements";
import { DataAlerts } from "@/components/dashboard/data-alerts";

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة المعلومات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          نظرة عامة على أداء إدارة التطوير والتأهيل — {data.currentMonthLabel}
        </p>
      </div>

      {/* Row 1: KPI cards */}
      <StatsGrid
        goalsTotal={data.goalsTotal}
        goalsAvgProgress={data.goalsAvgProgress}
        achievementsTotal={data.achievementsTotal}
        achievementsThisMonth={data.achievementsThisMonth}
        initiativesTotal={data.initiativesTotal}
        initiativesAvgProgress={data.initiativesAvgProgress}
        achievementsHighlighted={data.achievementsHighlighted}
        reportReady={data.reportReady}
        currentMonthLabel={data.currentMonthLabel}
      />

      {/* Row 2: Goals + Reporting readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <GoalsProgress
            goals={data.goals}
            goalsCompleted={data.goalsCompleted}
            goalsOnTrack={data.goalsOnTrack}
            goalsDelayed={data.goalsDelayed}
            goalsAvgProgress={data.goalsAvgProgress}
          />
        </div>
        <div className="lg:col-span-2">
          <AchievementsInsights
            achievementsMonthlyReportable={data.achievementsMonthlyReportable}
            achievementsQuarterlyReportable={data.achievementsQuarterlyReportable}
            achievementsAnnualReportable={data.achievementsAnnualReportable}
            achievementsHighlighted={data.achievementsHighlighted}
          />
        </div>
      </div>

      {/* Row 3: Initiatives + Recent + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InitiativesOverview
          initiativesByStatus={data.initiativesByStatus}
          initiativesAvgProgress={data.initiativesAvgProgress}
          initiativesTotal={data.initiativesTotal}
        />
        <RecentAchievements achievements={data.recentAchievements} />
        <DataAlerts alerts={data.alerts} />
      </div>
    </div>
  );
}
