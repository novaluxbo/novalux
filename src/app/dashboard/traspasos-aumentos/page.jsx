// app/dashboard/control-traspasos/page.jsx
'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// ⚠️ CÓDIGO ORIGINAL COMENTADO — se retomará más adelante
// ============================================================
//
// import { useState, useEffect } from 'react';
// import Header from './components/Header';
// import TablaMovimientos from './components/TablaMovimientos';
// import ModalTraspaso from './components/ModalTraspaso';
// import ModalAgregarStock from './components/ModalAgregarStock';
// import { useTraspasos } from './hooks/useTraspasos';
// import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";
// import { supabase } from '@/lib/supabase/client';
//
// export default function ControlTraspasos() {
//     const [modalTraspasoAbierto, setModalTraspasoAbierto] = useState(false);
//     const [modalStockAbierto, setModalStockAbierto] = useState(false);
//     const [refreshTable, setRefreshTable] = useState(0);
//     const [sucursales, setSucursales] = useState([]);
//
//     const { values } = useMultiLocalStorageListener(["sucursalSeleccionada", "currentUser"]);
//     const { sucursalSeleccionada, currentUser } = values;
//
//     const {
//         aumentarStock,
//         traspasarMultiplesStocks,
//         traspasarStock,
//         loading
//     } = useTraspasos();
//
//     // Cargar lista de sucursales para el traspaso
//     useEffect(() => {
//         const cargarSucursales = async () => {
//             const { data, error } = await supabase
//                 .from('sucursales')
//                 .select('id, nombre')
//                 .eq('activo', true);
//
//             if (!error && data) {
//                 setSucursales(data);
//             }
//         };
//
//         cargarSucursales();
//     }, []);
//
//     const handleRecargar = () => {
//         setRefreshTable(prev => prev + 1);
//     };
//
//     const handleAgregarStock = async (datosStock) => {
//         const resultado = await aumentarStock({
//             ...datosStock,
//             usuarioId: currentUser?.id,
//             sucursalId: sucursalSeleccionada?.id
//         });
//
//         if (resultado.success) {
//             setModalStockAbierto(false);
//             handleRecargar();
//         }
//         return resultado;
//     };
//     const handleTraspaso = async ({ producto, cantidad, sucursalDestinoId, observaciones }) => {
//         if (!currentUser?.id) {
//             return { success: false, error: 'No hay usuario logueado' };
//         }
//
//         if (!sucursalSeleccionada?.id) {
//             return { success: false, error: 'No hay sucursal seleccionada' };
//         }
//
//         const result = await traspasarStock({
//             usuarioId: currentUser.id,
//             sucursalOrigenId: sucursalSeleccionada.id,
//             sucursalDestinoId,
//             producto,
//             cantidad,
//             observaciones
//         });
//
//         // 🔥 NUEVO: recargar tabla si el traspaso fue exitoso
//         if (result.success) {
//             handleRecargar();
//         }
//
//         return result;
//     };
//
//     const handleTraspasosMultiples = async (items) => {
//         if (!currentUser?.id) {
//             return { success: false, error: 'No hay usuario logueado' };
//         }
//
//         if (!sucursalSeleccionada?.id) {
//             return { success: false, error: 'No hay sucursal seleccionada' };
//         }
//
//         const result = await traspasarMultiplesStocks({
//             usuarioId: currentUser.id,
//             sucursalOrigenId: sucursalSeleccionada.id,
//             items
//         });
//
//         // 🔥 NUEVO: recargar tabla si el traspaso fue exitoso
//         if (result.success) {
//             handleRecargar();
//         }
//
//         return result;
//     };
//
//
//     return (
//         <div className="h-screen flex flex-col p-3 space-y-3 text-gray-800 overflow-hidden">
//             {/* ✅ Header fijo */}
//             <div className="flex-shrink-0">
//                 <Header
//                     onRealizarTraspaso={() => setModalTraspasoAbierto(true)}
//                     onAgregarStock={() => setModalStockAbierto(true)}
//                     onRecargar={handleRecargar}
//                     loading={loading}
//                     sucursalSeleccionada={sucursalSeleccionada}
//                 />
//             </div>
//
//             {/* ✅ Tabla con scroll */}
//             <div className="flex-1 overflow-y-auto min-h-0">
//                 <TablaMovimientos
//                     sucursalSeleccionada={sucursalSeleccionada}
//                     refreshTrigger={refreshTable}
//                 />
//             </div>
//
//             {modalStockAbierto && (
//                 <ModalAgregarStock
//                     abierto={modalStockAbierto}
//                     onCerrar={() => setModalStockAbierto(false)}
//                     onAgregarStock={handleAgregarStock}
//                     sucursalActual={sucursalSeleccionada}
//                     loading={loading}
//                 />
//             )}
//
//             {modalTraspasoAbierto && (
//                 <ModalTraspaso
//                     abierto={modalTraspasoAbierto}
//                     onCerrar={() => setModalTraspasoAbierto(false)}
//                     onTraspaso={handleTraspaso}
//                     onTraspasosMultiples={handleTraspasosMultiples}
//                     sucursalActual={sucursalSeleccionada}
//                     sucursales={sucursales}
//                     loading={loading}
//                     currentUser={currentUser}
//                 />
//             )}
//         </div>
//     );
// }

// ============================================================
// Vista temporal "en construcción"
// ============================================================
export default function ControlTraspasos() {
    return (
        <div className="min-h-screen bg-emerald-50/40 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-xl border border-emerald-200 border-l-4 border-l-amber-400 max-w-lg w-full overflow-hidden"
            >
                <div className="px-8 py-10 flex flex-col items-center text-center">
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

                    <motion.h1
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.25 }}
                        className="text-2xl font-bold text-emerald-900 mb-2"
                    >
                        Control de traspasos en construcción
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32, duration: 0.25 }}
                        className="text-sm text-emerald-700 leading-relaxed max-w-sm"
                    >
                        Estamos afinando el módulo de traspasos entre sucursales
                        y la gestión de stock. ¡Volvé pronto!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.4, duration: 0.35 }}
                        className="w-16 h-0.5 bg-amber-400 rounded-full my-6"
                    />

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