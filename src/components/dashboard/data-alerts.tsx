import { AlertTriangle, Info } from "lucide-react";
import type { DataAlert } from "@/lib/queries/dashboard";

interface Props {
  alerts: DataAlert[];
}

export function DataAlerts({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900 text-sm">جودة البيانات</h3>
        </div>
        <div className="p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg">✓</span>
          </div>
          <p className="text-xs text-gray-500">لا توجد تنبيهات — البيانات مكتملة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">تنبيهات جودة البيانات</h3>
        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {alerts.length} تنبيه
        </span>
      </div>
      <div className="divide-y">
        {alerts.map((alert, idx) => (
          <div key={idx} className="px-5 py-3 flex items-center gap-3">
            {alert.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            <span className="text-xs text-gray-700 flex-1">{alert.message}</span>
            <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
              {alert.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
