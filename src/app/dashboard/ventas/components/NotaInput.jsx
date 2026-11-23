// src/app/dashboard/ventas/components/NotaInput.jsx
'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const NotaInput = memo(function NotaInput({
    ventaId,
    initialValue,
    disabled = false,
    onSaved,
}) {
    const [valor, setValor] = useState(initialValue ?? '');
    const [status, setStatus] = useState(null);
    const debounceRef = useRef(null);
    const okTimerRef = useRef(null);
    const lastSavedRef = useRef(initialValue ?? '');
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (okTimerRef.current) clearTimeout(okTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (initialValue !== lastSavedRef.current && !debounceRef.current) {
            lastSavedRef.current = initialValue ?? '';
            setValor(initialValue ?? '');
        }
    }, [initialValue]);

    const persistir = async (id, texto) => {
        setStatus('guardando');

        // ✅ MARCAR el id: el realtime de esta pestaña lo va a ignorar
        if (typeof window !== 'undefined') {
            if (!window.__skipRealtimeVentaIds) {
                window.__skipRealtimeVentaIds = new Set();
            }
            window.__skipRealtimeVentaIds.add(id);
        }

        try {
            const { error } = await supabase
                .from('ventas')
                .update({
                    nota_individual: texto || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);
            if (error) throw error;

            lastSavedRef.current = texto;
            if (!mountedRef.current) return;
            setStatus('ok');
            if (okTimerRef.current) clearTimeout(okTimerRef.current);
            okTimerRef.current = setTimeout(() => {
                if (mountedRef.current) setStatus(null);
            }, 1200);
            onSaved?.(id, texto);
        } catch (err) {
            if (!mountedRef.current) return;
            setStatus('error');
            if (okTimerRef.current) clearTimeout(okTimerRef.current);
            okTimerRef.current = setTimeout(() => {
                if (mountedRef.current) setStatus(null);
            }, 2000);
        }
    };

    const handleChange = (e) => {
        const nuevo = e.target.value;
        setValor(nuevo);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            if (nuevo !== lastSavedRef.current) persistir(ventaId, nuevo);
        }, 600);
    };

    const handleBlur = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
            if (valor !== lastSavedRef.current) persistir(ventaId, valor);
        }
    };

    const borde =
        status === 'guardando'
            ? 'border-amber-400 ring-1 ring-amber-300'
            : status === 'ok'
                ? 'border-emerald-400 ring-1 ring-emerald-300'
                : status === 'error'
                    ? 'border-red-400 ring-1 ring-red-300'
                    : 'border-gray-300';

    return (
        <input
            type="text"
            value={valor}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nota..."
            disabled={disabled}
            className={`w-full text-[11px] text-gray-900 placeholder-gray-400 border rounded px-1.5 py-1 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 bg-white disabled:bg-gray-100 transition-colors ${borde}`}
        />
    );
});

export default NotaInput;