// src/app/dashboard/ventas/hooks/useVentaNota.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useVentaNota({ debounceMs = 600, okMs = 1200 } = {}) {
    // { [id]: 'guardando' | 'ok' | 'error' }
    const [estado, setEstado] = useState({});
    const [error, setError] = useState(null);
    const timersRef = useRef(new Map());       // id → debounce timer
    const okTimersRef = useRef(new Map());     // id → timeout para limpiar 'ok'
    const valuesRef = useRef(new Map());       // id → texto pendiente

    useEffect(() => {
        const timers = timersRef.current;
        const okTimers = okTimersRef.current;
        return () => {
            timers.forEach((t) => clearTimeout(t));
            timers.clear();
            okTimers.forEach((t) => clearTimeout(t));
            okTimers.clear();
        };
    }, []);

    const setEstadoDe = useCallback((id, valor) => {
        setEstado((prev) => {
            if (valor === null) {
                if (!(id in prev)) return prev;
                const next = { ...prev };
                delete next[id];
                return next;
            }
            return { ...prev, [id]: valor };
        });
    }, []);

    const persistir = useCallback(async (ventaId, texto) => {
        setEstadoDe(ventaId, 'guardando');
        try {
            const { error: err } = await supabase
                .from('ventas')
                .update({
                    nota_individual: texto || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ventaId);
            if (err) throw err;

            setEstadoDe(ventaId, 'ok');
            // limpiar 'ok' después de okMs
            const prev = okTimersRef.current.get(ventaId);
            if (prev) clearTimeout(prev);
            const t = setTimeout(() => {
                setEstadoDe(ventaId, null);
                okTimersRef.current.delete(ventaId);
            }, okMs);
            okTimersRef.current.set(ventaId, t);
        } catch (err) {
            setError(err.message || 'Error al guardar la nota');
            setEstadoDe(ventaId, 'error');
            const prev = okTimersRef.current.get(ventaId);
            if (prev) clearTimeout(prev);
            const t = setTimeout(() => {
                setEstadoDe(ventaId, null);
                okTimersRef.current.delete(ventaId);
            }, 2000);
            okTimersRef.current.set(ventaId, t);
        }
    }, [okMs, setEstadoDe]);

    const setNota = useCallback((ventaId, texto) => {
        if (!ventaId) return;
        valuesRef.current.set(ventaId, texto);

        const prevTimer = timersRef.current.get(ventaId);
        if (prevTimer) clearTimeout(prevTimer);

        const timer = setTimeout(() => {
            const value = valuesRef.current.get(ventaId);
            persistir(ventaId, value);
            timersRef.current.delete(ventaId);
        }, debounceMs);

        timersRef.current.set(ventaId, timer);
    }, [debounceMs, persistir]);

    const flush = useCallback((ventaId) => {
        const prevTimer = timersRef.current.get(ventaId);
        if (prevTimer) clearTimeout(prevTimer);
        timersRef.current.delete(ventaId);
        const value = valuesRef.current.get(ventaId);
        if (value !== undefined) persistir(ventaId, value);
    }, [persistir]);

    return { setNota, flush, estado, error };
}