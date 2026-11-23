"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { getItem, setItem, removeItem } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

const SucursalContext = createContext(undefined);

export function SucursalProvider({ children }) {
    const { user } = useAuth();

    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);

    // ================================
    // 🔵 GET - Obtener todas las sucursales
    // ================================
    const fetchSucursales = useCallback(async () => {
        // ⛔ Guard: no fetchear ni escribir si no hay sesión
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("sucursales")
                .select("id, nombre, direccion, telefono, activo, created_at, updated_at")
                .order("nombre", { ascending: true });

            if (error) throw error;

            setSucursales(data || []);
            setItem("sucursales", data || []);
        } catch (error) {
            console.error("Error fetching sucursales:", error);

            // Fallback local (solo si hay user)
            if (user) {
                const saved = getItem("sucursales");
                if (Array.isArray(saved)) {
                    setSucursales(saved);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ================================
    // INIT: cargar sucursal seleccionada + fetch sucursales
    // ================================
    useEffect(() => {
        // ⛔ Si no hay user, no inicializar nada (evita reescribir storage tras logout)
        if (!user) {
            setSucursalSeleccionada(null);
            setSucursales([]);
            setLoading(false);
            return;
        }

        // ✅ Leemos con prefijo jc_ y validamos forma mínima
        const savedSucursal = getItem("sucursalSeleccionada");
        if (
            savedSucursal &&
            typeof savedSucursal === "object" &&
            savedSucursal.id &&
            savedSucursal.nombre
        ) {
            setSucursalSeleccionada(savedSucursal);
        } else if (savedSucursal !== null) {
            removeItem("sucursalSeleccionada");
        }

        fetchSucursales();
    }, [user, fetchSucursales]);

    // ... (todo igual hasta createSucursal)

    // ================================
    // 🟢 CREATE
    // ================================
    const createSucursal = useCallback(async ({
        nombre,
        direccion = null,
        telefono = null,
        activo = true,        // ✅ ahora respeta el toggle del form
        usuarioId
    }) => {
        if (!user) return { success: false, error: "No autenticado" };
        try {
            const { data, error } = await supabase
                .from("sucursales")
                .insert([{
                    nombre,
                    direccion,
                    telefono,
                    activo,                                  // ✅ antes era hardcodeado true
                    usuario_creacion: usuarioId ?? null,
                    created_at: new Date(),
                }])
                .select();

            if (error) throw error;

            await fetchSucursales();
            return { success: true, data };
        } catch (error) {
            console.error("Error creating sucursal:", error);
            return { success: false, error };
        }
    }, [fetchSucursales, user]);

    // ... (el resto igual)
    // ================================
    // 🟡 UPDATE
    // ================================
    const updateSucursal = useCallback(async (id, { nombre, direccion, telefono, activo, usuarioId }) => {
        if (!user) return { success: false, error: "No autenticado" };
        try {
            const { data, error } = await supabase
                .from("sucursales")
                .update({
                    nombre,
                    direccion,
                    telefono,
                    updated_at: new Date(),
                    activo,
                    usuario_ultima_modificacion: usuarioId ?? null,
                })
                .eq("id", id)
                .select();

            if (error) throw error;

            await fetchSucursales();

            // ✅ Si actualicé la sucursal seleccionada, refrescamos su nombre
            if (sucursalSeleccionada?.id === id && nombre) {
                const nueva = { ...sucursalSeleccionada, nombre };
                setSucursalSeleccionada(nueva);
                setItem("sucursalSeleccionada", nueva);
            }

            return { success: true, data };
        } catch (error) {
            console.error("Error updating sucursal:", error);
            return { success: false, error };
        }
    }, [fetchSucursales, sucursalSeleccionada, user]);

    // ================================
    // 🔴 DELETE - Eliminación lógica
    // ================================
    const deleteSucursal = useCallback(async (id, usuarioId) => {
        if (!user) return { success: false, error: "No autenticado" };
        try {
            const { data, error } = await supabase
                .from("sucursales")
                .update({
                    activo: false,
                    updated_at: new Date(),
                    usuario_ultima_modificacion: usuarioId ?? null,
                })
                .eq("id", id)
                .select();

            if (error) throw error;

            await fetchSucursales();

            // Si borré la sucursal seleccionada → limpiar
            if (sucursalSeleccionada?.id === id) {
                setSucursalSeleccionada(null);
                removeItem("sucursalSeleccionada");
            }

            return { success: true, data };
        } catch (error) {
            console.error("Error deleting sucursal:", error);
            return { success: false, error };
        }
    }, [fetchSucursales, sucursalSeleccionada, user]);

    // ================================
    // Seleccionar sucursal
    // ================================
    const selectSucursal = useCallback((id, nombre) => {
        if (!user) {
            console.warn("[SucursalContext] selectSucursal llamado sin sesión");
            return;
        }
        if (!id) {
            console.warn("[SucursalContext] selectSucursal llamado sin id");
            return;
        }
        const data = { id, nombre: nombre || '' };
        setSucursalSeleccionada(data);
        setItem("sucursalSeleccionada", data);
    }, [user]);

    // ✅ Memoizamos el value para evitar re-renders innecesarios en consumidores
    const value = useMemo(() => ({
        sucursalSeleccionada,
        sucursales,
        loading,

        fetchSucursales,
        selectSucursal,

        createSucursal,
        updateSucursal,
        deleteSucursal,
    }), [
        sucursalSeleccionada,
        sucursales,
        loading,
        fetchSucursales,
        selectSucursal,
        createSucursal,
        updateSucursal,
        deleteSucursal,
    ]);

    return (
        <SucursalContext.Provider value={value}>
            {children}
        </SucursalContext.Provider>
    );
}

export const useSucursal = () => {
    const context = useContext(SucursalContext);
    if (!context) throw new Error("useSucursal must be used within SucursalProvider");
    return context;
};