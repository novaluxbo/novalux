// src/app/dashboard/clientes/hooks/useCrearCliente.js
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function useCrearCliente() {
    const [creando, setCreando] = useState(false);
    const [error, setError] = useState(null);

    const crearCliente = useCallback(async (datos) => {
        setCreando(true);
        setError(null);
        try {
            // ✅ TEXT PLANO — sin JSON.stringify en ninguna columna
            const payload = {
                codigo_cliente: datos.codigo_cliente?.trim() || null,
                nombre_cliente: datos.nombre_cliente?.trim(),
                nombre_comercial: datos.nombre_comercial?.trim() || null,
                numero_contacto: datos.numero_contacto?.trim() || null,
                responsable_id: datos.responsable_id,
                tipo_comercio: datos.tipo_comercio || 'No aplica',
                origen_cliente: datos.origen_cliente || 'Otro',
                tipo_cliente: datos.tipo_cliente || 'Cliente Final',
                departamento: datos.departamento?.trim() || null,   // null si vacío
                localidad: datos.localidad?.trim() || null,
                estado: datos.estado || 'Prospecto',
                ultimo_contacto: datos.ultimo_contacto || null,
                proximo_seguimiento: datos.proximo_seguimiento || null,
                notas: datos.notas?.trim() || null,
            };

            // 🔍 DEBUG (quítalo después)
            console.log('[useCrearCliente] payload:', payload);

            const { data, error: sbError } = await supabase
                .from('clientes')
                .insert([payload])
                .select()
                .single();

            if (sbError) throw new Error(sbError.message);
            toast.success(`Cliente ${data.codigo_cliente} creado`);
            return { success: true, cliente: data };
        } catch (err) {
            console.error('Error creando cliente:', err);
            setError(err.message);
            toast.error(`Error al crear cliente: ${err.message}`);
            return { success: false, error: err.message };
        } finally {
            setCreando(false);
        }
    }, []);

    return { crearCliente, creando, error };
}