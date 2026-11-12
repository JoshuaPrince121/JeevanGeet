export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mb-8"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mb-4"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 mb-8"></div>
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  );
}