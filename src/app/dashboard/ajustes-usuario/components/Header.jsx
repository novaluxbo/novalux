// components/Header.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, ShieldCheck, Users, UserPlus, Leaf } from 'lucide-react';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";

// Solo fade — sin y, sin scale, sin rotate
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
};

const chipVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
        opacity: 1,
        transition: { delay: i * 0.04, duration: 0.18, ease: 'easeOut' },
    }),
};

export default function Header({ onNuevoUsuario }) {
    const { values } = useMultiLocalStorageListener([
        "sucursalSeleccionada",
        "currentUser",
    ]);

    const { sucursalSeleccionada, currentUser } = values;
    const [ready, setReady] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!currentUser || !sucursalSeleccionada) return;
        const id = requestAnimationFrame(() => {
            if (mountedRef.current) setReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, [currentUser, sucursalSeleccionada]);

    // Normalizar por si vienen como string
    const sucursalNombre =
        typeof sucursalSeleccionada === 'string'
            ? sucursalSeleccionada
            : sucursalSeleccionada?.nombre || '—';

    const usuarioNombre =
        typeof currentUser === 'string'
            ? currentUser
            : currentUser?.nombre || '—';

    const rolNombre =
        typeof currentUser === 'string'
            ? '—'
            : currentUser?.roles?.nombre || '—';

    // Chips de contexto (sucursal / usuario / rol)
    const CHIPS_INFO = [
        { icon: Building2, label: 'Sucursal', value: sucursalNombre },
        { icon: User, label: 'Usuario', value: usuarioNombre },
        { icon: ShieldCheck, label: 'Rol', value: rolNombre },
    ];

    // Métrica simple de usuarios (puedes pasar un prop `metricas` si lo necesitas)
    const totalUsuarios = values.totalUsuarios ?? null;

    const CHIPS_METRICAS = totalUsuarios !== null
        ? [{ icon: Users, label: 'Total', value: totalUsuarios }]
        : [];

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
                        Gestión de Usuarios
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
                                    {[80, 72, 56, 60].map((w) => (
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

                                    {/* Separador + métricas (si existen) */}
                                    {CHIPS_METRICAS.length > 0 && (
                                        <>
                                            <div className="h-5 w-px bg-emerald-700 mx-1" />
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
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={onNuevoUsuario}
                        className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Nuevo usuario
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}