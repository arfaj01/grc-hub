export default function NotesLoading() {
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-brand-teal/20 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-9 w-24 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
