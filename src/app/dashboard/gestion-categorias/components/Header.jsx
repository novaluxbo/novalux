// src/app/dashboard/gestion-categorias/components/Header.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";
import { Building2, User, ShieldCheck, Tag } from 'lucide-react';

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

const Chip = ({ icon: Icon, label, value, index }) => (
    <motion.div
        custom={index}
        variants={chipVariants}
        className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 px-3 py-1 rounded-full"
    >
        <Icon className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-emerald-300 text-xs">{label}</span>
        <span className="text-emerald-50 text-xs font-medium truncate">{value || '—'}</span>
    </motion.div>
);

export default function Header({ onNuevaCategoria, totalCategorias }) {
    const { values } = useMultiLocalStorageListener([
        "sucursalSeleccionada",
        "currentUser",
    ]);

    const { sucursalSeleccionada, currentUser } = values;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ Solo depende de currentUser; sucursal puede ser null (admin sin sucursal)
        if (currentUser) setLoading(false);
    }, [currentUser]);

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-900 p-3 rounded-xl shadow border border-emerald-800 border-l-[3px] border-l-amber-400"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-base font-semibold text-emerald-50 mb-2"
                        >
                            Gestión de Categorías
                        </motion.h1>
                        <div className="flex gap-2">
                            {[80, 72, 56, 60].map((w) => (
                                <div key={w} className="h-6 rounded-full bg-emerald-800 border border-emerald-700 animate-pulse" style={{ width: w }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400 mx-auto"></div>
                </div>
            </motion.div>
        );
    }

    const chips = [
        { icon: Building2, label: 'Sucursal', value: sucursalSeleccionada?.nombre },
        { icon: User, label: 'Usuario', value: currentUser?.nombre },
        { icon: ShieldCheck, label: 'Rol', value: currentUser?.roles?.nombre },
        { icon: Tag, label: 'Categorías', value: totalCategorias || 0 },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-emerald-900 p-3 rounded-xl shadow border border-emerald-800 border-l-[3px] border-l-amber-400"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-base font-semibold text-emerald-50 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-400" />
                        Gestión de Categorías
                    </h1>

                    <div className="flex flex-wrap items-center gap-2">
                        {chips.map((chip, i) => (
                            <Chip key={chip.label} {...chip} index={i} />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={onNuevaCategoria}
                        className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    >
                        <span className="text-base leading-none">+</span>
                        Nueva Categoría
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}