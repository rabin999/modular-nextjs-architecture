export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 w-1/4 rounded"></div>
                <div className="h-12 bg-slate-200 w-full rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-200 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
