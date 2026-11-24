// src/app/dashboard/components/SkeletonDashboard.jsx
'use client';

function Bone({ className = '' }) {
    return <div className={`bg-gray-100 rounded ${className}`} />;
}

function Pulse({ children, delay = 0 }) {
    return (
        <div
            className="animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default function SkeletonDashboard() {
    return (
        <div className="h-[100dvh] bg-emerald-50/40 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-3 md:px-5 py-3 flex flex-col gap-3">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex items-center justify-between shrink-0">
                    <div className="space-y-1.5">
                        <Bone className="h-3 w-20" />
                        <Bone className="h-2 w-32" />
                    </div>
                    <div className="flex gap-1.5">
                        <Bone className="h-7 w-20" />
                        <Bone className="h-7 w-24" />
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 shrink-0">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex items-center gap-2.5 min-h-[64px]">
                            <Bone className="w-9 h-9 rounded-lg" />
                            <div className="flex-1 space-y-1.5">
                                <Bone className="h-1.5 w-16" />
                                <Bone className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Categorías (5 cards en fila) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 shrink-0">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-2">
                            <div className="flex justify-between">
                                <Bone className="w-9 h-9 rounded-lg" />
                                <Bone className="h-3 w-8" />
                            </div>
                            <Bone className="h-2 w-20" />
                            <Bone className="h-5 w-24" />
                            <Bone className="h-1.5 w-full" />
                            <div className="flex justify-between">
                                <Bone className="h-2 w-10" />
                                <Bone className="h-2 w-10" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gráfica + Clientes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-0 flex flex-col">
                        <div className="space-y-1.5 mb-3">
                            <Bone className="h-2 w-24" />
                            <Bone className="h-3 w-32" />
                        </div>
                        <div className="flex-1 flex items-end gap-2 pt-4">
                            {[40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 60, 95].map((h, i) => (
                                <div key={i} className="flex-1 bg-gray-100 rounded-t animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-0 space-y-3">
                        <Bone className="h-3 w-24" />
                        <Bone className="h-8 w-20" />
                        <div className="grid grid-cols-2 gap-2">
                            <Bone className="h-10" />
                            <Bone className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Bone className="h-1.5 w-full" />
                            <Bone className="h-1.5 w-3/4" />
                            <Bone className="h-1.5 w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Lista inferior */}
                <div className="shrink-0 h-[28vh] min-h-[200px] max-h-[280px] bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Bone className="w-8 h-8 rounded-lg" />
                        <div className="space-y-1">
                            <Bone className="h-2 w-28" />
                            <Bone className="h-1.5 w-20" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 overflow-hidden">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Bone className="w-7 h-7 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Bone className="h-2 w-3/4" />
                                    <Bone className="h-1.5 w-1/2" />
                                </div>
                                <Bone className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}