export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-8"></div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}