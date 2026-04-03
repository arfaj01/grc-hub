import { fetchReports } from "@/lib/queries/reports";
import { ReportList } from "@/components/reports/report-list";

export default async function ReportsPage() {
  const reports = await fetchReports();

  return <ReportList reports={reports} />;
}
