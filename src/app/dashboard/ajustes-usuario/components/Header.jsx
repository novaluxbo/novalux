// src/app/dashboard/ajustes-usuario/components/Header.jsx
'use client';

import { motion } from 'framer-motion';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";
import { UserCircleIcon, ShieldCheckIcon, Building2 } from 'lucide-react';

export default function Header() {
    const { values } = useMultiLocalStorageListener([
        "sucursalSeleccionada",
        "currentUser",
    ]);

    const { sucursalSeleccionada, currentUser } = values;

    const chips = [
        { icon: Building2, label: 'Sucursal', value: sucursalSeleccionada?.nombre },
        { icon: UserCircleIcon, label: 'Usuario', value: currentUser?.nombre },
        { icon: ShieldCheckIcon, label: 'Rol', value: currentUser?.roles?.nombre },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900 p-3 rounded-xl shadow border border-emerald-800 border-l-[3px] border-l-amber-400"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1">
                    <h1 className="text-base font-semibold text-emerald-50 mb-2 flex items-center gap-2">
                        <UserCircleIcon className="w-4 h-4 text-amber-400" />
                        Mi Perfil
                    </h1>

                    <div className="flex flex-wrap items-center gap-2">
                        {chips.map((chip, i) => (
                            <motion.div
                                key={chip.label}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 px-3 py-1 rounded-full"
                            >
                                <chip.icon className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-emerald-300 text-xs">{chip.label}</span>
                                <span className="text-emerald-50 text-xs font-medium truncate">
                                    {chip.value || '—'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}