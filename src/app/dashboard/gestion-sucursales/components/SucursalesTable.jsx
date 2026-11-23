'use client';

import { motion, AnimatePresence } from 'framer-motion';
import LoadingState from '@/components/ui/LoadingState';

import {
    BuildingOfficeIcon,
    MapPinIcon,
    PhoneIcon,
    PencilIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function SucursalesTable({ sucursales, loading, onEditarSucursal, sucursalSeleccionada }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
    };

    if (loading) {
        return <LoadingState message="Cargando sucursales..." />;
    }

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl border border-emerald-200 overflow-hidden"
        >
            {/* Filtro */}
            <AnimatePresence>
                {sucursalSeleccionada && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-6 py-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    whileHover={{ rotate: 15 }}
                                    className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg"
                                >
                                    <FunnelIcon className="h-5 w-5 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-800">
                                        Sucursal activa
                                    </p>
                                    <p className="text-sm text-emerald-600">
                                        Mostrando: <span className="font-medium">{sucursalSeleccionada.nombre}</span>
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1 bg-white border border-emerald-200 rounded-lg shadow-sm"
                            >
                                <span className="text-sm font-semibold text-emerald-700">
                                    {sucursales.length} {sucursales.length === 1 ? 'sucursal' : 'sucursales'}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                    <thead className="bg-emerald-50 border-b border-emerald-200">
                        <tr>
                            <th className="px-6 py-4 w-[22%]">
                                <div className="flex items-center justify-center gap-2">
                                    <BuildingOfficeIcon className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Nombre</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 w-[25%]">
                                <div className="flex items-center justify-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Ubicación</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 w-[20%]">
                                <div className="flex items-center justify-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Contacto</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 w-[15%]">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Estado</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 w-[18%]">
                                <div className="flex items-center justify-center gap-2">
                                    <PencilIcon className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Acciones</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white divide-y divide-gray-100"
                    >
                        <AnimatePresence>
                            {sucursales.map((sucursal) => (
                                <motion.tr
                                    key={sucursal.id}
                                    variants={rowVariants}
                                    layout
                                    whileHover={{
                                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex-shrink-0"
                                            >
                                                <BuildingOfficeIcon className="h-5 w-5 text-emerald-700" />
                                            </motion.div>
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {sucursal.nombre}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-start space-x-2">
                                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 line-clamp-2">
                                                {sucursal.direccion || (
                                                    <span className="text-gray-400 italic">Sin dirección</span>
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">
                                                {sucursal.telefono || (
                                                    <span className="text-gray-400 italic">Sin teléfono</span>
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${sucursal.activo
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                {sucursal.activo ? (
                                                    <>
                                                        <CheckCircleIcon className="h-3 w-3 mr-1.5 text-emerald-500 flex-shrink-0" />
                                                        Activa
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircleIcon className="h-3 w-3 mr-1.5 text-rose-500 flex-shrink-0" />
                                                        Inactiva
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.05,
                                                    x: 5,
                                                    backgroundColor: "rgba(16, 185, 129, 0.1)"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onEditarSucursal(sucursal)}
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
                {sucursales.length === 0 && !loading && (
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
                                <BuildingOfficeIcon className="h-8 w-8 text-emerald-500" />
                            </motion.div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No hay sucursales registradas
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Comience agregando una nueva sucursal para organizar sus operaciones.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            {sucursales.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-t border-emerald-200 px-6 py-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">{sucursales.length}</span> sucursales en total
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-gray-600">
                                    {sucursales.filter(s => s.activo).length} activas
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-xs text-gray-600">
                                    {sucursales.filter(s => !s.activo).length} inactivas
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}