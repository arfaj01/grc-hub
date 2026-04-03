import { fetchReport } from "@/lib/queries/reports";
import { ReportEditor } from "@/components/reports/report-editor";
import { notFound } from "next/navigation";

export default async function ReportViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { report, sections } = await fetchReport(id);

  if (!report) notFound();

  return <ReportEditor report={report} sections={sections} />;
}
