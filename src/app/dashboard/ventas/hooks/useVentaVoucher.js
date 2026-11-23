// src/app/dashboard/ventas/hooks/useVentaVoucher.js
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para reemplazar el comprobante_url de una venta existente
 * (por si se subió el archivo equivocado).
 */
export function useVentaVoucher() {
    const [actualizando, setActualizando] = useState(null);
    const [error, setError] = useState(null);

    const actualizarVoucher = useCallback(async (ventaId, nuevoUrl) => {
        if (!ventaId) throw new Error('ID de venta requerido');
        if (!nuevoUrl) throw new Error('URL del voucher requerida');
        setActualizando(ventaId);
        setError(null);
        try {
            const { error: err } = await supabase
                .from('ventas')
                .update({
                    comprobante_url: nuevoUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ventaId);
            if (err) throw err;
            return { success: true };
        } catch (err) {
            setError(err.message || 'Error al actualizar el voucher');
            return { success: false, error: err.message };
        } finally {
            setActualizando(null);
        }
    }, []);

    return { actualizarVoucher, actualizando, error };
}