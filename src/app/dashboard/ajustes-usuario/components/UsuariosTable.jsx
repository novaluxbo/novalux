'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
    UserCircleIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    CubeIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    FunnelIcon,
    UsersIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";

export default function UsuariosTable({
    usuarios,
    loading,
    onEditarUsuario,
    sucursalSeleccionada,
    sucursalSeleccionadaId
}) {
    const { values } = useMultiLocalStorageListener(["currentUser"]);
    const { currentUser } = values;

    // Filtrar solo el usuario actual
    const usuarioActual = usuarios.find(usuario => usuario.id === currentUser?.id);
    const usuariosFiltrados = usuarioActual ? [usuarioActual] : [];

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getRolColor = (rolNombre) => {
        const colors = {
            'administrador': 'from-amber-400 to-amber-500',
            'promotor': 'from-emerald-600 to-emerald-700',
            'cajero': 'from-emerald-700 to-emerald-800',
            'supervisor': 'from-amber-300 to-amber-400',
            'default': 'from-emerald-700 to-emerald-800'
        };
        return colors[rolNombre?.toLowerCase()] || colors.default;
    };

    const getSucursalBadge = (usuario) => {
        if (usuario.roles?.nombre?.toLowerCase() === 'promotor') {
            const caja = usuario.caja || 'Sin caja';
            const sucursal = usuario.sucursales?.nombre || 'Sin sucursal';
            return (
                <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                        <CubeIcon className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Caja: {caja}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <BuildingOfficeIcon className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs text-emerald-700">{sucursal}</span>
                    </div>
                </div>
            );
        }

        if (!usuario.sucursales?.nombre || usuario.roles?.nombre?.toLowerCase() === 'administrador') {
            return (
                <div className="flex items-center justify-center space-x-1">
                    <EyeIcon className="h-3 w-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Todas las Sucursales</span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center space-x-1">
                <BuildingOfficeIcon className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">{usuario.sucursales.nombre}</span>
            </div>
        );
    };

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const statsVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: 0.1 }
        }
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 text-center"
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full"
                    />
                    <p className="text-emerald-700 font-medium">Cargando usuarios...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl border border-emerald-100 flex flex-col h-full"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
            {/* Encabezado del filtro - Parte fija */}
            <div className="flex-shrink-0">
                <AnimatePresence>
                    <motion.div
                        variants={statsVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-2 py-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    whileHover={{ rotate: 15 }}
                                    className="p-2 bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-lg"
                                >
                                    <UserCircleIcon className="h-5 w-5 text-amber-400" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-800">
                                        Mi Perfil
                                    </p>
                                    <p className="text-sm text-emerald-600">
                                        Visualizando información personal
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1 bg-white border border-emerald-200 rounded-lg shadow-sm"
                            >
                                <span className="text-sm font-semibold text-emerald-700">
                                    1 usuario
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Encabezados de tabla - Parte fija */}
                <div className="bg-emerald-50 border-b border-emerald-100">
                    <table className="min-w-full table-fixed">
                        <thead>
                            <tr>
                                {[
                                    { name: 'Usuario', icon: UserCircleIcon, width: 'w-1/5' },
                                    { name: 'Rol', icon: ShieldCheckIcon, width: 'w-1/6' },
                                    { name: 'Caja/Sucursal', icon: BuildingOfficeIcon, width: 'w-1/5' },
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
                                            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
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

            {/* Cuerpo de la tabla con scroll */}
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full table-fixed">
                    <motion.tbody
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.05
                                }
                            }
                        }}
                        className="bg-white"
                    >
                        <AnimatePresence>
                            {usuariosFiltrados.map((usuario) => (
                                <motion.tr
                                    key={usuario.id}
                                    variants={rowVariants}
                                    layout
                                    whileHover={{
                                        backgroundColor: "rgba(236, 253, 245, 0.8)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className="group border-b border-emerald-50 hover:bg-emerald-50/80 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 w-1/5">
                                        <div className="flex items-center space-x-2">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex-shrink-0"
                                            >
                                                <UserCircleIcon className="h-5 w-5 text-emerald-700" />
                                            </motion.div>
                                            <div className="text-left min-w-0">
                                                <div className="inline-block">
                                                    <p className="text-sm font-semibold text-emerald-900 text-center truncate">
                                                        {usuario.nombre}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rol */}
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

                                    {/* Caja/Sucursal */}
                                    <td className="px-6 py-4 w-1/5">
                                        {getSucursalBadge(usuario)}
                                    </td>

                                    {/* Fecha Modificación */}
                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex flex-col items-center space-y-1">
                                            <div className="flex items-center space-x-1">
                                                <CalendarIcon className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs font-medium text-emerald-800">
                                                    {formatFecha(usuario.updated_at)}
                                                </span>
                                            </div>
                                            {usuario.created_at !== usuario.updated_at && (
                                                <span className="text-xs text-emerald-500">
                                                    Creado: {formatFecha(usuario.created_at)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${usuario.activo
                                                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-rose-700 border border-red-200'
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
                                            </motion.div>
                                        </div>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 w-1/6">
                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.05,
                                                    x: 5,
                                                    backgroundColor: "rgba(251, 191, 36, 0.2)"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onEditarUsuario(usuario)}
                                                className="flex items-center space-x-2 px-4 py-2 text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all duration-200 font-semibold text-sm"
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

            {/* Footer de la tabla - Parte fija */}
            {usuariosFiltrados.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-t border-emerald-200 px-6 py-3 flex-shrink-0"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-emerald-700">
                                <span className="font-medium">1</span> usuario mostrado
                            </div>
                            <div className="h-4 w-px bg-emerald-300"></div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs text-emerald-700">
                                        {usuariosFiltrados.filter(u => u.activo).length} activo
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                    <span className="text-xs text-emerald-700">
                                        {usuariosFiltrados.filter(u => !u.activo).length} inactivo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}