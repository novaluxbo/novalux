// src/app/dashboard/clientes/components/ModalConfirmarBaja.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Loader2, UserX } from 'lucide-react';

export default function ModalConfirmarBaja({
    abierto,
    cliente,
    onCerrar,
    onConfirmar,
    loading,
}) {
    if (!abierto || !cliente) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onCerrar}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header con ícono de alerta */}
                    <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-4 border-b border-emerald-100 bg-emerald-50">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-rose-700" />
                        </div>
                        <h2 className="text-base font-semibold text-emerald-950">
                            Dar de baja cliente
                        </h2>
                        <p className="text-xs text-emerald-600 text-center leading-snug">
                            Esta acción desactivará al cliente.<br />
                            Sus ventas anteriores se conservarán.
                        </p>
                        <button
                            onClick={onCerrar}
                            className="absolute top-3 right-3 p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-emerald-700" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                            <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-rose-900">
                                    {cliente.nombre_cliente}
                                </span>
                                <span className="text-[11px] text-rose-700">
                                    {cliente.codigo_cliente}
                                    {cliente.nombre_comercial && ` · ${cliente.nombre_comercial}`}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-700 mt-3 leading-relaxed">
                            El cliente dejará de aparecer en el listado activo, pero podrás reactivarlo más adelante desde el mismo registro.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-6 pb-5">
                        <button
                            onClick={onCerrar}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg border border-emerald-300 text-sm font-medium text-emerald-800 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirmar}
                            disabled={loading}
                            className="flex-[2] py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Dando de baja...
                                </>
                            ) : (
                                <>
                                    <UserX className="w-3.5 h-3.5" />
                                    Confirmar baja
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}