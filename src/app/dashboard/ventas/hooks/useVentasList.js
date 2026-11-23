// src/app/dashboard/ventas/hooks/useVentasList.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const PAGE_SIZE = 30;

const FILTROS_INICIALES = {
    fechaInicio: null,
    fechaFin: null,
    texto: '',
    categoriaId: '',
    vendedorId: '',
    clienteId: '',
    tipoCliente: '',
    metodoPago: '',
    estado: 'activa',
    depositado: '',
};

const SELECT_COLS = `
    id, fecha_venta, created_at, updated_at,
    cliente_id, codigo_cliente, nombre_cliente, tipo_cliente,
    producto_id, codigo_producto, nombre_producto, descripcion_producto,
    categoria_id, categoria_nombre,
    cantidad, precio_unitario, monto_bruto, descuento_venta, monto_total,
    vendedor_id, sucursal_id,
    metodo_pago, comprobante_url, depositado,
    nota_individual, estado,
    motivo_anulacion, fecha_anulacion, usuario_anulacion
`;

// Aplica filtros "blandos" en cliente. NO incluye fecha ni sucursal.
function cumpleFiltrosBlandos(v, filtros) {
    if (filtros.categoriaId && String(v.categoria_id) !== String(filtros.categoriaId)) return false;
    if (filtros.vendedorId && String(v.vendedor_id) !== String(filtros.vendedorId)) return false;
    if (filtros.clienteId && String(v.cliente_id) !== String(filtros.clienteId)) return false;
    if (filtros.tipoCliente && v.tipo_cliente !== filtros.tipoCliente) return false;
    if (filtros.metodoPago && v.metodo_pago !== filtros.metodoPago) return false;
    if (filtros.estado && v.estado !== filtros.estado) return false;
    if (filtros.depositado === 'true' && v.depositado !== true) return false;
    if (filtros.depositado === 'false' && v.depositado !== false) return false;
    if (filtros.texto) {
        const t = filtros.texto.trim().toLowerCase();
        const campos = [
            v.codigo_producto, v.nombre_producto,
            v.codigo_cliente, v.nombre_cliente,
        ].filter(Boolean).map((s) => String(s).toLowerCase());
        if (!campos.some((c) => c.includes(t))) return false;
    }
    return true;
}

export function useVentasList({ currentUser, currentSucursal } = {}) {
    // Ventas crudas que vinieron de la BD (ya paginadas por mes/sucursal)
    const [ventasRaw, setVentasRaw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [filtros, setFiltrosState] = useState(FILTROS_INICIALES);

    const lastIdRef = useRef(null);
    const requestIdRef = useRef(0);
    const channelRef = useRef(null);
    const fetchVentasRef = useRef(null);

    // ============================================================
    // Query SOLO por fecha + sucursal (lo único que requiere BD)
    // ============================================================
    const buildQuery = useCallback((desdeId = null, soloExportar = false) => {
        let q = supabase
            .from('ventas')
            .select(SELECT_COLS)
            .order('id', { ascending: false });

        if (!soloExportar) {
            q = q.limit(PAGE_SIZE);
            if (desdeId) q = q.lt('id', desdeId);
        } else {
            q = q.limit(5000);
        }

        if (filtros.fechaInicio) q = q.gte('fecha_venta', filtros.fechaInicio);
        if (filtros.fechaFin) q = q.lte('fecha_venta', filtros.fechaFin);
        if (currentSucursal?.id) q = q.eq('sucursal_id', currentSucursal.id);

        return q;
    }, [filtros.fechaInicio, filtros.fechaFin, currentSucursal?.id]);

    const fetchVentas = useCallback(async () => {
        const myReq = ++requestIdRef.current;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await buildQuery(null, false);
            if (err) throw err;
            if (myReq !== requestIdRef.current) return;
            setVentasRaw(data || []);
            lastIdRef.current = data?.[data.length - 1]?.id ?? null;
            setHasMore((data?.length || 0) === PAGE_SIZE);
        } catch (err) {
            if (myReq !== requestIdRef.current) return;
            setError(err.message || 'Error al cargar ventas');
            setVentasRaw([]);
        } finally {
            if (myReq === requestIdRef.current) setLoading(false);
        }
    }, [buildQuery]);

    useEffect(() => { fetchVentasRef.current = fetchVentas; }, [fetchVentas]);

    const cargarMas = useCallback(async () => {
        if (loadingMore || !hasMore || !lastIdRef.current) return;
        setLoadingMore(true);
        try {
            const { data, error: err } = await buildQuery(lastIdRef.current, false);
            if (err) throw err;
            if (data?.length) {
                setVentasRaw((prev) => [...prev, ...data]);
                lastIdRef.current = data[data.length - 1].id;
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError(err.message || 'Error al cargar más ventas');
        } finally {
            setLoadingMore(false);
        }
    }, [buildQuery, hasMore, loadingMore]);

    const exportarVentas = useCallback(async () => {
        const { data, error: err } = await buildQuery(null, true);
        if (err) throw err;
        // aplicar filtros blandos al export (mismo criterio que en pantalla)
        return (data || []).filter((v) => cumpleFiltrosBlandos(v, filtros));
    }, [buildQuery, filtros]);

    // ============================================================
    // Setter de filtros: NO fuerza refetch salvo cambio de fecha
    // ============================================================
    const setFiltros = useCallback((patch) => {
        setFiltrosState((prev) => {
            const next = { ...prev, ...patch };
            const cambioFecha =
                next.fechaInicio !== prev.fechaInicio ||
                next.fechaFin !== prev.fechaFin;
            if (cambioFecha) {
                // Forzar refetch solo cuando cambia el mes
                lastIdRef.current = null;
                setHasMore(true);
            }
            return next;
        });
    }, []);

    const resetFiltros = useCallback(() => {
        setFiltrosState(FILTROS_INICIALES);
        // No forzamos refetch: los datos ya cargados se re-filtran en cliente
    }, []);

    // ============================================================
    // Carga inicial: cuando cambian fecha o sucursal
    // ============================================================
    useEffect(() => {
        if (!currentUser?.id) return;
        fetchVentas();
    }, [fetchVentas, currentUser?.id]);

    // ============================================================
    // Helpers de mutación local
    // ============================================================
    const actualizarEnMemoria = useCallback((id, patch) => {
        setVentasRaw((prev) => {
            const idx = prev.findIndex((v) => v.id === id);
            if (idx === -1) return prev;
            const next = prev.slice();
            next[idx] = { ...prev[idx], ...patch };
            return next;
        });
    }, []);

    const agregarVentasEnMemoria = useCallback((nuevasVentas) => {
        if (!nuevasVentas?.length) return;
        setVentasRaw((prev) => {
            const idsExistentes = new Set(prev.map((v) => v.id));
            const filtradas = nuevasVentas.filter((v) => !idsExistentes.has(v.id));
            if (filtradas.length === 0) return prev;
            const combinadas = [...filtradas, ...prev];
            combinadas.sort((a, b) => b.id - a.id);
            return combinadas;
        });
    }, []);

    // ============================================================
    // Realtime: SOLO INSERT y DELETE
    // ============================================================
    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = supabase
            .channel('ventas-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ventas' },
                () => { /* silencioso */ }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'ventas' },
                (payload) => {
                    const id = payload.old?.id;
                    if (id) setVentasRaw((prev) => prev.filter((v) => v.id !== id));
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [currentUser?.id]);

    // ============================================================
    // ✅ ventas filtradas en cliente (lo que devuelve el hook)
    // ============================================================
    const ventas = useMemo(() => {
        return ventasRaw.filter((v) => cumpleFiltrosBlandos(v, filtros));
    }, [ventasRaw, filtros]);

    const totales = useMemo(() => {
        const activas = ventas.filter((v) => v.estado === 'activa');
        const anuladas = ventas.filter((v) => v.estado === 'anulada');
        const sum = (arr, key) =>
            arr.reduce((acc, v) => acc + parseFloat(v[key] || 0), 0);
        return {
            count: ventas.length,
            countActivas: activas.length,
            countAnuladas: anuladas.length,
            montoBruto: sum(activas, 'monto_bruto'),
            descuentos: sum(activas, 'descuento_venta'),
            montoTotal: sum(activas, 'monto_total'),
            depositado: sum(activas.filter(v => v.depositado), 'monto_total'),
            noDepositado: sum(activas.filter(v => !v.depositado), 'monto_total'),
        };
    }, [ventas]);

    return {
        ventas, loading, loadingMore, error, hasMore,
        filtros, setFiltros, resetFiltros,
        cargarMas, refrescar: fetchVentas, exportarVentas, totales,
        actualizarEnMemoria, agregarVentasEnMemoria,
    };
}