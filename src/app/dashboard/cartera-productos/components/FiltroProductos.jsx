// src/app/dashboard/gestion-productos/components/FiltroProductos.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FiltroProductos = ({
    productos,
    sucursalSeleccionada,
    onFiltroChange,
    onCategoriaChange,
    onSoloActivosChange,
}) => {
    const [filtro, setFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [soloActivos, setSoloActivos] = useState(true);

    useEffect(() => {
        onSoloActivosChange(true);
    }, []);

    const categoriasUnicas = Array.from(
        new Set(
            productos
                .filter(p => p.categorias?.nombre)
                .map(p => JSON.stringify({ id: p.categorias.id, nombre: p.categorias.nombre }))
        )
    ).map(c => JSON.parse(c));

    const manejarCambioBusqueda = (e) => {
        const value = e.target.value;
        setFiltro(value);
        onFiltroChange(value);
    };

    const limpiarBusqueda = () => {
        setFiltro('');
        onFiltroChange('');
    };

    const manejarCambioCategoria = (e) => {
        const value = e.target.value;
        setCategoriaFiltro(value);
        onCategoriaChange(value);
    };

    const limpiarFiltros = () => {
        setFiltro('');
        setCategoriaFiltro('');
        onFiltroChange('');
        onCategoriaChange('');
    };

    const manejarSoloActivosToggle = () => {
        const newValue = !soloActivos;
        setSoloActivos(newValue);
        onSoloActivosChange(newValue);
    };

    const mostrarBotonLimpiar = filtro || categoriaFiltro;

    const inputClass =
        'px-3 py-1.5 sm:py-2 bg-emerald-800 border border-emerald-700 rounded-md text-xs sm:text-sm text-emerald-100 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors';

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-emerald-900 px-2 sm:px-3 py-2 rounded-lg shadow-sm border border-emerald-800 border-l-[3px] border-l-amber-400"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
                    {/* Filtro de búsqueda */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs sm:text-sm text-emerald-300 font-medium shrink-0">
                            Buscar:
                        </label>
                        <div className="relative flex-1 sm:flex-initial">
                            <input
                                type="text"
                                value={filtro}
                                onChange={manejarCambioBusqueda}
                                placeholder="Código, nombre o precio..."
                                className={`${inputClass} pr-8 w-full sm:w-64`}
                            />
                            {filtro && (
                                <button
                                    type="button"
                                    onClick={limpiarBusqueda}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-amber-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtro por Categoría */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs sm:text-sm text-emerald-300 font-medium shrink-0">
                            Filtrar por:
                        </label>
                        <select
                            value={categoriaFiltro}
                            onChange={manejarCambioCategoria}
                            className={`${inputClass} flex-1 sm:flex-initial`}
                        >
                            <option value="">Categorías</option>
                            {categoriasUnicas.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón limpiar filtros */}
                    <AnimatePresence>
                        {mostrarBotonLimpiar && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, x: -20 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                exit={{ scale: 0, opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <button
                                    onClick={limpiarFiltros}
                                    className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-emerald-50 bg-rose-950 ring ring-rose-800 rounded-md hover:bg-rose-900 cursor-pointer transition-colors w-full sm:w-auto"
                                >
                                    Limpiar filtros
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Contador y switch */}
                <div className="text-xs text-emerald-100 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 lg:gap-1">
                    <span className="font-semibold whitespace-nowrap">
                        Mostrando: <span className="text-amber-400">{productos.length}</span> productos
                    </span>

                    <label className="flex items-center gap-1 cursor-pointer text-xs whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={soloActivos}
                            onChange={manejarSoloActivosToggle}
                            className="sr-only"
                        />
                        <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${soloActivos ? 'bg-amber-400' : 'bg-emerald-700'}`}>
                            <div className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full transition-all duration-200 ${soloActivos ? 'translate-x-4' : ''}`} />
                        </div>
                        <span>Solo activos</span>
                    </label>
                </div>
            </div>
        </motion.div>
    );
};

export default FiltroProductos;