// src/app/dashboard/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getItem } from '@/lib/storage';
import { getBoliviaYearRangeUTC } from '@/utils/dateUtils';

const PAGE_SIZE = 1000;

const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isNetwork =
                error?.message?.includes('Failed to fetch') ||
                error?.name === 'TypeError' ||
                error?.name === 'AbortError';
            if (isNetwork && i < retries - 1) {
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
                continue;
            }
            throw error;
        }
    }
};

export const useDashboardData = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentSucursal, setCurrentSucursal] = useState(null);
    const [rawVentas, setRawVentas] = useState([]);
    const [rawProductos, setRawProductos] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const isMounted = useRef(true);
    const loadingRef = useRef(false);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    const getLocalStorageData = useCallback(() => {
        try {
            const user = getItem('currentUser');
            const sucursal = getItem('sucursalSeleccionada');
            const sucursalValida = sucursal && sucursal.id ? sucursal : null;
            setCurrentUser(user);
            setCurrentSucursal(sucursalValida);
            return { user, sucursal: sucursalValida };
        } catch (err) {
            console.error('Error leyendo storage:', err);
            return { user: null, sucursal: null };
        }
    }, []);

    const obtenerVentas = useCallback(async (sucursalId, signal) => {
        if (!sucursalId) return [];

        const rango = getBoliviaYearRangeUTC(new Date().getFullYear());
        if (!rango) throw new Error('No se pudo calcular el rango anual');

        let all = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
            const { data, error: supabaseError } = await supabase
                .from('ventas')
                .select(`
                id,
                fecha_venta,
                estado,
                cantidad,
                monto_total,
                producto_id,
                nombre_producto,
                categoria_id,
                categoria_nombre,
                cliente_id,
                nombre_cliente,
                tipo_cliente
            `)
                .eq('sucursal_id', sucursalId)
                .eq('estado', 'activa')
                .gte('fecha_venta', rango.inicio)
                .lte('fecha_venta', rango.fin)
                .order('fecha_venta', { ascending: false })
                .range(from, from + PAGE_SIZE - 1);
            // 👆 sin .abortSignal()

            if (signal?.aborted) return all;

            if (supabaseError) {
                console.error('obtenerVentas — supabaseError:', supabaseError);
                throw new Error(`Error al obtener ventas: ${supabaseError.message}`);
            }

            all = all.concat(data || []);
            hasMore = (data?.length || 0) === PAGE_SIZE;
            from += PAGE_SIZE;
        }

        return all;
    }, []);
    // ── Productos: paginado + join explícito, SIN abortSignal ──
    const obtenerProductos = useCallback(async (sucursalId, signal) => {
        if (!sucursalId) return [];

        let all = [];
        let from = 0;
        let hasMore = true;

        try {
            while (hasMore) {
                // 👇 Sin .abortSignal(). Cancelación la hacemos chequeando signal después.
                const { data, error: supabaseError } = await supabase
                    .from('productos_stock')
                    .select(`
                    stock_actual,
                    producto:producto_id!inner (
                        id,
                        nombre,
                        categoria_id,
                        activo,
                        categorias:categoria_id ( id, nombre )
                    )
                `)
                    .eq('sucursal_id', sucursalId)
                    .eq('producto.activo', true)
                    .range(from, from + PAGE_SIZE - 1);

                if (signal?.aborted) return all;

                if (supabaseError) {
                    console.error('obtenerProductos — supabaseError:', supabaseError);
                    // Fallback: reintentar SIN el filtro del join (filtramos en cliente)
                    const fallback = await supabase
                        .from('productos_stock')
                        .select(`
                        stock_actual,
                        producto:producto_id (
                            id,
                            nombre,
                            categoria_id,
                            activo,
                            categorias:categoria_id ( id, nombre )
                        )
                    `)
                        .eq('sucursal_id', sucursalId)
                        .range(from, from + PAGE_SIZE - 1);

                    if (fallback.error) throw fallback.error;

                    const batch = (fallback.data || []).filter(
                        item => item.producto && item.producto.activo === true
                    );
                    all = all.concat(batch);
                    hasMore = (fallback.data?.length || 0) === PAGE_SIZE;
                    from += PAGE_SIZE;
                    continue;
                }

                const batch = data || [];
                all = all.concat(batch);
                hasMore = batch.length === PAGE_SIZE;
                from += PAGE_SIZE;
            }

            return all
                .filter(item => item.producto)
                .map(item => ({
                    id: item.producto.id,
                    nombre: item.producto.nombre,
                    stock_actual: item.stock_actual,
                    categoria_id: item.producto.categoria_id,
                    categorias: item.producto.categorias,
                    es_valido: true,
                }));
        } catch (err) {
            // 👇 log útil: el objeto real, no "{}"
            console.error('Error en obtenerProductos:', {
                message: err?.message,
                details: err?.details,
                hint: err?.hint,
                code: err?.code,
                raw: err,
            });
            return [];
        }
    }, []);

    // ── Helpers de fecha ──
    const getCurrentMonth = useCallback(() => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[new Date().getMonth()];
    }, []);

    const getMonthNumber = useCallback((monthName) => {
        const meses = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
            'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
        };
        return meses[monthName] ?? new Date().getMonth();
    }, []);

    // Fallback: categorías desde la tabla maestra (si no hay productos)
    const obtenerCategoriasMaestro = useCallback(async (signal) => {
        try {
            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .select('id, nombre')
                .eq('activo', true)
                .order('nombre');

            if (signal?.aborted) return [];
            if (supabaseError) throw supabaseError;

            return (data || []).map(c => ({
                id: c.id,
                nombre: c.nombre,
                stock_actual: 0,
                categoria_id: c.id,
                categorias: { id: c.id, nombre: c.nombre },
                es_valido: true,
            }));
        } catch (err) {
            console.error('Error obteniendo categorías maestras:', err?.message || err);
            return [];
        }
    }, []);

    // ── Categorías ──
    const calcularVentasPorCategoria = useCallback((ventas, productos, monthName = null) => {
        if (!ventas.length) return [];

        const añoActual = new Date().getFullYear();
        let ventasFiltradas = ventas;

        if (monthName) {
            const mesNumero = getMonthNumber(monthName);
            const ahora = new Date();
            const añoRef = mesNumero > ahora.getMonth() ? añoActual - 1 : añoActual;
            ventasFiltradas = ventas.filter(v => {
                const f = new Date(v.fecha_venta);
                return f.getMonth() === mesNumero && f.getFullYear() === añoRef;
            });
        }

        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
        const categoriasMap = new Map();

        // 1) Inicializar con productos (incluye categorías sin ventas)
        productos.forEach(p => {
            const nombre = p.categorias?.nombre || 'Sin Categoría';
            const id = p.categorias?.id || 0;
            if (!categoriasMap.has(nombre)) {
                categoriasMap.set(nombre, {
                    id, name: nombre,
                    totalIngresos: 0, totalUnidades: 0, trend: 0,
                    color: colors[categoriasMap.size % colors.length],
                    topProduct: null, topProductSales: 0,
                    totalSalesCount: 0, totalProducts: 0,
                });
            }
            categoriasMap.get(nombre).totalProducts++;
        });

        // 2) Acumular ventas del período
        ventasFiltradas.forEach(v => {
            const nombre = v.categoria_nombre || 'Sin Categoría';
            let cat = categoriasMap.get(nombre);
            if (!cat) {
                cat = {
                    id: v.categoria_id || 0, name: nombre,
                    totalIngresos: 0, totalUnidades: 0, trend: 0,
                    color: colors[categoriasMap.size % colors.length],
                    topProduct: null, topProductSales: 0,
                    totalSalesCount: 0, totalProducts: 0,
                };
                categoriasMap.set(nombre, cat);
            }
            const unidades = v.cantidad;
            cat.totalIngresos += Number(v.monto_total || 0);
            cat.totalUnidades += unidades;
            cat.totalSalesCount++;
            if (unidades > cat.topProductSales) {
                cat.topProductSales = unidades;
                cat.topProduct = v.nombre_producto;
            }
        });

        // 3) Trend mes actual vs anterior (sobre TODAS las ventas del año)
        const ahora = new Date();
        const mesAct = ahora.getMonth();
        const mesAnt = mesAct === 0 ? 11 : mesAct - 1;
        const añoAnt = mesAct === 0 ? añoActual - 1 : añoActual;
        const keyAct = `${añoActual}-${mesAct}`;
        const keyAnt = `${añoAnt}-${mesAnt}`;

        const ventasPorMes = new Map();
        ventas.forEach(v => {
            const f = new Date(v.fecha_venta);
            const k = `${f.getFullYear()}-${f.getMonth()}`;
            const catName = v.categoria_nombre || 'Sin Categoría';
            if (!ventasPorMes.has(catName)) ventasPorMes.set(catName, new Map());
            const m = ventasPorMes.get(catName);
            m.set(k, (m.get(k) || 0) + v.cantidad);
        });

        return Array.from(categoriasMap.values()).map(cat => {
            const m = ventasPorMes.get(cat.name);
            const vAct = m?.get(keyAct) || 0;
            const vAnt = m?.get(keyAnt) || 0;
            let trend = 0;
            if (vAnt > 0) trend = ((vAct - vAnt) / vAnt) * 100;
            else if (vAct > 0) trend = 100;
            return {
                id: cat.id,
                name: cat.name,
                sales: cat.totalIngresos,
                totalUnits: cat.totalUnidades,
                totalIngresos: cat.totalIngresos,
                trend: Math.round(trend),
                color: cat.color,
                totalProducts: cat.totalProducts,
                totalSalesCount: cat.totalSalesCount,
                topProduct: cat.topProduct,
            };
        }).sort((a, b) => b.sales - a.sales);
    }, [getMonthNumber]);

    // ── Ventas mensuales ──
    const calcularVentasMensuales = useCallback((ventas) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const añoActual = new Date().getFullYear();
        const monthlyData = meses.map(month => ({
            month, ventas: 0, unidades: 0, categorias: {}, categoriasUnidades: {},
        }));
        if (!ventas.length) return monthlyData;

        ventas.forEach(v => {
            const f = new Date(v.fecha_venta);
            if (f.getFullYear() !== añoActual) return;
            const i = f.getMonth();
            const cat = v.categoria_nombre || 'Sin Categoría';
            const monto = Number(v.monto_total || 0);
            const unid = v.cantidad;
            monthlyData[i].ventas += monto;
            monthlyData[i].unidades += unid;
            monthlyData[i].categorias[cat] = (monthlyData[i].categorias[cat] || 0) + monto;
            monthlyData[i].categoriasUnidades[cat] = (monthlyData[i].categoriasUnidades[cat] || 0) + unid;
        });
        return monthlyData;
    }, []);

    // ── Top productos por mes (o año) ──
    const calcularTopProductosPorMes = useCallback((ventas, monthName) => {
        if (!ventas.length) return {};

        let mesNumero, año;
        if (monthName) {
            mesNumero = getMonthNumber(monthName);
            const ahora = new Date();
            año = mesNumero > ahora.getMonth()
                ? new Date().getFullYear() - 1
                : new Date().getFullYear();
        } else {
            const ahora = new Date();
            mesNumero = ahora.getMonth();
            año = ahora.getFullYear();
        }

        const filtradas = ventas.filter(v => {
            const f = new Date(v.fecha_venta);
            return f.getMonth() === mesNumero && f.getFullYear() === año;
        });
        if (!filtradas.length) return {};

        const map = new Map();
        filtradas.forEach(v => {
            const id = v.producto_id;
            if (!map.has(id)) {
                map.set(id, {
                    id,
                    name: v.nombre_producto || `Producto ${id}`,
                    category: v.categoria_nombre || 'Sin Categoría',
                    sales: 0,
                    revenue: 0,
                });
            }
            const p = map.get(id);
            p.sales += v.cantidad;
            p.revenue += Number(v.monto_total || 0);
        });

        const porCategoria = {};
        map.forEach(p => {
            if (!porCategoria[p.category]) porCategoria[p.category] = [];
            porCategoria[p.category].push({
                name: p.name, sales: p.sales, revenue: p.revenue,
            });
        });
        Object.keys(porCategoria).forEach(c => {
            porCategoria[c] = porCategoria[c]
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 10);
        });
        return porCategoria;
    }, [getMonthNumber]);

    // ── Clientes activos en compras (para drill-down, sin query extra) ──
    const calcularClientesActivosEnCompras = useCallback((ventas, monthName) => {
        if (!ventas.length) return [];

        let filtradas = ventas;
        if (monthName) {
            const mesNumero = getMonthNumber(monthName);
            const ahora = new Date();
            const año = mesNumero > ahora.getMonth()
                ? new Date().getFullYear() - 1
                : new Date().getFullYear();
            filtradas = ventas.filter(v => {
                const f = new Date(v.fecha_venta);
                return f.getMonth() === mesNumero && f.getFullYear() === año;
            });
        }

        const map = new Map();
        filtradas.forEach(v => {
            const id = v.cliente_id;
            if (!map.has(id)) {
                map.set(id, {
                    id,
                    name: v.nombre_cliente || `Cliente ${id}`,
                    tipo_cliente: v.tipo_cliente || 'Cliente Final',
                    compras: 0,
                    unidades: 0,
                    ultimaCompra: v.fecha_venta,
                });
            }
            const c = map.get(id);
            c.compras += Number(v.monto_total || 0);
            c.unidades += v.cantidad;
            if (new Date(v.fecha_venta) > new Date(c.ultimaCompra)) {
                c.ultimaCompra = v.fecha_venta;
            }
        });

        return Array.from(map.values()).sort((a, b) => b.compras - a.compras);
    }, [getMonthNumber]);

    // ── Getters reactivos ──
    const getCategoriesByMonth = useCallback((monthName) => {
        if (!rawVentas.length && !rawProductos.length) return [];
        return calcularVentasPorCategoria(rawVentas, rawProductos, monthName);
    }, [rawVentas, rawProductos, calcularVentasPorCategoria]);

    const getTopProductsByMonth = useCallback((monthName) => {
        if (!rawVentas.length) return {};
        return calcularTopProductosPorMes(rawVentas, monthName);
    }, [rawVentas, calcularTopProductosPorMes]);

    const getClientsByMonth = useCallback((monthName) => {
        if (!rawVentas.length) return [];
        return calcularClientesActivosEnCompras(rawVentas, monthName);
    }, [rawVentas, calcularClientesActivosEnCompras]);

    // ── Carga principal ──
    const cargarDatos = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const { sucursal } = getLocalStorageData();

            if (!sucursal) {
                if (isMounted.current) {
                    setDashboardData(null);
                    setRawVentas([]);
                    setRawProductos([]);
                    setLoading(false);
                }
                return;
            }

            if (isMounted.current) {
                setLoading(true);
                setError(null);
            }

            // const [ventas, productos] = await fetchWithRetry(() =>
            //     Promise.all([
            //         obtenerVentas(sucursal.id, controller.signal),
            //         obtenerProductos(sucursal.id, controller.signal),
            //     ])
            // );

            let [ventas, productos] = await fetchWithRetry(() =>
                Promise.all([
                    obtenerVentas(sucursal.id, controller.signal),
                    obtenerProductos(sucursal.id, controller.signal),
                ])
            );


            // 👇 Si no hay productos, traemos categorías maestras para no dejar el grid vacío
            if (!productos.length) {
                const categoriasMaestro = await obtenerCategoriasMaestro(controller.signal);
                // Mapeamos a la forma que espera calcularVentasPorCategoria
                productos = categoriasMaestro.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    stock_actual: 0,
                    categoria_id: c.id,
                    categorias: c.categorias,
                    es_valido: true,
                }));
            }

            if (!isMounted.current || controller.signal.aborted) return;

            setRawVentas(ventas);
            setRawProductos(productos);

            const categories = calcularVentasPorCategoria(ventas, productos, null);
            const monthlySales = calcularVentasMensuales(ventas);
            const topProducts = calcularTopProductosPorMes(ventas, null);

            const totalIngresos = ventas.reduce((s, v) => s + Number(v.monto_total || 0), 0);
            const totalUnidades = ventas.reduce((s, v) => s + v.cantidad, 0);

            setDashboardData({
                categories,
                monthlySales,
                topProducts,
                currentMonth: getCurrentMonth(),
                stats: {
                    totalVentas: ventas.length,
                    totalIngresos,
                    totalUnidades,
                    totalProductos: productos.length,
                },
            });
            setLastUpdated(new Date());
        } catch (err) {
            if (err?.name === 'AbortError') return;
            console.error('Error cargando datos:', err);
            if (isMounted.current) setError(err.message);
        } finally {
            if (isMounted.current) setLoading(false);
            loadingRef.current = false;
        }
    }, [getLocalStorageData, obtenerVentas, obtenerProductos,
        calcularVentasPorCategoria, calcularVentasMensuales,
        calcularTopProductosPorMes, getCurrentMonth]);

    // ── Efecto: carga + listeners con debounce ──
    useEffect(() => {
        isMounted.current = true;
        cargarDatos();

        const handleChange = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => cargarDatos(), 300);
        };

        window.addEventListener('storage', handleChange);
        window.addEventListener('jc:storage', handleChange);
        const interval = setInterval(cargarDatos, 5 * 60 * 1000);

        return () => {
            isMounted.current = false;
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            window.removeEventListener('storage', handleChange);
            window.removeEventListener('jc:storage', handleChange);
            clearInterval(interval);
        };
    }, [cargarDatos]);

    // ── Objeto memoizado para no romper deps en hijos ──
    const value = useMemo(() => ({
        dashboardData,
        loading,
        error,
        currentUser,
        currentSucursal,
        lastUpdated,
        getTopProductsByMonth,
        getCategoriesByMonth,
        getClientsByMonth,
        refetch: cargarDatos,
    }), [dashboardData, loading, error, currentUser, currentSucursal,
        lastUpdated, getTopProductsByMonth, getCategoriesByMonth,
        getClientsByMonth, cargarDatos]);

    return value;
};