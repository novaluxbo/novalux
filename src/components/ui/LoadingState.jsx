'use client';

import { motion } from 'framer-motion';

/**
 * Spinner de carga reutilizable.
 * Mantiene la misma animación en todos los módulos.
 *
 * @param {string} message - Texto debajo del spinner
 * @param {string} className - Clases extra para el contenedor
 * @param {boolean} fullScreen - Si true, ocupa toda la pantalla
 */
export default function LoadingState({
    message = 'Cargando...',
    className = '',
    fullScreen = false,
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={
                fullScreen
                    ? `min-h-screen flex items-center justify-center bg-gray-50 ${className}`
                    : `bg-white rounded-2xl shadow-xl border border-emerald-200 p-8 text-center min-h-[400px] flex items-center justify-center ${className}`
            }
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full"
                />
                <p className="text-emerald-700 font-medium">{message}</p>
            </div>
        </motion.div>
    );
}