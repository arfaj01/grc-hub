export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse" dir="rtl">
      <div className="h-7 w-28 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-24 bg-brand-teal/20 rounded-lg" />
      </div>
    </div>
  );
}
