// src/app/dashboard/clientes/hooks/useBajaCliente.js
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function useBajaCliente() {
    const [dandoDeBaja, setDandoDeBaja] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Baja lógica: NO borra el registro (rompería ventas).
     * Solo marca `activo = false`.
     */
    const darDeBajaCliente = useCallback(async (id) => {
        setDandoDeBaja(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('clientes')
                .update({ activo: false })
                .eq('id', id)
                .select()
                .single();

            if (sbError) throw new Error(sbError.message);
            toast.success(`Cliente ${data.codigo_cliente} dado de baja`);
            return { success: true, cliente: data };
        } catch (err) {
            console.error('Error dando de baja cliente:', err);
            setError(err.message);
            toast.error(`Error al dar de baja: ${err.message}`);
            return { success: false, error: err.message };
        } finally {
            setDandoDeBaja(false);
        }
    }, []);

    /**
     * Reactivar: si te arrepientes, vuelve a `activo = true`.
     */
    const reactivarCliente = useCallback(async (id) => {
        setDandoDeBaja(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('clientes')
                .update({ activo: true })
                .eq('id', id)
                .select()
                .single();

            if (sbError) throw new Error(sbError.message);
            toast.success(`Cliente ${data.codigo_cliente} reactivado`);
            return { success: true, cliente: data };
        } catch (err) {
            console.error('Error reactivando cliente:', err);
            setError(err.message);
            toast.error(`Error al reactivar: ${err.message}`);
            return { success: false, error: err.message };
        } finally {
            setDandoDeBaja(false);
        }
    }, []);

    return { darDeBajaCliente, reactivarCliente, dandoDeBaja, error };
}