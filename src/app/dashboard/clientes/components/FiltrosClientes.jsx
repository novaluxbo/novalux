// src/app/dashboard/clientes/components/FiltrosClientes.jsx
'use client';

import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { DEPARTAMENTOS_BOLIVIA } from '../utils/constantes';

const containerVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

const inputClass =
    'px-3 py-1.5 bg-emerald-800 border border-emerald-700 rounded-lg text-sm text-emerald-100 placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors';

const labelClass = 'text-xs text-emerald-300 font-medium';

export default function FiltrosClientes({
    busqueda,
    onBusquedaChange,
    departamento,
    onDepartamentoChange,
    totalMostrados,
    totalOriginal,
    onLimpiar,
}) {
    const hayFiltros = busqueda || departamento;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-emerald-900 px-3 py-2 rounded-xl shadow border border-emerald-800 border-l-[3px] border-l-amber-400"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Búsqueda en tiempo real */}
                    <div className="flex items-center gap-2">
                        <label className={labelClass}>Buscar:</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => onBusquedaChange(e.target.value)}
                                placeholder="Código, nombre o contacto..."
                                className={`${inputClass} pl-8 w-64`}
                            />
                            {busqueda && (
                                <button
                                    onClick={() => onBusquedaChange('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtro departamento */}
                    <div className="flex items-center gap-2">
                        <label className={labelClass}>Departamento:</label>
                        <select
                            value={departamento}
                            onChange={(e) => onDepartamentoChange(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Todos</option>
                            {DEPARTAMENTOS_BOLIVIA.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Limpiar */}
                    {hayFiltros && (
                        <button
                            onClick={onLimpiar}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-50 bg-rose-950 border border-rose-800 rounded-lg hover:bg-rose-900 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Contador */}
                <span className="text-xs font-semibold text-emerald-50">
                    Mostrando: <span className="text-amber-400">{totalMostrados}</span>
                    {totalOriginal !== totalMostrados && ` de ${totalOriginal}`} clientes
                </span>
            </div>
        </motion.div>
    );
}