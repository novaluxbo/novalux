// src/app/dashboard/ventas/components/TablaVentas.jsx
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ComprobanteUpload from './ComprobanteUpload';
import { useVentaVoucher } from '../hooks/useVentaVoucher';
import VoucherModal from './VoucherModal';
import NotaInput from './NotaInput';

const MOTIVOS_RAPIDOS = [
    'Error en el monto',
    'Pedido duplicado',
    'Solicitud del cliente',
    'Producto no disponible',
];

export default function TablaVentas({
    ventas,
    loading,
    loadingMore,
    hasMore,
    onCargarMas,
    rolNombre,
    onAnular,
    onMarcarDepositado,
    anulando,
    actualizandoDeposito,
}) {
    const { actualizarVoucher } = useVentaVoucher();
    const [voucherAbierto, setVoucherAbierto] = useState(null);
    const loadMoreRef = useRef(null);

    // Estado anulación
    const [ventaAAnular, setVentaAAnular] = useState(null);
    const [motivoRapido, setMotivoRapido] = useState(null);
    const [motivoDetalle, setMotivoDetalle] = useState('');
    const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

    // Infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loadingMore) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onCargarMas?.();
            },
            { threshold: 0.1, rootMargin: '200px' }
        );
        obs.observe(loadMoreRef.current);
        return () => obs.disconnect();
    }, [hasMore, loadingMore, onCargarMas]);

    const handleVoucherChange = useCallback(async (ventaId, nuevo) => {
        if (!nuevo?.url) return;
        const res = await actualizarVoucher(ventaId, nuevo.url);
        if (res.success) toast.success('Comprobante actualizado');
        else toast.error(res.error || 'Error al actualizar');
    }, [actualizarVoucher]);

    const abrirModalAnulacion = (venta) => {
        setVentaAAnular(venta);
        setMotivoRapido(null);
        setMotivoDetalle('');
    };

    const confirmarAnulacion = async () => {
        const motivo = motivoRapido || motivoDetalle.trim();
        if (!motivo) { toast.error('Ingresá un motivo'); return; }
        setProcesandoAnulacion(true);
        try {
            const res = await onAnular(ventaAAnular.id, motivo);
            if (res?.success !== false) {
                toast.success('Venta anulada');
                setVentaAAnular(null);
            }
        } finally {
            setProcesandoAnulacion(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-emerald-200 border-l-4 border-l-amber-400 min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                <p className="text-sm text-emerald-800">Cargando ventas...</p>
            </div>
        );
    }

    if (!ventas?.length) {
        return (
            <div className="bg-white rounded-xl border border-emerald-200 border-l-4 border-l-amber-400 min-h-[60vh] flex flex-col items-center justify-center px-4">
                <FileText className="w-10 h-10 text-emerald-300 mb-3" />
                <p className="text-sm text-emerald-800 font-medium">No hay ventas en este mes</p>
                <p className="text-xs text-emerald-600 text-center mt-1">
                    Probá navegar a otro mes o ajustar los filtros.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-emerald-200 border-l-4 border-l-amber-400 overflow-hidden">
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-emerald-100 text-xs">
                        <thead className="sticky top-0 bg-emerald-900 text-emerald-50 z-10">
                            <tr>
                                <th className="px-2 py-2 text-left font-medium">#</th>
                                <th className="px-2 py-2 text-left font-medium">Fecha</th>
                                <th className="px-2 py-2 text-left font-medium">Producto</th>
                                <th className="px-2 py-2 text-center font-medium">Cant.</th>
                                <th className="px-2 py-2 text-right font-medium">P. Unit.</th>
                                <th className="px-2 py-2 text-right font-medium">Desc.</th>
                                <th className="px-2 py-2 text-right font-medium">Total</th>
                                <th className="px-2 py-2 text-left font-medium">Cliente</th>
                                <th className="px-2 py-2 text-center font-medium">Tipo</th>
                                <th className="px-2 py-2 text-center font-medium">Método</th>
                                <th className="px-2 py-2 text-center font-medium">Comp.</th>
                                <th className="px-2 py-2 text-center font-medium">Depósito</th>
                                <th className="px-2 py-2 text-left font-medium">Nota</th>
                                <th className="px-2 py-2 text-center font-medium">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {ventas.map((v, i) => {
                                const esAnulada = v.estado === 'anulada';
                                return (
                                    <tr
                                        key={v.id}
                                        className={`hover:bg-emerald-50/60 transition-colors ${esAnulada ? 'bg-red-50/60' : ''}`}
                                    >
                                        <td className="px-2 py-1.5 text-emerald-700">{i + 1}</td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {new Date(v.fecha_venta).toLocaleDateString('es-BO')}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {new Date(v.fecha_venta).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 max-w-[180px]">
                                            <div className="font-medium text-gray-900 truncate">{v.nombre_producto}</div>
                                            <div className="text-[10px] text-emerald-700">
                                                {v.codigo_producto} · {v.categoria_nombre || '—'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 text-center font-semibold text-gray-900">{v.cantidad}</td>
                                        <td className="px-2 py-1.5 text-right text-gray-800">Bs. {Number(v.precio_unitario).toFixed(2)}</td>
                                        <td className="px-2 py-1.5 text-right text-amber-600">
                                            {Number(v.descuento_venta) > 0 ? `- ${Number(v.descuento_venta).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-bold text-emerald-700">
                                            Bs. {Number(v.monto_total).toFixed(2)}
                                        </td>
                                        <td className="px-2 py-1.5 max-w-[160px]">
                                            <div className="font-medium text-gray-900 truncate">{v.nombre_cliente}</div>
                                            <div className="text-[10px] text-gray-500">{v.codigo_cliente || '—'}</div>
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${v.tipo_cliente === 'Mayorista' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {v.tipo_cliente}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${v.metodo_pago === 'efectivo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {v.metodo_pago}
                                            </span>
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {v.comprobante_url ? (
                                                    <button
                                                        onClick={() => setVoucherAbierto(v.comprobante_url)}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        Ver
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                                <ComprobanteUpload
                                                    compact
                                                    value={null}
                                                    onChange={(nuevo) => handleVoucherChange(v.id, nuevo)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            {rolNombre === 'admin' ? (
                                                <input
                                                    type="checkbox"
                                                    checked={!!v.depositado}
                                                    disabled={esAnulada || actualizandoDeposito === v.id}
                                                    onChange={async (e) => {
                                                        const res = await onMarcarDepositado(v.id, e.target.checked);
                                                        if (res?.success === false) toast.error(res.error || 'Error');
                                                    }}
                                                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                                />
                                            ) : (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${v.depositado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {v.depositado ? 'Sí' : 'No'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {/* ✅ NotaInput totalmente aislado:
                                                - no recibe `valor` desde el padre
                                                - mantiene su propio estado interno
                                                - hace su propio UPDATE a Supabase
                                                - no re-renderiza la tabla al tipear
                                            */}
                                            <NotaInput
                                                ventaId={v.id}
                                                initialValue={v.nota_individual || ''}
                                                disabled={esAnulada}
                                            />
                                        </td>
                                        <td className="px-2 py-1.5 text-center">
                                            {esAnulada ? (
                                                <div className="text-[10px]">
                                                    <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Anulada</span>
                                                    {v.motivo_anulacion && (
                                                        <div className="text-[10px] text-red-600 mt-0.5 max-w-[120px] truncate">
                                                            {v.motivo_anulacion}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => abrirModalAnulacion(v)}
                                                    disabled={anulando === v.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white disabled:opacity-40 transition-colors"
                                                >
                                                    {anulando === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                                    Anular
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div ref={loadMoreRef} className="py-3 text-center">
                        {loadingMore ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando más...
                            </span>
                        ) : (
                            <div className="h-6" />
                        )}
                    </div>
                )}
            </div>

            {/* Modal anulación */}
            <AnimatePresence>
                {ventaAAnular && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 8 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.94, y: 8 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-100 bg-emerald-50">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-900">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    Anular venta #{ventaAAnular.id}
                                </h3>
                                <button onClick={() => setVentaAAnular(null)} className="p-1 hover:bg-emerald-100 rounded-full text-emerald-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-700 mb-1.5">Motivo rápido</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {MOTIVOS_RAPIDOS.map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => {
                                                    const nuevo = motivoRapido === m ? null : m;
                                                    setMotivoRapido(nuevo);
                                                    if (nuevo) setMotivoDetalle('');
                                                }}
                                                className={`text-xs px-2 py-1.5 rounded border transition-colors ${motivoRapido === m ? 'border-red-500 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                        Detalle adicional {motivoRapido ? '(opcional)' : ''}
                                    </p>
                                    <textarea
                                        value={motivoDetalle}
                                        onChange={(e) => setMotivoDetalle(e.target.value)}
                                        rows={3}
                                        placeholder="Describí el motivo con más detalle..."
                                        className="w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 px-4 pb-4">
                                <button
                                    onClick={() => setVentaAAnular(null)}
                                    className="flex-1 text-sm py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarAnulacion}
                                    disabled={procesandoAnulacion || (!motivoRapido && motivoDetalle.trim().length < 3)}
                                    className="flex-[2] text-sm py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-40 inline-flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    {procesandoAnulacion ? <><Loader2 className="w-4 h-4 animate-spin" /> Anulando...</> : 'Anular venta'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <VoucherModal
                abierto={!!voucherAbierto}
                url={voucherAbierto}
                onCerrar={() => setVoucherAbierto(null)}
            />
        </>
    );
}