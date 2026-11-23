// src/app/dashboard/ventas/components/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, ShieldCheck, DollarSign } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

const chipVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.18, ease: 'easeOut' },
    }),
};

const btnVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: (delay) => ({
        opacity: 1,
        y: 0,
        transition: { delay, duration: 0.18, ease: 'easeOut' },
    }),
};

const CHIPS = [
    { icon: Building2, label: 'Sucursal', key: 'sucursal' },
    { icon: User, label: 'Usuario', key: 'usuario' },
    { icon: ShieldCheck, label: 'Rol', key: 'rol' },
];

export default function Header({
    onMostrarComisiones,
    onNuevaVenta,
    currentSucursal,
    rolNombre,
    currentUser,
}) {
    const [ready, setReady] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // ready SOLO depende de currentUser
    useEffect(() => {
        if (!currentUser) {
            setReady(false);
            return;
        }
        const id = requestAnimationFrame(() => {
            if (mountedRef.current) setReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, [currentUser]);

    const mostrarComisiones = typeof onMostrarComisiones === 'function';

    const chipValues = [
        currentSucursal?.nombre || '—',
        currentUser?.nombre || '—',
        rolNombre || '—',
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-emerald-900 p-2 sm:p-3 rounded-xl shadow-md border border-emerald-800 border-l-4 border-l-amber-400"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg sm:text-xl font-bold text-emerald-50 mb-2"
                    >
                        Revisión de ventas
                    </motion.h1>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-h-[28px]">
                        <AnimatePresence mode="wait">
                            {!ready ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                    className="flex gap-2"
                                >
                                    {[80, 72, 56].map((w) => (
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
                                    {CHIPS.map(({ icon: Icon, label }, i) => (
                                        <motion.div
                                            key={label}
                                            custom={i}
                                            variants={chipVariants}
                                            className="inline-flex items-center gap-1 bg-emerald-800 border border-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full max-w-full"
                                        >
                                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                                            <span className="text-emerald-300 font-medium text-xs">{label}:</span>
                                            <span className="font-semibold text-emerald-50 text-xs truncate">
                                                {chipValues[i]}
                                            </span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-2">
                    <AnimatePresence mode="wait">
                        {!ready ? (
                            <motion.div
                                key="btn-skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                className="flex gap-2"
                            >
                                {mostrarComisiones && (
                                    <div className="h-8 w-32 rounded-lg bg-emerald-800 border border-emerald-700 animate-pulse" />
                                )}
                                <div className="h-8 w-24 rounded-lg bg-emerald-800 border border-emerald-700 animate-pulse" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="btns"
                                className="flex flex-wrap items-center gap-2"
                                initial="hidden"
                                animate="visible"
                            >
                                {mostrarComisiones && (
                                    <motion.button
                                        custom={0}
                                        variants={btnVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onMostrarComisiones}
                                        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 cursor-pointer text-emerald-50 px-3 sm:pl-3 sm:pr-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors"
                                    >
                                        <div className="bg-emerald-950/40 p-1 sm:p-1.5 rounded-full">
                                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                                        </div>
                                        <span>Ver comisiones</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    custom={mostrarComisiones ? 0.06 : 0}
                                    variants={btnVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onNuevaVenta}
                                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 cursor-pointer text-emerald-950 px-3 sm:pl-3 sm:pr-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors"
                                >
                                    <div className="bg-emerald-950/20 p-1 sm:p-1.5 rounded-full">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <span>Nueva venta</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}