// src/app/dashboard/gestion-productos/components/Tabla.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";
import { formatearFechaVencimiento, estadoVencimiento } from '@/utils/fechasProducto';
import LoadingState from '@/components/ui/LoadingState';
const COLORES_CATEGORIA = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { bg: 'bg-rose-100', text: 'text-rose-800' },
    { bg: 'bg-violet-100', text: 'text-violet-800' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
    { bg: 'bg-lime-100', text: 'text-lime-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
];

const getColorCategoria = (categoria) => {
    if (!categoria) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    const key = `${categoria.id ?? ''}-${categoria.nombre ?? ''}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const idx = Math.abs(hash) % COLORES_CATEGORIA.length;
    return COLORES_CATEGORIA[idx];
};

const formatearDiasRestantes = (dias) => {
    if (dias === null || dias === undefined) return '';
    if (dias === 0) return 'Vence hoy';
    if (dias < 0) {
        const abs = Math.abs(dias);
        if (abs >= 30) {
            const meses = Math.floor(abs / 30);
            return `Vencido hace ${meses} mes${meses === 1 ? '' : 'es'}`;
        }
        return `Vencido hace ${abs} día${abs === 1 ? '' : 's'}`;
    }
    if (dias >= 30) {
        const meses = Math.floor(dias / 30);
        return `${meses} mes${meses === 1 ? '' : 'es'}`;
    }
    return `${dias} día${dias === 1 ? '' : 's'}`;
};

const getBadgeTiempoRestante = (dias) => {
    if (dias === null || dias === undefined) return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
    if (dias < 0) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (dias === 0) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (dias <= 7) return { bg: 'bg-orange-100', text: 'text-orange-800' };
    if (dias <= 30) return { bg: 'bg-amber-100', text: 'text-amber-800' };
    return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
};

export default function Tabla({
    productos,
    onEditar,
    loading,
    sucursalSeleccionada,
    filtro = '',
    categoriaFiltro = '',
    soloActivos = false,
}) {
    const [visibleCount, setVisibleCount] = useState(20);
    const tableContainerRef = useRef(null);
    const { values } = useMultiLocalStorageListener(["currentUser"]);
    const { currentUser } = values;

    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            const coincideTexto =
                producto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                producto.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
                producto.precio.toString().includes(filtro) ||
                parseFloat(producto.precio).toFixed(2).includes(filtro);
            const coincideCategoria = categoriaFiltro
                ? producto.categorias?.id === Number(categoriaFiltro)
                : true;
            const coincideActivo = soloActivos ? producto.activo : true;
            return coincideTexto && coincideCategoria && coincideActivo;
        });
    }, [productos, filtro, categoriaFiltro, soloActivos]);

    useEffect(() => {
        setVisibleCount(20);
    }, [filtro, categoriaFiltro, soloActivos]);

    const productosVisibles = useMemo(() => {
        return productosFiltrados.slice(0, visibleCount);
    }, [productosFiltrados, visibleCount]);

    useEffect(() => {
        const tableContainer = tableContainerRef.current;
        const handleScroll = () => {
            if (!tableContainer) return;
            const scrollTop = tableContainer.scrollTop;
            const scrollHeight = tableContainer.scrollHeight - tableContainer.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            if (progress > 80 && visibleCount < productosFiltrados.length) {
                setVisibleCount(prev => Math.min(prev + 20, productosFiltrados.length));
            }
        };
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        return () => {
            if (tableContainer) {
                tableContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [visibleCount, productosFiltrados.length]);

    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [filtro, categoriaFiltro, soloActivos]);

    if (loading && productos.length === 0) {
        return <LoadingState message="Cargando productos..." />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow overflow-hidden"
        >
            <div
                ref={tableContainerRef}
                className="overflow-x-auto max-h-[70vh] sm:max-h-[73vh] overflow-y-auto"
            >
                <table className="min-w-full divide-y divide-emerald-200">
                    <thead className="sticky top-0 bg-emerald-800 z-40 text-emerald-50">
                        <tr>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider w-8 sm:w-12">N°</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Código</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">Producto</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Sucursal / Categoría</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">Precios</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden md:table-cell">Stock</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden xl:table-cell">Comisión</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">Vencimiento</th>
                            <th className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider">Acc.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-emerald-50/30 divide-y divide-emerald-200/50">
                        {productosVisibles.map((producto, index) => {
                            const colorCat = getColorCategoria(producto.categorias);
                            const venc = producto.fecha_vencimiento
                                ? estadoVencimiento(producto.fecha_vencimiento)
                                : null;
                            const diasRestantes = producto.fecha_vencimiento
                                ? Math.ceil((new Date(producto.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                                : null;
                            const badgeTiempo = getBadgeTiempoRestante(diasRestantes);
                            return (
                                <tr key={producto.id} className="hover:bg-amber-50/50 group">
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm uppercase font-medium text-emerald-950 hidden sm:table-cell">
                                        {producto.codigo}
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-xs sm:text-sm text-start text-emerald-950 font-semibold uppercase" style={{ maxWidth: "260px" }}>
                                        <div className="flex flex-col">
                                            <span className="truncate">{producto.nombre}</span>
                                            {producto.descripcion && (
                                                <span className="text-[10px] sm:text-xs text-emerald-600 truncate font-normal normal-case">
                                                    {producto.descripcion}
                                                </span>
                                            )}
                                            <span className={`lg:hidden inline-block w-fit mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${colorCat.bg} ${colorCat.text}`}>
                                                {producto.categorias?.nombre || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm text-emerald-950 hidden lg:table-cell">
                                        <div className="truncate">{producto.sucursales?.nombre || 'N/A'}</div>
                                        <div className={`inline-block px-2 py-0.5 mt-1 text-[10px] sm:text-[12px] font-bold rounded-full ${colorCat.bg} ${colorCat.text}`}>
                                            {producto.categorias?.nombre || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm text-emerald-950">
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold">Bs. {parseFloat(producto.precio).toFixed(2)}</span>
                                            {producto.precio_mayorista !== null && producto.precio_mayorista !== undefined && (
                                                <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">
                                                    May: Bs. {parseFloat(producto.precio_mayorista).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm text-emerald-950 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span>Act: {producto.stock_actual}</span>
                                            <span className="text-[10px] sm:text-xs text-emerald-600">Mín: {producto.stock_minimo}</span>
                                        </div>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm text-emerald-950 hidden xl:table-cell">
                                        <span className="inline-flex px-2 py-1 font-semibold rounded-full">
                                            {producto.comision_variable
                                                ? `Bs. ${parseFloat(producto.comision_variable).toFixed(2)}`
                                                : producto.categorias?.reglas_comision?.comision_base
                                                    ? `Bs. ${parseFloat(producto.categorias.reglas_comision.comision_base).toFixed(2)}`
                                                    : '-'}
                                        </span>
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap">
                                        {producto.fecha_vencimiento ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-900">
                                                    {formatearFechaVencimiento(producto.fecha_vencimiento)}
                                                </span>
                                                {venc?.label && (
                                                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${venc.clase}`}>
                                                        {venc.label}
                                                    </span>
                                                )}
                                                {diasRestantes !== null && (
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${badgeTiempo.bg} ${badgeTiempo.text}`}>
                                                        {formatearDiasRestantes(diasRestantes)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] sm:text-xs text-emerald-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-1 sm:px-2 py-2 text-center whitespace-nowrap text-xs sm:text-sm font-medium">
                                        <button
                                            onClick={() => currentUser?.roles?.nombre === 'admin' && onEditar(producto)}
                                            disabled={currentUser?.roles?.nombre !== 'admin'}
                                            className={`
                                                rounded-full px-2 py-1 transition-colors text-[10px] sm:text-xs font-semibold
                                                ${currentUser?.roles?.nombre === 'admin'
                                                    ? 'text-amber-900 cursor-pointer hover:text-amber-700 bg-amber-100'
                                                    : 'text-emerald-400 cursor-not-allowed bg-emerald-100'
                                                }
                                            `}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {visibleCount < productosFiltrados.length && (
                    <div className="py-3 sm:py-4 text-center text-xs sm:text-sm text-emerald-600">
                        <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Cargando más... ({visibleCount} de {productosFiltrados.length})
                        </span>
                    </div>
                )}

                {visibleCount >= productosFiltrados.length && productosFiltrados.length > 0 && (
                    <div className="py-3 sm:py-4 text-center text-xs sm:text-sm text-emerald-600">
                        Mostrando {productosFiltrados.length} de {productosFiltrados.length} productos
                    </div>
                )}
            </div>

            {productosFiltrados.length === 0 && (
                <div className="p-4 sm:p-6 text-center text-sm sm:text-base text-emerald-600">
                    {!sucursalSeleccionada
                        ? 'Selecciona una sucursal para ver los productos'
                        : productos.length === 0
                            ? `No hay productos registrados en ${sucursalSeleccionada.nombre}`
                            : 'No se encontraron productos con ese filtro o están inactivos.'}
                </div>
            )}
        </motion.div>
    );
}