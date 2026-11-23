// src/app/dashboard/ventas/components/FiltrosVentas.jsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Filter, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';

const inputClass =
    'px-2.5 py-1.5 bg-emerald-800 border border-emerald-700 rounded-lg text-xs text-emerald-50 placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors';

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function rangoMesUTC(anio, mesIdx) {
    const inicio = new Date(Date.UTC(anio, mesIdx, 1, 4, 0, 0, 0));
    const fin = new Date(Date.UTC(anio, mesIdx + 1, 1, 3, 59, 59, 999));
    return {
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
    };
}

export default function FiltrosVentas({
    filtros,
    setFiltros,
    resetFiltros,
    onExportar,
    totales,
}) {
    const [categorias, setCategorias] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [exportando, setExportando] = useState(false);

    const [mesActual, setMesActual] = useState(() => {
        const hoy = new Date();
        return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
    });

    useEffect(() => {
        (async () => {
            const [{ data: cats }, { data: users }] = await Promise.all([
                supabase.from('categorias').select('id, nombre').eq('activo', true).order('nombre'),
                supabase.from('usuarios').select('id, nombre, activo').eq('activo', true).order('nombre'),
            ]);
            setCategorias(cats || []);
            setVendedores(users || []);
        })();
    }, []);

    useEffect(() => {
        if (filtros.fechaInicio) {
            const d = new Date(filtros.fechaInicio);
            setMesActual({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Solo notifica al padre. El estado local lo maneja el caller.
    const aplicarMes = (anio, mesIdx) => {
        const rango = rangoMesUTC(anio, mesIdx);
        setFiltros({ ...rango });
    };

    // ✅ Fuera del updater: no hay setState del padre dentro de un updater
    const irMesAnterior = () => {
        const nuevo = mesActual.mes === 0
            ? { anio: mesActual.anio - 1, mes: 11 }
            : { anio: mesActual.anio, mes: mesActual.mes - 1 };
        setMesActual(nuevo);
        aplicarMes(nuevo.anio, nuevo.mes);
    };

    const irMesSiguiente = () => {
        const nuevo = mesActual.mes === 11
            ? { anio: mesActual.anio + 1, mes: 0 }
            : { anio: mesActual.anio, mes: mesActual.mes + 1 };
        setMesActual(nuevo);
        aplicarMes(nuevo.anio, nuevo.mes);
    };

    const esMesActual = (() => {
        const hoy = new Date();
        return mesActual.anio === hoy.getFullYear() && mesActual.mes === hoy.getMonth();
    })();

    // ...resto igual (hayFiltros, mostrarSoloActivas, toggleActivas, onExportarClick, JSX)

    const hayFiltros = useMemo(() => {
        return !!(
            filtros.texto ||
            filtros.categoriaId ||
            filtros.vendedorId ||
            filtros.clienteId ||
            filtros.tipoCliente ||
            filtros.metodoPago ||
            filtros.depositado ||
            filtros.estado !== 'activa'
        );
    }, [filtros]);

    const mostrarSoloActivas = filtros.estado === 'activa';
    const toggleActivas = () => {
        setFiltros({ estado: mostrarSoloActivas ? '' : 'activa' });
    };

    const onExportarClick = async () => {
        try {
            setExportando(true);
            const data = await onExportar();
            if (!data?.length) {
                toast.error('No hay ventas para exportar con los filtros actuales');
                return;
            }
            const filas = data.map((v, i) => ({
                'N°': i + 1,
                'Fecha': new Date(v.fecha_venta).toLocaleString('es-BO'),
                'Código prod.': v.codigo_producto,
                'Producto': v.nombre_producto,
                'Categoría': v.categoria_nombre || '',
                'Cantidad': v.cantidad,
                'Precio unit.': Number(v.precio_unitario).toFixed(2),
                'Bruto': Number(v.monto_bruto).toFixed(2),
                'Descuento': Number(v.descuento_venta).toFixed(2),
                'Total': Number(v.monto_total).toFixed(2),
                'Cliente': v.nombre_cliente,
                'Código cliente': v.codigo_cliente || '',
                'Tipo': v.tipo_cliente,
                'Método': v.metodo_pago,
                'Depositado': v.depositado ? 'Sí' : 'No',
                'Estado': v.estado,
                'Motivo anulación': v.motivo_anulacion || '',
                'Nota': v.nota_individual || '',
                'Comprobante': v.comprobante_url || '',
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(filas);
            ws['!cols'] = [
                { wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 30 }, { wch: 15 },
                { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
                { wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
                { wch: 10 }, { wch: 25 }, { wch: 30 }, { wch: 40 },
            ];
            XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
            const hoy = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `Ventas_${hoy}.xlsx`);
            toast.success('Excel descargado');
        } catch (err) {
            console.error(err);
            toast.error('Error al exportar: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900 p-2 sm:p-3 rounded-xl shadow-md border border-emerald-800 border-l-4 border-l-amber-400"
        >
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-emerald-300">Filtros</span>
                </div>

                {/* ===== Selector de mes tipo ‹ mes › ===== */}
                <div className="flex items-center gap-1 bg-emerald-800 border border-emerald-700 rounded-lg px-1">
                    <button
                        onClick={irMesAnterior}
                        className="p-1 text-emerald-400 hover:text-emerald-50 hover:bg-emerald-700 rounded transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-emerald-50 capitalize min-w-[110px] text-center select-none">
                        {MESES[mesActual.mes]} {mesActual.anio}
                    </span>
                    <button
                        onClick={irMesSiguiente}
                        disabled={esMesActual}
                        className="p-1 text-emerald-400 hover:text-emerald-50 hover:bg-emerald-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* ===== Buscador ===== */}
                <input
                    type="text"
                    placeholder="Producto / cliente..."
                    value={filtros.texto}
                    onChange={(e) => setFiltros({ texto: e.target.value })}
                    className={`${inputClass} w-44`}
                />

                <select
                    value={filtros.categoriaId}
                    onChange={(e) => setFiltros({ categoriaId: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Categorías</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>

                <select
                    value={filtros.vendedorId}
                    onChange={(e) => setFiltros({ vendedorId: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Vendedores</option>
                    {vendedores.map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                </select>

                <select
                    value={filtros.tipoCliente}
                    onChange={(e) => setFiltros({ tipoCliente: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Tipo cliente</option>
                    <option value="Cliente Final">Cliente Final</option>
                    <option value="Mayorista">Mayorista</option>
                </select>

                {/* <select
                    value={filtros.metodoPago}
                    onChange={(e) => setFiltros({ metodoPago: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Método pago</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                </select> */}

                <select
                    value={filtros.depositado}
                    onChange={(e) => setFiltros({ depositado: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Depósito (todos)</option>
                    <option value="true">Depositado</option>
                    <option value="false">No depositado</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                    {hayFiltros && (
                        <button
                            onClick={resetFiltros}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-950 border border-red-800 text-red-300 rounded-lg hover:bg-red-900 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Limpiar
                        </button>
                    )}
                    <button
                        onClick={onExportarClick}
                        disabled={exportando}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-700 border border-emerald-600 text-emerald-50 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                        {exportando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Exportar
                    </button>

                    {/* ===== Switch: Mostrar activas (por defecto ON) ===== */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none pl-2 border-l border-emerald-700">
                        <input
                            type="checkbox"
                            checked={mostrarSoloActivas}
                            onChange={toggleActivas}
                            className="sr-only"
                        />
                        <div
                            className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${mostrarSoloActivas ? 'bg-amber-400' : 'bg-emerald-700'
                                }`}
                        >
                            <div
                                className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${mostrarSoloActivas ? 'translate-x-4' : ''
                                    }`}
                            />
                        </div>
                        <span className="text-xs text-emerald-200">
                            {mostrarSoloActivas ? 'Solo activas' : 'Todas'}
                        </span>
                    </label>
                </div>
            </div>

            {totales && (
                <div className="mt-2 pt-2 border-t border-emerald-700 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-emerald-300">
                    <span>Mostrando: <b className="text-amber-400">{totales.count}</b> ventas</span>
                    <span>Activas: <b className="text-emerald-200">{totales.countActivas}</b></span>
                    <span>Anuladas: <b className="text-red-400">{totales.countAnuladas}</b></span>
                    <span>Total activas: <b className="text-amber-300">Bs. {totales.montoTotal.toFixed(2)}</b></span>
                    <span>Depositado: <b className="text-emerald-200">Bs. {totales.depositado.toFixed(2)}</b></span>
                    <span>Pendiente: <b className="text-amber-400">Bs. {totales.noDepositado.toFixed(2)}</b></span>
                </div>
            )}
        </motion.div>
    );
}