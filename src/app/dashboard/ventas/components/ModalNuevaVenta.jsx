// src/app/dashboard/ventas/components/ModalNuevaVenta.jsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, ShoppingCart, Trash2, AlertCircle, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import ClienteSearch from './ClienteSearch';
import ComprobanteUpload from './ComprobanteUpload';

// Variantes de stagger para las cards de producto
const listVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, ease: 'easeOut' },
    },
};

const searchListVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
};

const PAGE_SIZE = 20;

export default function ModalNuevaVenta({
    abierto,
    onCerrar,
    onCrear,
    currentUser,
    currentSucursal,
}) {
    const [cliente, setCliente] = useState(null);
    const [tipoCliente, setTipoCliente] = useState('Cliente Final');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [comprobante, setComprobante] = useState(null);
    const [notaCabecera, setNotaCabecera] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [productos, setProductos] = useState([]);
    const [productosDestacados, setProductosDestacados] = useState([]);
    const [buscandoProductos, setBuscandoProductos] = useState(false);
    const [cargandoInicial, setCargandoInicial] = useState(false);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [hasMoreDestacados, setHasMoreDestacados] = useState(true);
    const [offsetDestacados, setOffsetDestacados] = useState(0);

    const [productoSel, setProductoSel] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [descuentoLinea, setDescuentoLinea] = useState('0');
    const [precioUnitario, setPrecioUnitario] = useState('0');
    const [carrito, setCarrito] = useState([]);
    const [creando, setCreando] = useState(false);

    const [rankingIds, setRankingIds] = useState([]);

    const listRef = useRef(null);
    const loadMoreRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // Reset al abrir
    useEffect(() => {
        if (!abierto) return;
        setCliente(null);
        setTipoCliente('Cliente Final');
        setMetodoPago('efectivo');
        setComprobante(null);
        setNotaCabecera('');
        setBusqueda('');
        setProductos([]);
        setProductoSel(null);
        setCantidad(1);
        setDescuentoLinea('0');
        setPrecioUnitario('0');
        setCarrito([]);
        setProductosDestacados([]);
        setOffsetDestacados(0);
        setHasMoreDestacados(true);
        setRankingIds([]);
    }, [abierto]);

    // Autocompletar tipo de cliente
    useEffect(() => {
        if (cliente?.tipo_cliente) setTipoCliente(cliente.tipo_cliente);
    }, [cliente?.id]);

    // Ranking más vendidos
    useEffect(() => {
        if (!abierto) return;
        let cancel = false;
        (async () => {
            try {
                const { data, error } = await supabase
                    .from('ventas')
                    .select('producto_id, cantidad')
                    .eq('estado', 'activa')
                    .limit(2000);
                if (error) throw error;
                const conteo = new Map();
                (data || []).forEach((v) => {
                    const id = v.producto_id;
                    conteo.set(id, (conteo.get(id) || 0) + (Number(v.cantidad) || 0));
                });
                const topIds = [...conteo.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([id]) => id);
                if (!cancel) setRankingIds(topIds);
            } catch (err) {
                console.error('Error cargando ranking:', err);
                if (!cancel) setRankingIds([]);
            }
        })();
        return () => { cancel = true; };
    }, [abierto]);

    const cargarDestacadosPagina = useCallback(async (offset) => {
        if (!abierto) return;
        const esPrimera = offset === 0;
        if (esPrimera) setCargandoInicial(true);
        else setCargandoMas(true);

        try {
            let ids = [];
            let pedirPorRanking = true;

            const rankingSlice = rankingIds.slice(offset, offset + PAGE_SIZE);
            if (rankingSlice.length > 0) {
                ids = rankingSlice;
            } else {
                pedirPorRanking = false;
            }

            if (pedirPorRanking) {
                const { data: prods, error } = await supabase
                    .from('productos')
                    .select(`
                        id, codigo, nombre, descripcion, precio, precio_mayorista, activo,
                        categoria_id,
                        categorias:categoria_id ( id, nombre )
                    `)
                    .eq('activo', true)
                    .in('id', ids);
                if (error) throw error;
                const mapProd = new Map((prods || []).map((p) => [p.id, p]));
                const ordenados = ids.map((id) => mapProd.get(id)).filter(Boolean);

                if (!mountedRef.current) return;
                setProductosDestacados((prev) => esPrimera ? ordenados : [...prev, ...ordenados]);
                setOffsetDestacados(offset + PAGE_SIZE);
                setHasMoreDestacados(true);
                return;
            }

            const offsetFallback = Math.max(0, offset - rankingIds.length);
            const { data: relleno, error: rellErr } = await supabase
                .from('productos')
                .select(`
                    id, codigo, nombre, descripcion, precio, precio_mayorista, activo,
                    categoria_id,
                    categorias:categoria_id ( id, nombre )
                `)
                .eq('activo', true)
                .order('nombre', { ascending: true })
                .range(offsetFallback, offsetFallback + PAGE_SIZE - 1);

            if (rellErr) throw rellErr;

            const mostradosIds = new Set(productosDestacados.map((p) => p.id));
            const filtrados = (relleno || []).filter((p) => !mostradosIds.has(p.id));

            if (!mountedRef.current) return;
            setProductosDestacados((prev) => esPrimera ? filtrados : [...prev, ...filtrados]);
            setOffsetDestacados(offset + PAGE_SIZE);
            setHasMoreDestacados((relleno || []).length === PAGE_SIZE);
        } catch (err) {
            console.error('Error cargando destacados:', err);
            setHasMoreDestacados(false);
        } finally {
            if (mountedRef.current) {
                setCargandoInicial(false);
                setCargandoMas(false);
            }
        }
    }, [abierto, rankingIds, productosDestacados]);

    useEffect(() => {
        if (!abierto) return;
        if (cargandoInicial || cargandoMas) return;
        if (productosDestacados.length > 0) return;
        cargarDestacadosPagina(0);
    }, [abierto, rankingIds, cargarDestacadosPagina, productosDestacados.length, cargandoInicial, cargandoMas]);

    useEffect(() => {
        if (!loadMoreRef.current) return;
        if (!abierto) return;
        if (busqueda.trim()) return;
        if (!hasMoreDestacados) return;
        if (cargandoInicial || cargandoMas) return;

        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    cargarDestacadosPagina(offsetDestacados);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );
        obs.observe(loadMoreRef.current);
        return () => obs.disconnect();
    }, [abierto, busqueda, hasMoreDestacados, cargandoInicial, cargandoMas, offsetDestacados, cargarDestacadosPagina]);

    // Búsqueda
    useEffect(() => {
        if (!abierto) return;
        if (!busqueda.trim()) { setProductos([]); return; }
        let cancel = false;
        const t = setTimeout(async () => {
            setBuscandoProductos(true);
            try {
                const q = `%${busqueda.trim()}%`;
                const { data, error } = await supabase
                    .from('productos')
                    .select(`
                        id, codigo, nombre, descripcion, precio, precio_mayorista, activo,
                        categoria_id,
                        categorias:categoria_id ( id, nombre )
                    `)
                    .eq('activo', true)
                    .or(`codigo.ilike.${q},nombre.ilike.${q}`)
                    .limit(30);
                if (error) throw error;
                if (!cancel) setProductos(data || []);
            } catch (err) {
                console.error('Error buscando productos:', err);
            } finally {
                if (!cancel) setBuscandoProductos(false);
            }
        }, 300);
        return () => { cancel = true; clearTimeout(t); };
    }, [busqueda, abierto]);

    const handleSeleccionarProducto = (p) => {
        setProductoSel(p);
        setCantidad(1);
        setDescuentoLinea('0');
        const esMayorista = tipoCliente === 'Mayorista';
        const precioSugerido = esMayorista && p.precio_mayorista != null
            ? Number(p.precio_mayorista)
            : Number(p.precio);
        setPrecioUnitario(String(precioSugerido));
    };

    useEffect(() => {
        if (!productoSel) return;
        const esMayorista = tipoCliente === 'Mayorista';
        const precioSugerido = esMayorista && productoSel.precio_mayorista != null
            ? Number(productoSel.precio_mayorista)
            : Number(productoSel.precio);
        setPrecioUnitario(String(precioSugerido));
    }, [tipoCliente, productoSel?.id]);

    const cantidadNum = Number(cantidad) || 0;
    const precioNum = Number(precioUnitario) || 0;
    const descuentoNum = Number(descuentoLinea) || 0;
    const brutoLinea = +(cantidadNum * precioNum).toFixed(2);
    const totalLinea = +(brutoLinea - descuentoNum).toFixed(2);

    const agregarAlCarrito = () => {
        if (!productoSel) return;
        if (cantidadNum <= 0) { toast.error('Cantidad inválida'); return; }
        if (precioNum < 0) { toast.error('Precio inválido'); return; }
        if (totalLinea < 0) { toast.error('El descuento supera el monto bruto'); return; }

        setCarrito((prev) => [
            ...prev,
            {
                tmpId: `${Date.now()}-${Math.random()}`,
                producto_id: productoSel.id,
                codigo_producto: productoSel.codigo,
                nombre_producto: productoSel.nombre,
                descripcion_producto: productoSel.descripcion,
                categoria_id: productoSel.categoria_id ?? null,
                categoria_nombre: productoSel.categorias?.nombre ?? null,
                cantidad: cantidadNum,
                precio_unitario: precioNum,
                descuento_venta: descuentoNum,
                monto_bruto: brutoLinea,
                monto_total: totalLinea,
            },
        ]);
        setProductoSel(null);
        setBusqueda('');
        setProductos([]);
        setCantidad(1);
        setDescuentoLinea('0');
        setPrecioUnitario('0');
    };

    const quitarDelCarrito = (tmpId) => {
        setCarrito((prev) => prev.filter((x) => x.tmpId !== tmpId));
    };

    const totales = useMemo(() => {
        const bruto = carrito.reduce((a, x) => a + x.monto_bruto, 0);
        const desc = carrito.reduce((a, x) => a + x.descuento_venta, 0);
        return { bruto: +bruto.toFixed(2), desc: +desc.toFixed(2), total: +(bruto - desc).toFixed(2) };
    }, [carrito]);

    const handleConfirmar = async () => {
        if (!cliente) { toast.error('Seleccioná un cliente'); return; }
        if (carrito.length === 0) { toast.error('Agregá al menos un producto'); return; }
        if (!comprobante?.url) { toast.error('Debés subir el comprobante'); return; }

        setCreando(true);
        try {
            const res = await onCrear({
                cliente,
                items: carrito,
                tipoCliente,
                metodoPago,
                comprobanteUrl: comprobante.url,
                notaCabecera: notaCabecera.trim() || null,
            });
            if (res?.success !== false) {
                toast.success('Venta registrada');
                onCerrar();
            }
        } finally {
            setCreando(false);
        }
    };

    const mostrandoDestacados = !busqueda.trim();
    const listaAMostrar = mostrandoDestacados ? productosDestacados : productos;
    const cargandoListaInicial = mostrandoDestacados ? cargandoInicial : buscandoProductos;
    const cargandoListaMas = mostrandoDestacados ? cargandoMas : false;
    const hayMas = mostrandoDestacados ? hasMoreDestacados : false;

    const getRankingPos = (id) => {
        const idx = rankingIds.indexOf(id);
        return idx >= 0 ? idx + 1 : null;
    };

    if (!abierto) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.97, y: 8 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.97, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-emerald-200"
                >
                    {/* Header emerald */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-200 bg-emerald-50">
                        <div>
                            <h2 className="text-lg font-bold text-emerald-900">Nueva venta</h2>
                            <p className="text-xs text-emerald-700">
                                {currentSucursal?.nombre || 'Sin sucursal'} · {currentUser?.nombre || '—'}
                            </p>
                        </div>
                        <button
                            onClick={onCerrar}
                            className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body: 2 paneles */}
                    <div className="flex flex-1 min-h-0">
                        {/* Panel izquierdo */}
                        <div className="w-1/2 border-r border-emerald-100 flex flex-col min-h-0">
                            <div className="p-3 space-y-2 border-b border-emerald-100">
                                <ClienteSearch value={cliente} onChange={setCliente} autoFocus />

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[11px] font-medium text-emerald-900 block mb-0.5">Tipo cliente</label>
                                        <select
                                            value={tipoCliente}
                                            onChange={(e) => setTipoCliente(e.target.value)}
                                            className="w-full text-sm text-gray-900 border border-emerald-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                        >
                                            <option>Cliente Final</option>
                                            <option>Mayorista</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-emerald-900 block mb-0.5">Método pago</label>
                                        <select
                                            value={metodoPago}
                                            onChange={(e) => setMetodoPago(e.target.value)}
                                            className="w-full text-sm text-gray-900 border border-emerald-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder="Buscar producto por código o nombre..."
                                        className="w-full text-sm text-gray-900 placeholder-emerald-400 border border-emerald-300 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                    />
                                    {buscandoProductos && (
                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                            </div>

                            {/* Lista de productos o form de selección */}
                            <div ref={listRef} className="flex-1 overflow-y-auto p-2">
                                {productoSel ? (
                                    <div className="space-y-2 bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{productoSel.nombre}</p>
                                                <p className="text-xs text-emerald-700">{productoSel.codigo} · {productoSel.categorias?.nombre}</p>
                                            </div>
                                            <button
                                                onClick={() => setProductoSel(null)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[11px] text-emerald-900 block">Cantidad</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={cantidad}
                                                    onChange={(e) => setCantidad(e.target.value)}
                                                    className="w-full text-sm text-gray-900 border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] text-emerald-900 block">Precio unit. (Bs.)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={precioUnitario}
                                                    onChange={(e) => setPrecioUnitario(e.target.value)}
                                                    className="w-full text-sm text-gray-900 border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] text-emerald-900 block">Descuento línea (Bs.)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={descuentoLinea}
                                                    onChange={(e) => setDescuentoLinea(e.target.value)}
                                                    className="w-full text-sm text-gray-900 border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-xs text-emerald-800">
                                            <span>Bruto: <b className="text-gray-900">Bs. {brutoLinea.toFixed(2)}</b></span>
                                            <span>Total línea: <b className="text-emerald-700">Bs. {totalLinea.toFixed(2)}</b></span>
                                        </div>

                                        <button
                                            onClick={agregarAlCarrito}
                                            className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-semibold rounded py-1.5 transition-colors"
                                        >
                                            Agregar al carrito
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between px-1 pb-1.5">
                                            {mostrandoDestacados ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                                                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                                                    Más vendidos
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                                                    Resultados
                                                </span>
                                            )}
                                            {cargandoListaInicial && (
                                                <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                                            )}
                                        </div>

                                        {cargandoListaInicial && listaAMostrar.length === 0 ? (
                                            <div className="space-y-1">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div
                                                        key={`sk-${i}`}
                                                        className="p-2 border border-emerald-100 rounded bg-emerald-50 animate-pulse"
                                                    >
                                                        <div className="h-3.5 w-3/4 bg-emerald-100 rounded mb-1.5" />
                                                        <div className="flex justify-between">
                                                            <div className="h-3 w-1/3 bg-emerald-100 rounded" />
                                                            <div className="h-3 w-16 bg-emerald-100 rounded" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : listaAMostrar.length === 0 ? (
                                            <div className="text-center text-sm text-emerald-700 py-8">
                                                {busqueda.trim() ? 'Sin resultados' : 'No hay productos disponibles'}
                                            </div>
                                        ) : (
                                            <motion.div
                                                className="space-y-1"
                                                variants={mostrandoDestacados ? listVariants : searchListVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                {listaAMostrar.map((p, idx) => {
                                                    const rankPos = mostrandoDestacados ? getRankingPos(p.id) : null;
                                                    return (
                                                        <motion.button
                                                            key={p.id}
                                                            variants={itemVariants}
                                                            onClick={() => handleSeleccionarProducto(p)}
                                                            className="w-full text-left p-2 border border-gray-200 rounded hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {rankPos && (
                                                                            <span className="inline-block mr-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                                                                                #{rankPos}
                                                                            </span>
                                                                        )}
                                                                        {p.nombre}
                                                                    </p>
                                                                    <div className="flex justify-between text-xs text-gray-600">
                                                                        <span>{p.codigo} · {p.categorias?.nombre}</span>
                                                                        <span className="text-emerald-700 font-semibold">
                                                                            Bs. {Number(p.precio).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}

                                        {mostrandoDestacados && hayMas && (
                                            <div ref={loadMoreRef} className="py-3 flex justify-center">
                                                {cargandoListaMas ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Cargando más...
                                                    </span>
                                                ) : (
                                                    <div className="h-6" />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Panel derecho: carrito */}
                        <div className="w-1/2 flex flex-col min-h-0">
                            <div className="px-3 py-2 border-b border-emerald-100">
                                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                                    Carrito ({carrito.length})
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                                {carrito.length === 0 ? (
                                    <div className="text-center text-sm text-emerald-700 py-8">
                                        Sin productos aún
                                    </div>
                                ) : (
                                    carrito.map((it) => (
                                        <div key={it.tmpId} className="border border-emerald-100 rounded p-2 bg-white">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{it.nombre_producto}</p>
                                                    <p className="text-xs text-emerald-700">{it.codigo_producto}</p>
                                                </div>
                                                <button
                                                    onClick={() => quitarDelCarrito(it.tmpId)}
                                                    className="text-red-500 hover:text-red-700 shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-700 mt-1">
                                                <span>{it.cantidad} × Bs. {it.precio_unitario.toFixed(2)}</span>
                                                <span>
                                                    {it.descuento_venta > 0 && (
                                                        <span className="text-amber-600 mr-1">-{it.descuento_venta.toFixed(2)}</span>
                                                    )}
                                                    <b className="text-emerald-700">Bs. {it.monto_total.toFixed(2)}</b>
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-emerald-100 p-3 space-y-2 bg-emerald-50/40">
                                <div>
                                    <label className="text-[11px] font-medium text-emerald-900 block mb-0.5">
                                        Comprobante <span className="text-red-500">*</span>
                                    </label>
                                    <ComprobanteUpload value={comprobante} onChange={setComprobante} />
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-emerald-900 block mb-0.5">
                                        Nota de la venta (opcional)
                                    </label>
                                    <textarea
                                        value={notaCabecera}
                                        onChange={(e) => setNotaCabecera(e.target.value)}
                                        rows={2}
                                        className="w-full text-sm text-gray-900 placeholder-emerald-400 border border-emerald-300 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                                        placeholder="Observaciones generales de la venta..."
                                    />
                                </div>

                                <div className="border-t border-emerald-200 pt-2 space-y-0.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-emerald-800">Subtotal</span>
                                        <span className="font-medium text-gray-900">Bs. {totales.bruto.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-800">Descuentos</span>
                                        <span className="font-medium text-amber-600">- Bs. {totales.desc.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold pt-1 border-t border-emerald-200">
                                        <span className="text-emerald-900">Total</span>
                                        <span className="text-emerald-700">Bs. {totales.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {!comprobante?.url && carrito.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        Subí el comprobante para confirmar
                                    </div>
                                )}

                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={onCerrar}
                                        className="flex-1 text-sm py-2 rounded border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmar}
                                        disabled={
                                            creando ||
                                            !cliente ||
                                            carrito.length === 0 ||
                                            !comprobante?.url
                                        }
                                        className="flex-[2] text-sm py-2 rounded bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        {creando ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                        ) : (
                                            `Confirmar venta (${carrito.length})`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}