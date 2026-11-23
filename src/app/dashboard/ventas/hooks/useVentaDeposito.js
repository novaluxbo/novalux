// src/app/dashboard/ventas/hooks/useVentaDeposito.js
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useVentaDeposito() {
    const [actualizando, setActualizando] = useState(null);
    const [error, setError] = useState(null);

    const marcarDepositado = useCallback(async (ventaId, valor) => {
        if (!ventaId) throw new Error('ID de venta requerido');
        setActualizando(ventaId);
        setError(null);
        try {
            const { error: err } = await supabase
                .from('ventas')
                .update({
                    depositado: !!valor,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', ventaId);
            if (err) throw err;
            return { success: true };
        } catch (err) {
            setError(err.message || 'Error al actualizar depósito');
            return { success: false, error: err.message };
        } finally {
            setActualizando(null);
        }
    }, []);

    return { marcarDepositado, actualizando, error };
}