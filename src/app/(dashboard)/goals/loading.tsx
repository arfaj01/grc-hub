export default function GoalsLoading() {
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-brand-teal/20 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-10 bg-brand-blue/10 rounded" />
              <div className="h-5 w-48 bg-gray-200 rounded" />
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full w-full" />
            <div className="flex items-center gap-3">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
