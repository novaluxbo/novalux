// hooks/useUsuarios.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

const USUARIOS_SELECT = `
  *,
  roles:rol_id(nombre, descripcion),
  sucursales:sucursal_id(nombre)
`;

export const useUsuarios = (sucursalId = null) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ref para evitar setState después de desmontar
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const fetchUsuarios = useCallback(async (filtros = {}) => {
        if (mountedRef.current) {
            setLoading(true);
            setError(null);
        }

        try {
            let query = supabase
                .from('usuarios')
                .select(USUARIOS_SELECT);

            // Filtrar por sucursal SOLO si se indica explícitamente
            if (filtros.sucursalId) {
                query = query.eq('sucursal_id', filtros.sucursalId);
            } else if (sucursalId && !filtros.todasSucursales) {
                query = query.eq('sucursal_id', sucursalId);
            }

            if (filtros.activo !== undefined) {
                query = query.eq('activo', filtros.activo);
            }
            if (filtros.rol_id) {
                query = query.eq('rol_id', filtros.rol_id);
            }
            if (filtros.search) {
                query = query.or(`nombre.ilike.%${filtros.search}%`);
            }

            query = query.order('rol_id', { ascending: true });
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            if (mountedRef.current) {
                setUsuarios(data || []);
            }
            return { success: true, data: data || [] };
        } catch (err) {
            console.error('useUsuarios fetchUsuarios error:', err);
            if (mountedRef.current) {
                setError(err.message);
                // ⚠️ No vaciamos usuarios si ya había datos: evita el "salto"
                setUsuarios(prev => (prev.length === 0 ? [] : prev));
            }
            return { success: false, error: err.message };
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [sucursalId]);

    const ejecutarOperacion = async (operacion) => {
        try {
            const { data, error } = await operacion;
            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const crearUsuario = async (usuarioData) => {
        try {
            const saltRounds = 12;
            const claveHash = await bcrypt.hash(usuarioData.clave, saltRounds);

            const datosCompletos = {
                ...usuarioData,
                clave: claveHash,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const result = await ejecutarOperacion(
                supabase
                    .from('usuarios')
                    .insert([datosCompletos])
                    .select(USUARIOS_SELECT)
                    .single()
            );

            if (result.success) {
                setUsuarios(prev => [result.data, ...prev]);
            }
            return result;
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const actualizarUsuario = async (id, updates) => {
        try {
            const datosActualizados = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            if (updates.clave && updates.clave !== '') {
                const saltRounds = 12;
                datosActualizados.clave = await bcrypt.hash(updates.clave, saltRounds);
            } else {
                delete datosActualizados.clave;
            }

            const result = await ejecutarOperacion(
                supabase
                    .from('usuarios')
                    .update(datosActualizados)
                    .eq('id', id)
                    .select(USUARIOS_SELECT)
                    .single()
            );

            if (result.success) {
                setUsuarios(prev => prev.map(user =>
                    user.id === id ? result.data : user
                ));
            }
            return result;
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const eliminarUsuario = async (id) => {
        const result = await ejecutarOperacion(
            supabase
                .from('usuarios')
                .update({
                    activo: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select(USUARIOS_SELECT)
                .single()
        );

        if (result.success) {
            setUsuarios(prev => prev.map(user =>
                user.id === id ? result.data : user
            ));
        }
        return result;
    };

    const toggleEstadoUsuario = async (id, activo) => {
        return await actualizarUsuario(id, { activo });
    };

    const verificarClave = async (clavePlana, claveHash) => {
        return await bcrypt.compare(clavePlana, claveHash);
    };

    const obtenerUsuarioPorId = async (id) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select(USUARIOS_SELECT)
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const buscarUsuarios = async (termino) => {
        return await fetchUsuarios({ search: termino });
    };

    // Recargar cuando cambia sucursalId
    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    return {
        usuarios,
        loading,
        error,

        fetchUsuarios,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario,
        obtenerUsuarioPorId,
        verificarClave,
        buscarUsuarios,

        inactivarUsuario: (id) => toggleEstadoUsuario(id, false),
        reactivarUsuario: (id) => toggleEstadoUsuario(id, true),

        filtrarPorSucursal: (sucursalId) => fetchUsuarios({ sucursalId }),
        filtrarPorEstado: (activo) => fetchUsuarios({ activo }),
        filtrarPorRol: (rol_id) => fetchUsuarios({ rol_id }),
        mostrarTodos: () => fetchUsuarios({ todasSucursales: true })
    };
};