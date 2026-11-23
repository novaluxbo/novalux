// src/app/dashboard/gestion-usuarios/components/UsuariosTable.jsx
'use client';

import { motion, AnimatePresence } from "framer-motion";
import LoadingState from '@/components/ui/LoadingState';

import {
    UserCircleIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    FunnelIcon,
    UsersIcon,
    EyeIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";

export default function UsuariosTable({
    usuarios,
    loading,
    onEditarUsuario,
    sucursalSeleccionada,
    sucursalSeleccionadaId
}) {
    const [rolFiltro, setRolFiltro] = useState('todos');
    const [mostrarSoloActivos, setMostrarSoloActivos] = useState(true);

    const rolesDisponibles = useMemo(() => {
        const rolesSet = new Set();
        usuarios.forEach(usuario => {
            if (usuario.roles?.nombre) rolesSet.add(usuario.roles.nombre);
        });
        return Array.from(rolesSet);
    }, [usuarios]);

    const usuariosFiltrados = useMemo(() => {
        let filtrados = usuarios;

        if (sucursalSeleccionadaId) {
            filtrados = filtrados.filter(usuario =>
                usuario.roles?.nombre?.toLowerCase() === 'admin' ||
                !usuario.sucursal_id ||
                usuario.sucursal_id === sucursalSeleccionadaId
            );
        }

        if (rolFiltro && rolFiltro !== 'todos') {
            filtrados = filtrados.filter(usuario =>
                usuario.roles?.nombre?.toLowerCase() === rolFiltro.toLowerCase()
            );
        }

        if (mostrarSoloActivos) {
            filtrados = filtrados.filter(usuario => usuario.activo === true);
        }

        return filtrados;
    }, [usuarios, sucursalSeleccionadaId, rolFiltro, mostrarSoloActivos]);

    useEffect(() => {
        if (rolFiltro && rolFiltro !== 'todos') {
            const rolExiste = usuarios.some(u =>
                u.roles?.nombre?.toLowerCase() === rolFiltro.toLowerCase()
            );
            if (!rolExiste) setRolFiltro('todos');
        }
    }, [usuarios, rolFiltro]);

    const handleRolChange = (e) => setRolFiltro(e.target.value);
    const toggleMostrarSoloActivos = () => setMostrarSoloActivos(v => !v);

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // ✅ Colores solo para los roles reales: admin y promotor
    const getRolColor = (rolNombre) => {
        const colors = {
            'admin': 'from-emerald-600 to-emerald-700',
            'promotor': 'from-teal-500 to-teal-600',
            'default': 'from-gray-500 to-gray-600'
        };
        return colors[rolNombre?.toLowerCase()] || colors.default;
    };

    // ✅ Solo mostramos sucursal o "Todas" (admin). Ya no hay caja.
    const getSucursalBadge = (usuario) => {
        const esAdmin = usuario.roles?.nombre?.toLowerCase() === 'admin';

        if (esAdmin || !usuario.sucursales?.nombre) {
            return (
                <div className="flex items-center justify-center space-x-1">
                    <EyeIcon className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">Todas las Sucursales</span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center space-x-1">
                <BuildingOfficeIcon className="h-3 w-3 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-700">{usuario.sucursales.nombre}</span>
            </div>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    if (loading) {
        return <LoadingState message="Cargando usuarios..." />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl border border-emerald-200 flex flex-col h-full"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
            {/* Filtros */}
            <div className="flex-shrink-0">
                <div className={`px-2 py-2 ${sucursalSeleccionadaId
                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className={`p-2 rounded-lg ${sucursalSeleccionadaId
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                    }`}
                            >
                                <FunnelIcon className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {sucursalSeleccionadaId ? 'Filtro aplicado' : 'Todos los usuarios'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {sucursalSeleccionadaId
                                        ? `Sucursal: ${sucursalSeleccionada?.nombre || `ID: ${sucursalSeleccionadaId}`}`
                                        : 'Mostrando todas las sucursales'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">Rol:</span>
                            </div>
                            <motion.select
                                whileHover={{ scale: 1.02 }}
                                value={rolFiltro}
                                onChange={handleRolChange}
                                className="text-xs border border-emerald-200 rounded-lg px-2.5 py-1.5 bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer min-w-[120px]"
                            >
                                <option value="todos">Todos los roles</option>
                                {rolesDisponibles.map((rol) => (
                                    <option key={rol} value={rol.toLowerCase()}>
                                        {rol}
                                    </option>
                                ))}
                            </motion.select>

                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs font-medium text-gray-700">
                                    📋 Mostrar solo activos
                                </span>
                                <button
                                    onClick={toggleMostrarSoloActivos}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer ${mostrarSoloActivos ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    role="switch"
                                    aria-checked={mostrarSoloActivos}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${mostrarSoloActivos ? 'translate-x-4' : 'translate-x-0.5'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`px-3 py-1 bg-white border rounded-lg shadow-sm ${sucursalSeleccionadaId
                                ? 'border-emerald-200'
                                : 'border-gray-300'
                                }`}
                        >
                            <span className={`text-sm font-semibold ${sucursalSeleccionadaId
                                ? 'text-emerald-700'
                                : 'text-gray-700'
                                }`}>
                                {usuariosFiltrados.length} de {usuarios.length} usuarios
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Headers tabla */}
                <div className="bg-emerald-50 border-b border-emerald-200">
                    <table className="min-w-full table-fixed">
                        <thead>
                            <tr>
                                {[
                                    { name: 'Usuario', icon: UserCircleIcon, width: 'w-1/5' },
                                    { name: 'Rol', icon: ShieldCheckIcon, width: 'w-1/6' },
                                    { name: 'Sucursal', icon: BuildingOfficeIcon, width: 'w-1/5' },
                                    { name: 'Última Modificación', icon: CalendarIcon, width: 'w-1/6' },
                                    { name: 'Estado', icon: CheckCircleIcon, width: 'w-1/6' },
                                    { name: 'Acciones', icon: PencilIcon, width: 'w-1/6' }
                                ].map((header, index) => (
                                    <motion.th
                                        key={header.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`px-6 py-4 ${header.width}`}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <header.icon className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                                                {header.name}
                                            </span>
                                        </div>
                                    </motion.th>
                                ))}
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {/* Cuerpo tabla */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <table className="min-w-full table-fixed">
                    <motion.tbody
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="bg-white"
                    >
                        <AnimatePresence>
                            {usuariosFiltrados.map((usuario) => (
                                <motion.tr
                                    key={usuario.id}
                                    variants={rowVariants}
                                    layout
                                    whileHover={{
                                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 w-1/5">
                                        <div className="flex items-center space-x-2">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex-shrink-0"
                                            >
                                                <UserCircleIcon className="h-5 w-5 text-emerald-700" />
                                            </motion.div>
                                            <div className="text-left min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {usuario.nombre}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${getRolColor(usuario.roles?.nombre)}`}
                                            >
                                                <ShieldCheckIcon className="h-3 w-3 text-white mr-1.5 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-white truncate">
                                                    {usuario.roles?.nombre || 'Sin rol'}
                                                </span>
                                            </motion.div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 w-1/5">
                                        {getSucursalBadge(usuario)}
                                    </td>

                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex flex-col items-center space-y-1">
                                            <div className="flex items-center space-x-1">
                                                <CalendarIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                <span className="text-xs font-medium text-gray-700">
                                                    {formatFecha(usuario.updated_at)}
                                                </span>
                                            </div>
                                            {usuario.created_at !== usuario.updated_at && (
                                                <span className="text-xs text-gray-500">
                                                    Creado: {formatFecha(usuario.created_at)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${usuario.activo
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                {usuario.activo ? (
                                                    <>
                                                        <CheckCircleIcon className="h-3 w-3 mr-1.5 text-emerald-500 flex-shrink-0" />
                                                        <span>Activo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircleIcon className="h-3 w-3 mr-1.5 text-rose-500 flex-shrink-0" />
                                                        <span>Inactivo</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.05,
                                                    x: 5,
                                                    backgroundColor: "rgba(16, 185, 129, 0.1)"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onEditarUsuario(usuario)}
                                                className="flex items-center space-x-2 px-4 py-2 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer"
                                            >
                                                <PencilIcon className="h-4 w-4 flex-shrink-0" />
                                                <span>Editar</span>
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </motion.tbody>
                </table>
            </div>

            {/* Estado vacío */}
            <AnimatePresence>
                {usuariosFiltrados.length === 0 && (
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-12 px-6"
                        >
                            <div className="max-w-sm mx-auto">
                                <motion.div
                                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-4"
                                >
                                    <UsersIcon className="h-8 w-8 text-emerald-500" />
                                </motion.div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {sucursalSeleccionadaId
                                        ? 'No hay usuarios en esta sucursal'
                                        : 'No hay usuarios registrados'
                                    }
                                </h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    {sucursalSeleccionadaId
                                        ? `No se encontraron usuarios en la sucursal "${sucursalSeleccionada?.nombre}"`
                                        : 'Comience agregando nuevos usuarios para gestionar su sistema.'
                                    }
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            {usuariosFiltrados.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-t border-emerald-200 px-6 py-3 flex-shrink-0"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">{usuariosFiltrados.length}</span> de <span className="font-medium">{usuarios.length}</span> usuarios
                            </div>
                            <div className="h-4 w-px bg-emerald-300"></div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs text-gray-600">
                                        {usuariosFiltrados.filter(u => u.activo).length} activos
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                    <span className="text-xs text-gray-600">
                                        {usuariosFiltrados.filter(u => !u.activo).length} inactivos
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {rolFiltro && rolFiltro !== 'todos' && (
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {rolFiltro.charAt(0).toUpperCase() + rolFiltro.slice(1)}
                                </span>
                            )}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mostrarSoloActivos
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-gray-600 bg-gray-100'
                                }`}>
                                {mostrarSoloActivos ? '✅ Solo activos' : '📋 Todos los usuarios'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}