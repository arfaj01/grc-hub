export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse" dir="rtl">
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
            <div className="h-2 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl border p-6 space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-12 bg-gray-100 rounded" />
              <div className="h-3 flex-1 bg-gray-100 rounded" />
              <div className="h-2 w-24 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 space-y-3">
          <div className="h-5 w-28 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-50 rounded-lg" />
        </div>
      </div>

      {/* Three-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
            <div className="h-5 w-28 bg-gray-200 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-3 bg-gray-100 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
