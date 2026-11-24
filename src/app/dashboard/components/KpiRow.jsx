// src/app/dashboard/components/KpiRow.jsx
'use client';
import { motion } from 'framer-motion';

const fmtBs = (n) => {
    const v = Number(n) || 0;
    if (v >= 1_000_000) return `Bs. ${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `Bs. ${(v / 1_000).toFixed(1)}k`;
    return `Bs. ${v.toLocaleString('es-BO')}`;
};
const fmtNum = (n) => (Number(n) || 0).toLocaleString('es-BO');

const ACCENTS = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
};

function KpiCard({ icon, label, value, sub, accent = 'emerald', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.25 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex items-center gap-2.5 min-h-[64px]"
        >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ACCENTS[accent]} flex items-center justify-center text-white text-base shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide truncate leading-tight">
                    {label}
                </p>
                <p className="text-base font-bold text-gray-900 truncate leading-tight tabular-nums">
                    {value}
                </p>
                {sub && <p className="text-[9px] text-gray-400 truncate leading-tight">{sub}</p>}
            </div>
        </motion.div>
    );
}

function Skeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex items-center gap-2.5 min-h-[64px] animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-1.5">
                <div className="h-1.5 w-16 bg-gray-100 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
        </div>
    );
}

export default function KpiRow({ stats, clientesResumen, loading }) {
    if (loading && !stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                {[0, 1, 2, 3].map(i => <Skeleton key={i} />)}
            </div>
        );
    }

    const s = stats || {};
    const c = clientesResumen || {};

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            <KpiCard icon="💰" label="Ventas del año" value={fmtBs(s.totalIngresos)} sub={`${fmtNum(s.totalVentas)} ventas`} accent="emerald" />
            <KpiCard icon="📦" label="Unidades vendidas" value={fmtNum(s.totalUnidades)} sub={`${fmtNum(s.totalProductos)} productos`} accent="blue" delay={0.05} />
            <KpiCard icon="📊" label="Ticket promedio" value={fmtBs(s.totalVentas ? s.totalIngresos / s.totalVentas : 0)} sub="por venta" accent="amber" delay={0.1} />
            <KpiCard icon="👥" label="Clientes activos" value={fmtNum(c.total)} sub={`+${fmtNum(c.nuevosMesActual)} este mes`} accent="violet" delay={0.15} />
        </div>
    );
}