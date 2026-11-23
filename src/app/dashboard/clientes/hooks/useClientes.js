// src/app/dashboard/clientes/hooks/useClientes.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useClientes() {
    const [clientes, setClientes] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ─────────────────────────────────────────────
    // Fetch de clientes
    // ─────────────────────────────────────────────
    const obtenerClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('clientes')
                .select(`
                    *,
                    responsable:responsable_id (
                        id,
                        nombre,
                        caja,
                        roles:rol_id ( id, nombre )
                    )
                `)
                .eq('activo', true)
                .order('codigo_cliente', { ascending: true });

            if (sbError) throw new Error(sbError.message);
            setClientes(data || []);
        } catch (err) {
            console.error('Error obteniendo clientes:', err);
            setError(err.message);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─────────────────────────────────────────────
    // Fetch de responsables
    // ─────────────────────────────────────────────
    const obtenerResponsables = useCallback(async () => {
        try {
            const { data, error: sbError } = await supabase
                .from('usuarios')
                .select(`
                    id, nombre, caja, sucursal_id,
                    roles:rol_id ( id, nombre )
                `)
                .eq('activo', true)
                .order('nombre');

            if (sbError) throw new Error(sbError.message);
            setResponsables(data || []);
        } catch (err) {
            console.error('Error obteniendo responsables:', err);
            setResponsables([]);
        }
    }, []);

    useEffect(() => {
        obtenerClientes();
        obtenerResponsables();
    }, [obtenerClientes, obtenerResponsables]);

    // ─────────────────────────────────────────────
    // Filtros en cliente
    // ─────────────────────────────────────────────
    const filtrarClientes = useCallback((lista, { busqueda, departamento, estado }) => {
        let result = lista;

        if (busqueda && busqueda.trim() !== '') {
            const t = busqueda.toLowerCase().trim();
            result = result.filter(c =>
                c.codigo_cliente?.toLowerCase().includes(t) ||
                c.nombre_cliente?.toLowerCase().includes(t) ||
                c.nombre_comercial?.toLowerCase().includes(t) ||
                c.numero_contacto?.toLowerCase().includes(t)
            );
        }

        if (departamento) {
            result = result.filter(c => c.departamento === departamento);
        }

        if (estado) {
            result = result.filter(c => c.estado === estado);
        }

        return result;
    }, []);

    // ─────────────────────────────────────────────
    // Métricas (simplificadas)
    // ─────────────────────────────────────────────
    const metricas = useMemo(() => {
        const total = clientes.length;
        const porEstado = clientes.reduce((acc, c) => {
            acc[c.estado] = (acc[c.estado] || 0) + 1;
            return acc;
        }, {});
        return { total, porEstado };
    }, [clientes]);

    return {
        clientes,
        responsables,
        loading,
        error,
        metricas,
        obtenerClientes,
        obtenerResponsables,
        filtrarClientes,
        refetch: obtenerClientes,
    };
}