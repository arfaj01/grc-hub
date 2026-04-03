export default function AchievementsLoading() {
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-brand-teal/20 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-9 w-28 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
