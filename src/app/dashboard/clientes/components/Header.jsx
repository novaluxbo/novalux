// src/app/dashboard/clientes/components/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, ShieldCheck, Users, UserPlus, TrendingUp, UserCheck, Leaf } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

const chipVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.18, ease: 'easeOut' },
    }),
};

export default function Header({
    metricas,
    onNuevoCliente,
    currentUser,
    currentSucursal,
    rolNombre,
}) {
    const [ready, setReady] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!currentUser || !currentSucursal) return;
        const id = requestAnimationFrame(() => {
            if (mountedRef.current) setReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, [currentUser, currentSucursal]);

    // Normalizar por si currentSucursal viene como string
    const sucursalNombre =
        typeof currentSucursal === 'string'
            ? currentSucursal
            : currentSucursal?.nombre || '—';

    const usuarioNombre =
        typeof currentUser === 'string'
            ? currentUser
            : currentUser?.nombre || '—';

    // Chips de contexto (sucursal / usuario / rol)
    const CHIPS_INFO = [
        { icon: Building2, label: 'Sucursal', value: sucursalNombre },
        { icon: User, label: 'Usuario', value: usuarioNombre },
        { icon: ShieldCheck, label: 'Rol', value: rolNombre || '—' },
    ];

    // Chips de métricas (total / prospectos / clientes)
    const CHIPS_METRICAS = [
        { icon: Users, label: 'Total', value: metricas?.total ?? 0 },
        { icon: TrendingUp, label: 'Prospectos', value: metricas?.porEstado?.Prospecto ?? 0 },
        { icon: UserCheck, label: 'Clientes', value: metricas?.porEstado?.Cliente ?? 0 },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-emerald-900 p-3 rounded-xl shadow border border-emerald-800 border-l-[3px] border-l-amber-400"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                    <h1 className="text-base font-semibold text-emerald-50 mb-2 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-amber-400" />
                        Cartera de clientes
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                        <AnimatePresence mode="wait">
                            {!ready ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                    className="flex gap-2"
                                >
                                    {[80, 72, 56, 60, 70, 64].map((w) => (
                                        <div
                                            key={w}
                                            className="h-6 rounded-full bg-emerald-800 border border-emerald-700 animate-pulse"
                                            style={{ width: w }}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chips"
                                    className="flex flex-wrap items-center gap-2"
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {/* Chips de contexto: sucursal / usuario / rol */}
                                    {CHIPS_INFO.map(({ icon: Icon, label, value }, i) => (
                                        <motion.div
                                            key={`info-${label}`}
                                            custom={i}
                                            variants={chipVariants}
                                            className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 px-3 py-1 rounded-full"
                                        >
                                            <Icon className="w-3.5 h-3.5 text-amber-400" />
                                            <span className="text-emerald-300 text-xs">{label}</span>
                                            <span className="text-emerald-50 text-xs font-medium">{value}</span>
                                        </motion.div>
                                    ))}

                                    {/* Separador */}
                                    <div className="h-5 w-px bg-emerald-700 mx-1" />

                                    {/* Chips de métricas */}
                                    {CHIPS_METRICAS.map(({ icon: Icon, label, value }, i) => (
                                        <motion.div
                                            key={`met-${label}`}
                                            custom={CHIPS_INFO.length + i}
                                            variants={chipVariants}
                                            className="inline-flex items-center gap-1.5 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full"
                                        >
                                            <Icon className="w-3.5 h-3.5 text-amber-300" />
                                            <span className="text-emerald-400 text-xs">{label}</span>
                                            <span className="text-amber-100 text-xs font-bold">{value}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={onNuevoCliente}
                        className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Nuevo cliente
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}