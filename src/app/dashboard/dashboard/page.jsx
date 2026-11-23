// src/app/dashboard/page.jsx
'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-emerald-50/40 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-xl border border-emerald-200 border-l-4 border-l-amber-400 max-w-lg w-full overflow-hidden"
            >
                <div className="px-8 py-10 flex flex-col items-center text-center">
                    {/* Ícono animado */}
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 20 }}
                        className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mb-5"
                    >
                        <motion.div
                            animate={{ rotate: [0, -8, 8, -8, 0] }}
                            transition={{
                                duration: 2.4,
                                repeat: Infinity,
                                repeatDelay: 1.2,
                                ease: 'easeInOut',
                            }}
                        >
                            <Construction className="w-10 h-10 text-amber-600" />
                        </motion.div>
                    </motion.div>

                    {/* Título */}
                    <motion.h1
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.25 }}
                        className="text-2xl font-bold text-emerald-900 mb-2"
                    >
                        Dashboard en construcción
                    </motion.h1>

                    {/* Subtítulo */}
                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32, duration: 0.25 }}
                        className="text-sm text-emerald-700 leading-relaxed max-w-sm"
                    >
                        Estamos trabajando para traerte estadísticas en tiempo real
                        de tus ventas, productos y metas. ¡Volvé pronto!
                    </motion.p>

                    {/* Separador */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.4, duration: 0.35 }}
                        className="w-16 h-0.5 bg-amber-400 rounded-full my-6"
                    />

                    {/* Botón volver */}
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.48, duration: 0.25 }}
                    >
                        <Link
                            href="/dashboard/ventas"
                            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm hover:shadow"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Ir a Ventas
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}