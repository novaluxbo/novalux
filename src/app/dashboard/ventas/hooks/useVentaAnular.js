// src/app/dashboard/ventas/hooks/useVentaAnular.js
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useVentaAnular({ currentUser } = {}) {
    const [anulando, setAnulando] = useState(null);
    const [error, setError] = useState(null);

    const anularVenta = useCallback(async (ventaId, motivo) => {
        if (!ventaId) throw new Error('ID de venta requerido');
        if (!motivo?.trim()) throw new Error('Debés indicar un motivo de anulación');

        setAnulando(ventaId);
        setError(null);

        try {
            const { error: err } = await supabase
                .from('ventas')
                .update({
                    estado: 'anulada',
                    motivo_anulacion: motivo.trim(),
                    fecha_anulacion: new Date().toISOString(),
                    usuario_anulacion: currentUser?.id ?? null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ventaId);

            if (err) throw err;
            return { success: true };
        } catch (err) {
            setError(err.message || 'Error al anular la venta');
            return { success: false, error: err.message };
        } finally {
            setAnulando(null);
        }
    }, [currentUser?.id]);

    return { anularVenta, anulando, error };
}