// src/app/dashboard/gestion-categorias/components/Tabla.jsx
import { useState, useMemo, useCallback } from 'react';
import LoadingState from '@/components/ui/LoadingState';

import { motion, AnimatePresence } from 'framer-motion';
import {
    TagIcon, CubeIcon, CheckCircleIcon, XCircleIcon,
    CurrencyDollarIcon, ChartBarIcon, PencilIcon,
    FunnelIcon, InformationCircleIcon, AdjustmentsHorizontalIcon,
    TrashIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const COLORES_ESTADO = {
    activa: 'bg-lime-100 text-lime-800 border-lime-300',
    inactiva: 'bg-rose-100 text-rose-800 border-rose-300',
};

const formatBs = (monto) => {
    if (monto === null || monto === undefined) return 'Bs. 0.00';
    return `Bs. ${parseFloat(monto).toFixed(2)}`;
};

const Tabla = ({ categorias = [], loading = false, onEditar, onEliminar, onReactivar, onReglasComision }) => {
    const [filtroActivo, setFiltroActivo] = useState('activos');

    const categoriasFiltradas = useMemo(() => {
        return categorias.filter(cat => {
            if (filtroActivo === 'activos') return cat.activo;
            if (filtroActivo === 'inactivos') return !cat.activo;
            return true;
        });
    }, [categorias, filtroActivo]);

    const estadisticas = useMemo(() => {
        const activas = categoriasFiltradas.filter(c => c.activo).length;
        const inactivas = categoriasFiltradas.filter(c => !c.activo).length;
        const totalProductos = categoriasFiltradas.reduce((sum, cat) => sum + (cat.total_productos || 0), 0);
        return { activas, inactivas, totalProductos };
    }, [categoriasFiltradas]);

    const renderDetallesComision = useCallback((categoria) => {
        const { tipo_comision_mostrar, detalles_comision } = categoria;

        if (!detalles_comision) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <CurrencyDollarIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-emerald-900 truncate max-w-[100px] sm:max-w-none">
                        {tipo_comision_mostrar || 'Sin configurar'}
                    </span>
                </div>
            );
        }

        if (tipo_comision_mostrar === 'Escalonada') {
            return (
                <div className="space-y-0.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <ChartBarIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-900 hidden sm:inline">Escalonada</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-emerald-700 leading-tight">
                        <div>B: <b className="text-emerald-800">{formatBs(detalles_comision.base)}</b></div>
                        <div>H: <b className="text-amber-700">{detalles_comision.limite} uds</b></div>
                        <div>D: <b className="text-orange-700">{formatBs(detalles_comision.post_limite)}</b></div>
                    </div>
                </div>
            );
        }

        if (tipo_comision_mostrar?.startsWith('Fija')) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <CurrencyDollarIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <div className="text-center">
                        <div className="text-xs font-semibold text-emerald-900 hidden sm:inline">Fija</div>
                        {detalles_comision.base && (
                            <div className="text-[10px] text-amber-700 font-bold">
                                {formatBs(detalles_comision.base)}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (tipo_comision_mostrar?.includes('Variable')) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div className="text-center">
                        <div className="text-xs font-semibold text-emerald-900 hidden sm:inline">Variable</div>
                        <div className="text-[9px] sm:text-[10px] text-emerald-700 font-medium">Por prod.</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center gap-1">
                <InformationCircleIcon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-900 truncate">{tipo_comision_mostrar}</span>
            </div>
        );
    }, []);

    if (loading && categorias.length === 0) {
        return <LoadingState message="Cargando categorías..." />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
        >
            {/* Filtros */}
            <div className="bg-emerald-900 border-b border-emerald-800 px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-950 rounded-lg">
                            <FunnelIcon className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-50">Filtro</p>
                            <p className="text-[10px] text-emerald-300">
                                {categoriasFiltradas.length} de {categorias.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {[
                            { key: 'todos', label: 'Todas', icon: TagIcon },
                            { key: 'activos', label: 'Activas', icon: CheckCircleIcon },
                            { key: 'inactivos', label: 'Inactivas', icon: XCircleIcon },
                        ].map((filtro) => (
                            <button
                                key={filtro.key}
                                onClick={() => setFiltroActivo(filtro.key)}
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer rounded-lg text-[10px] sm:text-xs font-medium transition-all ${filtroActivo === filtro.key
                                    ? 'bg-amber-400 text-emerald-950 shadow'
                                    : 'bg-emerald-800 text-emerald-200 border border-emerald-700 hover:bg-emerald-700'
                                    }`}
                            >
                                <filtro.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>{filtro.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla con scroll vertical y horizontal */}
            <div className="overflow-auto max-h-[65vh] sm:max-h-[70vh]">
                <table className="min-w-full divide-y divide-emerald-200">
                    <thead className="sticky top-0 bg-emerald-800 z-40 text-emerald-50">
                        <tr>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                                Productos
                            </th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden md:table-cell">
                                Activos
                            </th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                                Comisión
                            </th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                                Estado
                            </th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-emerald-50/30 divide-y divide-emerald-200/50">
                        <AnimatePresence>
                            {categoriasFiltradas.length > 0 ? (
                                categoriasFiltradas.map((categoria) => (
                                    <motion.tr
                                        key={categoria.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-amber-50/50 transition-colors"
                                    >
                                        {/* Categoría */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg">
                                                    <TagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700" />
                                                </div>
                                                <p className="text-[11px] sm:text-sm font-semibold text-emerald-950 max-w-[80px] sm:max-w-none truncate">
                                                    {categoria.nombre}
                                                </p>
                                                <span className={`sm:hidden inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${categoria.activo ? COLORES_ESTADO.activa : COLORES_ESTADO.inactiva}`}>
                                                    {categoria.activo ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Total productos */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center hidden sm:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                <CubeIcon className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-xs sm:text-sm font-semibold text-emerald-950">
                                                    {categoria.total_productos}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Productos activos */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center hidden md:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className={`text-xs sm:text-sm font-semibold ${categoria.productos_activos > 0 ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                                    {categoria.productos_activos}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Comisión */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center">
                                            {renderDetallesComision(categoria)}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center hidden sm:table-cell">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoria.activo ? COLORES_ESTADO.activa : COLORES_ESTADO.inactiva}`}>
                                                {categoria.activo ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                                                <span className="hidden md:inline">{categoria.activo ? 'Activa' : 'Inactiva'}</span>
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-1 sm:px-2 py-2 sm:py-3 text-center">
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5">
                                                <button
                                                    onClick={() => onReglasComision(categoria)}
                                                    className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                                                >
                                                    <ChartBarIcon className="h-3 w-3" />
                                                    <span>Reglas</span>
                                                </button>

                                                <button
                                                    onClick={() => onEditar(categoria)}
                                                    className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px] font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                                                >
                                                    <PencilIcon className="h-3 w-3" />
                                                    <span>Editar</span>
                                                </button>

                                                {categoria.activo ? (
                                                    <button
                                                        onClick={() => onEliminar(categoria)}
                                                        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 text-[10px] font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                        <span>Eliminar</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onReactivar(categoria)}
                                                        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-lime-100 text-lime-800 hover:bg-lime-200 text-[10px] font-semibold transition-colors w-full sm:w-auto cursor-pointer"
                                                    >
                                                        <ArrowPathIcon className="h-3 w-3" />
                                                        <span>Reactivar</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12">
                                        <div className="text-center">
                                            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                                <TagIcon className="h-6 w-6 text-amber-500" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                                                No se encontraron categorías
                                            </h3>
                                            <p className="text-emerald-600 text-xs">
                                                {filtroActivo === 'activos'
                                                    ? 'No hay categorías activas.'
                                                    : filtroActivo === 'inactivos'
                                                        ? 'No hay categorías inactivas.'
                                                        : 'No hay categorías registradas.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {categoriasFiltradas.length > 0 && (
                <div className="bg-emerald-900 border-t border-emerald-800 px-3 sm:px-4 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-emerald-200">
                            <span><b className="text-amber-400">{categoriasFiltradas.length}</b> categorías</span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                                {estadisticas.activas} activas
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                {estadisticas.inactivas} inactivas
                            </span>
                        </div>
                        <div className="text-emerald-200">
                            Productos: <b className="text-amber-400">{estadisticas.totalProductos}</b>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Tabla;