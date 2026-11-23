'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";

export default function Header({ onNuevaSucursal }) {
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
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col mx-1 sm:mx-5">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl sm:text-2xl font-bold text-emerald-900"
                        >
                            Gestión de Sucursales
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm sm:text-base text-emerald-700 font-semibold"
                        >
                            Sucursal: {sucursalSeleccionada?.nombre || 'Seleccionando...'}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm sm:text-base text-emerald-700 font-semibold"
                        >
                            Usuario: {currentUser?.nombre || 'Cargando...'}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm sm:text-base text-emerald-700 font-semibold"
                        >
                            Rol: {currentUser?.roles?.nombre || 'Cargando...'}
                        </motion.p>
                    </div>
                    <button
                        onClick={onNuevaSucursal}
                        className="bg-amber-400 hover:bg-amber-300 cursor-pointer text-emerald-950 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors"
                    >
                        + Nueva Sucursal
                    </button>
                </div>
                <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-2 text-sm sm:text-base text-emerald-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-emerald-900 p-2 sm:p-3 rounded-xl shadow-md border border-emerald-800 border-l-4 border-l-amber-400 mb-3"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg sm:text-xl font-bold text-emerald-50 mb-2"
                    >
                        Gestión de Sucursales
                    </motion.h1>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1 bg-emerald-800 border border-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full max-w-full"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-emerald-300 font-medium">Sucursal:</span>
                            <span className="font-semibold text-emerald-50 truncate">
                                {sucursalSeleccionada?.nombre || 'No seleccionada'}
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-1 bg-emerald-800 border border-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full max-w-full"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-emerald-300 font-medium">Usuario:</span>
                            <span className="font-semibold text-emerald-50 truncate">{currentUser?.nombre}</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center gap-1 bg-emerald-800 border border-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full max-w-full"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-emerald-300 font-medium">Rol:</span>
                            <span className="font-semibold text-emerald-50 truncate">{currentUser?.roles?.nombre}</span>
                        </motion.div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNuevaSucursal}
                        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 cursor-pointer text-emerald-950 px-3 sm:pl-3 sm:pr-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors"
                    >
                        <div className="bg-emerald-950/20 p-1 sm:p-1.5 rounded-full">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span>Nueva Sucursal</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}