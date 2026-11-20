// src/app/dashboard/gestion-categorias/hooks/useCategorias.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// ─────────────────────────────────────────────
// Helpers fuera del hook (no se recrean)
// ─────────────────────────────────────────────

const obtenerTextoComision = (reglasComision) => {
    if (!reglasComision) {
        return { textoComision: 'Sin comisión', detallesComision: null };
    }

    const { comision_variable, comision_base, comision_limite, comision_post_limite } = reglasComision;

    if (comision_variable) {
        return { textoComision: 'Variable por producto', detallesComision: null };
    }

    if (comision_base && comision_limite && comision_post_limite) {
        return {
            textoComision: 'Escalonada',
            detallesComision: {
                base: comision_base,
                limite: comision_limite,
                post_limite: comision_post_limite,
            },
        };
    }

    if (comision_base) {
        return {
            textoComision: `Fija Bs. ${comision_base}`,
            detallesComision: { base: comision_base },
        };
    }

    return { textoComision: 'Sin comisión', detallesComision: null };
};

// Enriquece una categoría con sus conteos y texto de comisión
const enriquecerCategoria = async (data) => {
    const [{ count: totalProductos }, { count: productosActivos }] = await Promise.all([
        supabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', data.id),
        supabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', data.id)
            .eq('activo', true),
    ]);

    const { textoComision, detallesComision } = obtenerTextoComision(data.reglas_comision);

    return {
        ...data,
        tipo_comision_mostrar: textoComision,
        detalles_comision: detallesComision,
        total_productos: totalProductos || 0,
        productos_activos: productosActivos || 0,
    };
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export const useCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [mostrarModalReglas, setMostrarModalReglas] = useState(false);

    const obtenerCategorias = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .select('*')
                .order('nombre');

            if (supabaseError) throw supabaseError;

            const categoriasEnriquecidas = await Promise.all(
                data.map(enriquecerCategoria)
            );

            setCategorias(categoriasEnriquecidas);
            return categoriasEnriquecidas;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const crearCategoria = async (categoriaData) => {
        setLoading(true);
        setError(null);
        try {
            const { reglas_comision, ...datosCategoria } = categoriaData;

            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .insert([{
                    ...datosCategoria,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }])
                .select('*')
                .single();

            if (supabaseError) throw supabaseError;

            const nueva = {
                ...data,
                tipo_comision_mostrar: 'Sin comisión',
                detalles_comision: null,
                total_productos: 0,
                productos_activos: 0,
            };

            setCategorias(prev => [...prev, nueva]);
            return nueva;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const actualizarCategoria = async (id, categoriaData) => {
        setLoading(true);
        setError(null);
        try {
            const { reglas_comision, ...datosCategoria } = categoriaData;

            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .update({
                    ...datosCategoria,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select('*')
                .single();

            if (supabaseError) throw supabaseError;

            const enriquecida = await enriquecerCategoria(data);
            setCategorias(prev => prev.map(cat => cat.id === id ? enriquecida : cat));
            return enriquecida;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const actualizarReglasComision = async (id, reglasComision) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .update({
                    reglas_comision: reglasComision,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select('*')
                .single();

            if (supabaseError) throw supabaseError;

            await supabase.from('auditoria').insert([{
                tabla_afectada: 'categorias',
                registro_id: id,
                accion: 'actualizar',
                datos_nuevos: { reglas_comision: reglasComision },
                datos_completos: {
                    accion: 'actualizar_reglas_comision',
                    reglas_comision: reglasComision,
                },
                fecha_evento: new Date().toISOString(),
                created_at: new Date().toISOString(),
            }]);

            const enriquecida = await enriquecerCategoria(data);
            setCategorias(prev => prev.map(cat => cat.id === id ? enriquecida : cat));
            return enriquecida;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const eliminarCategoria = async (id, motivo) => {
        setLoading(true);
        setError(null);
        try {
            const { error: supabaseError } = await supabase
                .from('categorias')
                .update({ activo: false, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            await supabase.from('auditoria').insert([{
                tabla_afectada: 'categorias',
                registro_id: id,
                accion: 'eliminar',
                motivo,
                datos_completos: { motivo },
                fecha_evento: new Date().toISOString(),
                created_at: new Date().toISOString(),
            }]);

            setCategorias(prev => prev.map(cat =>
                cat.id === id ? { ...cat, activo: false } : cat
            ));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reactivarCategoria = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: supabaseError } = await supabase
                .from('categorias')
                .update({ activo: true, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select('*')
                .single();

            if (supabaseError) throw supabaseError;

            const enriquecida = await enriquecerCategoria(data);
            setCategorias(prev => prev.map(cat => cat.id === id ? enriquecida : cat));
            return enriquecida;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const seleccionarCategoria = (categoria) => setCategoriaSeleccionada(categoria);
    const limpiarSeleccion = () => setCategoriaSeleccionada(null);

    const abrirModalReglas = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setMostrarModalReglas(true);
    };

    const cerrarModalReglas = () => {
        setMostrarModalReglas(false);
        setCategoriaSeleccionada(null);
    };

    return {
        categorias,
        loading,
        error,
        categoriaSeleccionada,
        mostrarModalReglas,
        obtenerCategorias,
        crearCategoria,
        actualizarCategoria,
        actualizarReglasComision,
        eliminarCategoria,
        reactivarCategoria,
        seleccionarCategoria,
        limpiarSeleccion,
        abrirModalReglas,
        cerrarModalReglas,
    };
};