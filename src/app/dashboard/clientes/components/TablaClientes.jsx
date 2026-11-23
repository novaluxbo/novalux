// src/app/dashboard/clientes/components/TablaClientes.jsx
'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Users, Phone, MapPin, Edit, FileText } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';

const COLORES_ESTADO = {
    Prospecto: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Contactado: 'bg-sky-100 text-sky-800 border-sky-300',
    Preventa: 'bg-amber-100 text-amber-800 border-amber-300',
    Cliente: 'bg-lime-100 text-lime-800 border-lime-300',
};

const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    try {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return '—';
    }
};

export default function TablaClientes({
    clientes,
    loading,
    onEditar,
    currentUser,
}) {
    const [displayCount, setDisplayCount] = useState(20);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreTriggerRef = useRef(null);

    const clientesSeguros = Array.isArray(clientes) ? clientes : [];

    const clientesToShow = useMemo(
        () => clientesSeguros.slice(0, displayCount),
        [clientesSeguros, displayCount]
    );

    useEffect(() => {
        setHasMore(displayCount < clientesSeguros.length);
    }, [displayCount, clientesSeguros.length]);

    useEffect(() => {
        setDisplayCount(20);
        setHasMore(true);
        setIsLoadingMore(false);
    }, [clientesSeguros.length]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        await new Promise((r) => setTimeout(r, 200));
        setDisplayCount((prev) => Math.min(prev + 20, clientesSeguros.length));
        setIsLoadingMore(false);
    }, [isLoadingMore, hasMore, clientesSeguros.length]);

    useEffect(() => {
        if (!loadMoreTriggerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) loadMore();
            },
            { threshold: 0.1, rootMargin: '100px' }
        );
        observer.observe(loadMoreTriggerRef.current);
        return () => {
            if (loadMoreTriggerRef.current) observer.unobserve(loadMoreTriggerRef.current);
        };
    }, [hasMore, isLoadingMore, loadMore]);


    if (loading && clientesSeguros.length === 0) {
        return <LoadingState message="Cargando clientes..." />;
    }

    if (clientesSeguros.length === 0) {
        return (
            <div className="bg-white border border-emerald-200 border-l-[3px] border-l-amber-400 rounded-xl flex flex-col items-center justify-center text-center min-h-[60vh]">
                <Users className="w-7 h-7 text-amber-500 mb-3" />
                <p className="text-emerald-900 font-semibold mb-1">No hay clientes registrados</p>
                <p className="text-emerald-600 text-sm">Comience creando un nuevo cliente</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow overflow-hidden"
        >
            <div className="overflow-x-auto max-h-[73vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-emerald-200">
                    <thead className="sticky top-0 bg-emerald-800 z-50 text-emerald-50">
                        <tr>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider w-12">N°</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Código</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Ingreso</th>
                            <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Contacto</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Tipo</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Ubicación</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Responsable</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Estado</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Seguimiento</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider">Notas</th>
                            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-emerald-50/30 divide-y divide-emerald-200/50">
                        {clientesToShow.map((c, index) => {
                            const estado = c.estado || '';
                            const depto = c.departamento || '';
                            const tipoCliente = c.tipo_cliente || '';
                            const tipoComercio = c.tipo_comercio || '';
                            const activo = c.activo !== false;

                            return (
                                <tr key={c.id} className={`hover:bg-amber-50/50 transition-colors ${!activo ? 'opacity-50' : ''}`}>
                                    <td className="px-2 py-2 text-center">
                                        <span className="text-xs font-bold text-emerald-700">{index + 1}</span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="text-xs tracking-widest font-mono font-semibold text-amber-300 bg-emerald-950 px-1.5 py-0.5 rounded">
                                            {c.codigo_cliente}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                        <span className="text-xs font-semibold text-emerald-800">
                                            {formatearFecha(c.fecha_ingreso)}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-left max-w-[200px]">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-black truncate">{c.nombre_cliente}</span>
                                            {c.nombre_comercial && (
                                                <span className="text-[11px] text-emerald-600 truncate">{c.nombre_comercial}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {c.numero_contacto ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-black">
                                                <Phone className="w-3 h-3 text-emerald-600" />
                                                {c.numero_contacto}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-emerald-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex flex-col gap-0.5 items-center">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tipoCliente === 'Mayorista' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {tipoCliente || '—'}
                                            </span>
                                            <span className="text-[10px] text-emerald-600">{tipoComercio}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            {depto ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-black">
                                                    <MapPin className="w-3 h-3 text-amber-600" />
                                                    {depto}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-emerald-400">—</span>
                                            )}
                                            {c.localidad && <span className="text-[10px] text-emerald-600">{c.localidad}</span>}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="text-xs text-black">{c.responsable?.nombre || '—'}</span>
                                        {c.responsable?.caja && (
                                            <div className="text-[10px] text-emerald-600">Caja {c.responsable.caja}</div>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${COLORES_ESTADO[estado] || 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
                                            {estado || '—'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex flex-col items-center gap-0.5 text-[10px]">
                                            {c.ultimo_contacto && (
                                                <span className="text-emerald-700">
                                                    Últ: {formatearFecha(c.ultimo_contacto)}
                                                </span>
                                            )}
                                            {c.proximo_seguimiento && (
                                                <span className="text-amber-700 font-semibold">
                                                    Próx: {formatearFecha(c.proximo_seguimiento)}
                                                </span>
                                            )}
                                            {!c.ultimo_contacto && !c.proximo_seguimiento && (
                                                <span className="text-emerald-400">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center max-w-[180px]">
                                        {c.notas ? (
                                            <div className="inline-flex items-start gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                                <FileText className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2 text-left">{c.notas}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-emerald-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {/* ✅ Solo botón Editar (texto, sin ícono) */}
                                        <button
                                            onClick={() => onEditar(c)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-semibold transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {hasMore && (
                    <div ref={loadMoreTriggerRef} className="py-4 flex justify-center items-center">
                        {isLoadingMore ? (
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Cargando más clientes...</span>
                            </div>
                        ) : (
                            <div className="h-8" />
                        )}
                    </div>
                )}

                {!hasMore && clientesSeguros.length > 20 && (
                    <div className="py-4 text-center">
                        <p className="text-xs text-emerald-500">
                            Mostrando {clientesSeguros.length} de {clientesSeguros.length} clientes
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}