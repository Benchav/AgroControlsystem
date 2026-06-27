export function ModelSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
                    <div className="h-48 bg-slate-200 rounded-lg w-full"></div>
                    <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <div className="h-5 bg-slate-200 rounded w-16"></div>
                        <div className="h-8 bg-slate-200 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}