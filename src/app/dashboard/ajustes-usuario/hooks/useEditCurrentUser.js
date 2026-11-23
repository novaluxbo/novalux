// src/app/dashboard/ajustes-usuario/hooks/useEditCurrentUser.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';
import { useMultiLocalStorageListener } from '@/hooks/listener/useLocalStorageListener';
import { setItem } from '@/lib/storage';

const CLAVE_HASH_PREFIX_KEY = 'auth_clave_hash_prefix';

export function useEditCurrentUser() {
    const { values, updateValue } = useMultiLocalStorageListener(['currentUser']);
    const { currentUser } = values;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const changePassword = async (claveActual, claveNueva) => {
        if (!currentUser?.id) {
            setError('No hay usuario autenticado');
            return { success: false, error: 'No hay usuario autenticado' };
        }

        if (!claveActual || !claveNueva) {
            setError('Debés completar ambos campos');
            return { success: false, error: 'Debés completar ambos campos' };
        }

        if (claveNueva.length < 4) {
            setError('La nueva contraseña debe tener al menos 4 caracteres');
            return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres' };
        }

        if (claveActual === claveNueva) {
            setError('La nueva contraseña debe ser distinta a la actual');
            return { success: false, error: 'La nueva contraseña debe ser distinta a la actual' };
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Traer el hash actual de la BD
            const { data: usuarioBD, error: fetchError } = await supabase
                .from('usuarios')
                .select('clave')
                .eq('id', currentUser.id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Validar contraseña actual
            const esValida = await bcrypt.compare(claveActual, usuarioBD.clave);
            if (!esValida) {
                setError('La contraseña actual es incorrecta');
                setLoading(false);
                return { success: false, error: 'La contraseña actual es incorrecta' };
            }

            // 3. Hashear la nueva
            const saltRounds = 12;
            const nuevoHash = await bcrypt.hash(claveNueva, saltRounds);
            const nuevoPrefijo = nuevoHash.substring(0, 12);

            // ✅ 4. CRÍTICO: escribir storage ANTES del UPDATE en BD
            //    Así cuando llegue el evento realtime, hashGuardado === hashActual
            //    y verificarSiCambioClave devolverá false (no logout por race condition).
            setItem(CLAVE_HASH_PREFIX_KEY, nuevoPrefijo);
            setItem('auth_user_updated_at', new Date().toISOString());

            // ✅ 5. Marcar flag como defensa en profundidad (por si el realtime llega
            //    antes del commit). Timeout de 10s y clearTimeout previo para evitar
            //    que un timeout viejo lo resetee antes de tiempo.
            if (typeof window !== 'undefined') {
                window.__skipNextRealtimeLogout = true;
                clearTimeout(window.__skipRealtimeTimeout);
                window.__skipRealtimeTimeout = setTimeout(() => {
                    window.__skipNextRealtimeLogout = false;
                }, 10000);
            }

            // 6. Guardar en BD
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({
                    clave: nuevoHash,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', currentUser.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setLoading(false);
            return { success: true };

        } catch (err) {
            console.error('Error al cambiar contraseña:', err);
            // ⚠️ NO reseteamos el flag aquí: el UPDATE pudo haber commiteado
            //    aunque la promesa rechace (network timeout). Dejamos que el
            //    timeout de 10s lo limpie solo.
            const msg = err.message || 'Error al cambiar la contraseña';
            setError(msg);
            setLoading(false);
            return { success: false, error: msg };
        }
    };

    const updateProfile = async (userData) => {
        if (!currentUser?.id) {
            setError('No hay usuario autenticado');
            return { success: false, error: 'No hay usuario autenticado' };
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const updates = { updated_at: new Date().toISOString() };

            if (userData.nombre !== undefined) updates.nombre = userData.nombre;
            if (userData.caja !== undefined) updates.caja = userData.caja;

            // ✅ Marcar flag para que Realtime omita el logout propio
            if (typeof window !== 'undefined') {
                window.__skipNextRealtimeLogout = true;
                clearTimeout(window.__skipRealtimeTimeout);
                window.__skipRealtimeTimeout = setTimeout(() => {
                    window.__skipNextRealtimeLogout = false;
                }, 10000);
            }

            const { data, error: updateError } = await supabase
                .from('usuarios')
                .update(updates)
                .eq('id', currentUser.id)
                .select(`
                    id,
                    nombre,
                    caja,
                    roles:rol_id ( nombre )
                `)
                .single();

            if (updateError) throw updateError;

            const updatedUser = { ...currentUser, ...data, roles: data.roles };
            updateValue('currentUser', updatedUser);

            setSuccess(true);
            setItem('auth_user_updated_at', new Date().toISOString());
            setLoading(false);
            return { success: true };

        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            // ⚠️ Mismo criterio que en changePassword: no reseteamos el flag
            //    porque el UPDATE pudo haber commiteado parcialmente.
            const msg = err.message || 'Error al actualizar el perfil';
            setError(msg);
            setLoading(false);
            return { success: false, error: msg };
        }
    };

    return {
        currentUser,
        changePassword,
        updateProfile,
        loading,
        error,
        success,
        resetStates: () => {
            setError(null);
            setSuccess(false);
        }
    };
}