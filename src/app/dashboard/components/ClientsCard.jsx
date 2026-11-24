// src/app/dashboard/components/ClientsCard.jsx
'use client';
import { motion } from 'framer-motion';

const ESTADO_STYLE = {
    'Prospecto': 'bg-gray-100 text-gray-700',
    'Contactado': 'bg-blue-100 text-blue-700',
    'Preventa': 'bg-amber-100 text-amber-700',
    'Cliente': 'bg-emerald-100 text-emerald-700',
};

function Bar({ label, value, total, color = 'bg-emerald-500' }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-gray-600 truncate">{label}</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                    {value.toLocaleString('es-BO')}
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}

export default function ClientsCard({ resumen, loading, onSelectClients, active }) {
    const r = resumen || {};
    const total = r.total || 0;

    if (loading && !total) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full animate-pulse">
                <div className="h-4 w-32 bg-gray-100 rounded mb-3" />
                <div className="h-8 w-24 bg-gray-100 rounded mb-3" />
                <div className="space-y-2">
                    {[0, 1, 2].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
                </div>
            </div>
        );
    }

    const trend = r.trendNuevos || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onSelectClients}
            className={`
                bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col
                cursor-pointer transition-all
                ${active ? 'ring-2 ring-violet-400 shadow-md' : 'hover:shadow-md'}
            `}
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">👥</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Clientes</h3>
                            <p className="text-[10px] text-gray-500">
                                {active ? 'Viendo lista abajo ↓' : 'Click para ver ranking de compras'}
                            </p>
                        </div>
                    </div>
                    {trend !== 0 && (
                        <span className={`
                            text-[10px] font-bold px-2 py-1 rounded-full
                            ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                        `}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 space-y-3">
                {/* Total */}
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Total activos</p>
                    <p className="text-3xl font-bold text-gray-900 tabular-nums">
                        {total.toLocaleString('es-BO')}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        <span className="font-semibold text-emerald-600">+{r.nuevosMesActual || 0}</span> nuevos este mes
                    </p>
                </div>

                {/* Tipo */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500">Mayoristas</p>
                        <p className="text-sm font-bold text-gray-800 tabular-nums">
                            {(r.porTipo?.['Mayorista'] || 0).toLocaleString('es-BO')}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500">Cliente Final</p>
                        <p className="text-sm font-bold text-gray-800 tabular-nums">
                            {(r.porTipo?.['Cliente Final'] || 0).toLocaleString('es-BO')}
                        </p>
                    </div>
                </div>

                {/* Estado */}
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Por estado</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(r.porEstado || {}).map(([estado, count]) => (
                            <span
                                key={estado}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ESTADO_STYLE[estado] || 'bg-gray-100 text-gray-700'}`}
                            >
                                {estado}: {count}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Seguimientos */}
                {(r.conSeguimientoPendiente || 0) > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-2 py-1.5">
                        <span className="text-sm">🔔</span>
                        <span className="text-[11px] text-amber-800">
                            <strong>{r.conSeguimientoPendiente}</strong> con seguimiento pendiente
                        </span>
                    </div>
                )}

                {/* Top orígenes */}
                {r.porOrigen?.length > 0 && (
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Top orígenes</p>
                        <div className="space-y-1.5">
                            {r.porOrigen.slice(0, 3).map(o => (
                                <Bar
                                    key={o.origen}
                                    label={o.origen}
                                    value={o.count}
                                    total={total}
                                    color="bg-violet-500"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-center text-gray-400">
                    💡 Click para ver los clientes que más compraron
                </p>
            </div>
        </motion.div>
    );
}