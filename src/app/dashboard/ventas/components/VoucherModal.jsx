// src/app/dashboard/ventas/components/VoucherModal.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download } from 'lucide-react';

export default function VoucherModal({ abierto, url, onCerrar }) {
    if (!abierto || !url) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCerrar}
                className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-emerald-200"
                >
                    {/* Header emerald */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-200 bg-emerald-50">
                        <h3 className="text-sm font-semibold text-emerald-900">Comprobante</h3>
                        <div className="flex items-center gap-1">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                                href={url}
                                download
                                className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                            <button
                                onClick={onCerrar}
                                className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Imagen */}
                    <div className="flex-1 overflow-auto bg-emerald-50/40 flex items-center justify-center p-2">
                        <img
                            src={url}
                            alt="Comprobante de venta"
                            className="max-w-full max-h-[80vh] object-contain rounded"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}