// src/app/dashboard/clientes/hooks/useEditarCliente.js
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function useEditarCliente() {
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState(null);

    const actualizarCliente = useCallback(async (id, datos) => {
        setActualizando(true);
        setError(null);
        try {
            const payload = {
                codigo_cliente: datos.codigo_cliente?.trim(),
                nombre_cliente: datos.nombre_cliente?.trim(),
                nombre_comercial: datos.nombre_comercial?.trim() || null,
                numero_contacto: datos.numero_contacto?.trim() || null,
                responsable_id: datos.responsable_id,
                tipo_comercio: datos.tipo_comercio || 'No aplica',
                origen_cliente: datos.origen_cliente || 'Otro',
                tipo_cliente: datos.tipo_cliente || 'Cliente Final',
                departamento: datos.departamento?.trim() || null,
                localidad: datos.localidad?.trim() || null,
                estado: datos.estado || 'Prospecto',
                ultimo_contacto: datos.ultimo_contacto || null,
                proximo_seguimiento: datos.proximo_seguimiento || null,
                notas: datos.notas?.trim() || null,
            };

            const { data, error: sbError } = await supabase
                .from('clientes')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (sbError) throw new Error(sbError.message);
            toast.success(`Cliente ${data.codigo_cliente} actualizado`);
            return { success: true, cliente: data };
        } catch (err) {
            console.error('Error actualizando cliente:', err);
            setError(err.message);
            toast.error(`Error al actualizar: ${err.message}`);
            return { success: false, error: err.message };
        } finally {
            setActualizando(false);
        }
    }, []);

    return { actualizarCliente, actualizando, error };
}