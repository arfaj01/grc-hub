export default function InitiativesLoading() {
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-brand-teal/20 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-56 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="w-20 space-y-1">
              <div className="h-1.5 bg-gray-100 rounded-full" />
              <div className="h-3 w-8 bg-gray-100 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
