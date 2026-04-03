export default function ReportsLoading() {
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 bg-gray-200 rounded" />
        <div className="h-9 w-32 bg-brand-teal/20 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-9 w-24 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
