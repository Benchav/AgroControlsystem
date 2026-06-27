export function ModelSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse border border-emerald-400/15  rounded-xl p-5 space-y-4 bg-[#081114]/95 shadow-sm">
                    <div className="h-48 bg-emerald-400/15 rounded-lg w-full"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-3 bg-emerald-400/15 rounded w-full"></div>
                        <div className="h-3 bg-emerald-400/15 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-emerald-400/15 ">
                        <div className="h-5 bg-emerald-400/15 rounded w-16"></div>
                        <div className="h-8 bg-emerald-400/15 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}