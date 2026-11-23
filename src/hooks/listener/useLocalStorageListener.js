// hooks/listener/useLocalStorageListener.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, removeItem } from '@/lib/storage';

/**
 * Escucha múltiples claves de localStorage (con namespace de la app).
 * Devuelve { values, updateValue }.
 */
export function useMultiLocalStorageListener(keys = []) {
    const keysRef = useRef(keys);
    keysRef.current = keys;

    // Estado inicial: lee todas las claves de una vez
    const [values, setValues] = useState(() => {
        const initial = {};
        keys.forEach(key => {
            initial[key] = getItem(key, null);
        });
        return initial;
    });

    // Actualiza una sola clave y notifica
    const updateValue = useCallback((key, value) => {
        if (value === null || value === undefined) {
            removeItem(key);
        } else {
            setItem(key, value);
        }
        // El evento jc:storage dispara el listener de abajo,
        // pero actualizamos también localmente por si acaso.
        setValues(prev => ({ ...prev, [key]: value }));
    }, []);

    useEffect(() => {
        const handleChange = (event) => {
            // Evento interno (misma pestaña)
            if (event.type === 'jc:storage') {
                const { key, value } = event.detail || {};
                if (key === '*') {
                    // Limpieza total: releer todo
                    const next = {};
                    keysRef.current.forEach(k => { next[k] = getItem(k, null); });
                    setValues(next);
                    return;
                }
                if (keysRef.current.includes(key)) {
                    setValues(prev => ({ ...prev, [key]: value ?? null }));
                }
                return;
            }
            // Evento nativo (otra pestaña)
            if (event.type === 'storage') {
                // event.key viene con prefijo, lo quitamos
                const rawKey = event.key;
                if (!rawKey) return; // clear() de otra pestaña
                const prefix = 'jc_';
                if (!rawKey.startsWith(prefix)) return;
                const key = rawKey.slice(prefix.length);
                if (keysRef.current.includes(key)) {
                    setValues(prev => ({ ...prev, [key]: getItem(key, null) }));
                }
            }
        };

        window.addEventListener('jc:storage', handleChange);
        window.addEventListener('storage', handleChange);

        return () => {
            window.removeEventListener('jc:storage', handleChange);
            window.removeEventListener('storage', handleChange);
        };
    }, []);

    return { values, updateValue };
}

/**
 * Alias por compatibilidad con imports existentes.
 */
export const useLocalStorageListener = (key) => {
    const { values, updateValue } = useMultiLocalStorageListener([key]);
    return {
        value: values[key],
        updateValue: (v) => updateValue(key, v),
    };
};

export default useMultiLocalStorageListener;