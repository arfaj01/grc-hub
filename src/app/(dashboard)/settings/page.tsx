import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { count } = await supabase.from("settings").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-sm text-muted-foreground mt-1">إعدادات المنصة والتقارير</p>
        </div>
        <button className="px-4 py-2 bg-brand-teal text-white text-sm font-medium rounded-xl hover:bg-brand-teal-deep transition-colors">
          إضافة جديد
        </button>
      </div>

      {(count ?? 0) === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <p className="text-muted-foreground">لا توجد بيانات بعد</p>
          <p className="text-xs text-muted-foreground mt-1">ابدأ بإضافة أول عنصر</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border p-6">
          <p className="text-sm text-muted-foreground">عدد السجلات: {count}</p>
        </div>
      )}
    </div>
  );
}