// src/app/dashboard/hooks/useClientes.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

const PAGE_SIZE = 1000;

const ESTADOS = ['Prospecto', 'Contactado', 'Preventa', 'Cliente'];
const TIPOS = ['Cliente Final', 'Mayorista'];

export const useClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);
    const abortRef = useRef(null);

    const cargarClientes = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            let all = [];
            let from = 0;
            let hasMore = true;

            while (hasMore) {
                // 👇 Sin .abortSignal()
                const { data, error: supabaseError } = await supabase
                    .from('clientes')
                    .select(`
                    id, nombre_cliente, nombre_comercial,
                    tipo_cliente, estado, origen_cliente,
                    fecha_ingreso, proximo_seguimiento,
                    departamento, activo
                `)
                    .eq('activo', true)
                    .order('fecha_ingreso', { ascending: false })
                    .range(from, from + PAGE_SIZE - 1);

                // Cancelación manual después del await
                if (controller.signal.aborted) return;

                if (supabaseError) {
                    // 👇 log útil en lugar de "{}"
                    console.error('cargarClientes — supabaseError:', {
                        message: supabaseError.message,
                        details: supabaseError.details,
                        hint: supabaseError.hint,
                        code: supabaseError.code,
                    });
                    throw supabaseError;
                }

                all = all.concat(data || []);
                hasMore = (data?.length || 0) === PAGE_SIZE;
                from += PAGE_SIZE;
            }

            if (!isMounted.current || controller.signal.aborted) return;
            setClientes(all);
        } catch (err) {
            if (err?.name === 'AbortError') return;
            console.error('Error cargando clientes:', {
                message: err?.message,
                details: err?.details,
                hint: err?.hint,
                code: err?.code,
                raw: err,
            });
            if (isMounted.current) setError(err?.message || 'Error al cargar clientes');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        cargarClientes();

        const handleChange = () => cargarClientes();
        window.addEventListener('jc:storage', handleChange);

        return () => {
            isMounted.current = false;
            abortRef.current?.abort();
            window.removeEventListener('jc:storage', handleChange);
        };
    }, [cargarClientes]);

    // ── Resumen calculado ──
    const resumen = useMemo(() => {
        if (!clientes.length) {
            return {
                total: 0,
                porTipo: Object.fromEntries(TIPOS.map(t => [t, 0])),
                porEstado: Object.fromEntries(ESTADOS.map(e => [e, 0])),
                porOrigen: [],
                nuevosMesActual: 0,
                nuevosMesAnterior: 0,
                trendNuevos: 0,
                conSeguimientoPendiente: 0,
            };
        }

        const ahora = new Date();
        const mesAct = ahora.getMonth();
        const añoAct = ahora.getFullYear();
        const mesAnt = mesAct === 0 ? 11 : mesAct - 1;
        const añoAnt = mesAct === 0 ? añoAct - 1 : añoAct;

        const porTipo = Object.fromEntries(TIPOS.map(t => [t, 0]));
        const porEstado = Object.fromEntries(ESTADOS.map(e => [e, 0]));
        const porOrigenMap = {};
        let nuevosMesActual = 0;
        let nuevosMesAnterior = 0;
        let conSeguimientoPendiente = 0;
        const hoyISO = ahora.toISOString();

        clientes.forEach(c => {
            if (porTipo[c.tipo_cliente] !== undefined) porTipo[c.tipo_cliente]++;
            if (porEstado[c.estado] !== undefined) porEstado[c.estado]++;
            porOrigenMap[c.origen_cliente] = (porOrigenMap[c.origen_cliente] || 0) + 1;

            if (c.fecha_ingreso) {
                const f = new Date(c.fecha_ingreso + 'T00:00:00');
                if (f.getMonth() === mesAct && f.getFullYear() === añoAct) nuevosMesActual++;
                if (f.getMonth() === mesAnt && f.getFullYear() === añoAnt) nuevosMesAnterior++;
            }
            if (c.proximo_seguimiento && c.proximo_seguimiento <= hoyISO) {
                conSeguimientoPendiente++;
            }
        });

        const porOrigen = Object.entries(porOrigenMap)
            .map(([origen, count]) => ({ origen, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const trendNuevos = nuevosMesAnterior > 0
            ? Math.round(((nuevosMesActual - nuevosMesAnterior) / nuevosMesAnterior) * 100)
            : (nuevosMesActual > 0 ? 100 : 0);

        return {
            total: clientes.length,
            porTipo,
            porEstado,
            porOrigen,
            nuevosMesActual,
            nuevosMesAnterior,
            trendNuevos,
            conSeguimientoPendiente,
        };
    }, [clientes]);

    // ── Map id → cliente (para enriquecer drill-down) ──
    const clientesById = useMemo(() => {
        const m = new Map();
        clientes.forEach(c => m.set(c.id, c));
        return m;
    }, [clientes]);

    const value = useMemo(() => ({
        clientes,
        clientesById,
        resumen,
        loading,
        error,
        refetch: cargarClientes,
    }), [clientes, clientesById, resumen, loading, error, cargarClientes]);

    return value;
};