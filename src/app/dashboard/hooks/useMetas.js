// src/app/dashboard/hooks/useMetas.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

export const useMetas = (categorias, mesNombre, anio = null) => {
    const [metas, setMetas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);

    // Dep estable: solo cambia si cambian los IDs de categorías
    const categoriasKey = useMemo(
        () => (categorias || []).map(c => c.id).sort().join(','),
        [categorias]
    );

    const getMonthNumber = useCallback((monthName) => {
        if (!monthName) return new Date().getMonth() + 1;
        const meses = {
            'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
            'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
            'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Ago': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12,
        };
        return meses[monthName] || new Date().getMonth() + 1;
    }, []);

    const getMonthName = useCallback((monthNumber) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[monthNumber - 1] || '';
    }, []);

    const anoActual = anio || new Date().getFullYear();

    // ── Meses disponibles (solo meses CON meta real) ──
    const obtenerMesesDisponibles = useCallback(async () => {
        try {
            const { data, error: supabaseError } = await supabase
                .from('metas_categorias')
                .select('mes')
                .eq('anio', anoActual);
            if (supabaseError) throw supabaseError;
            const meses = [...new Set((data || []).map(i => i.mes))].sort((a, b) => a - b);
            setMesesDisponibles(meses);
            return meses;
        } catch (err) {
            console.error('Error obteniendo meses disponibles:', err);
            return [];
        }
    }, [anoActual]);

    // ── Cargar metas del mes ──
    const cargarMetas = useCallback(async (mes, ano) => {
        if (!categorias?.length || !mes) return {};

        try {
            const ids = categorias.map(c => c.id).filter(Boolean);
            if (!ids.length) return {};

            const { data, error: supabaseError } = await supabase
                .from('metas_categorias')
                .select('id, valor_meta, tipo_meta, categoria_id')
                .eq('mes', mes)
                .eq('anio', ano)
                .in('categoria_id', ids);

            if (supabaseError) throw supabaseError;

            const map = {};
            (data || []).forEach(m => {
                map[m.categoria_id] = {
                    id: m.id,
                    valor: m.valor_meta,
                    tipo: m.tipo_meta,
                    categoria_id: m.categoria_id,
                };
            });
            return map;
        } catch (err) {
            console.error('Error cargando metas:', err);
            setError(err.message);
            return {};
        }
    }, [categorias]);

    // ── Guardar / actualizar meta (defensivo sin unique index) ──
    const guardarMeta = useCallback(async (categoriaId, tipoMeta, valorMeta) => {
        const mesNumero = getMonthNumber(mesNombre);

        try {
            const { data: existing } = await supabase
                .from('metas_categorias')
                .select('id')
                .eq('categoria_id', categoriaId)
                .eq('mes', mesNumero)
                .eq('anio', anoActual)
                .maybeSingle();

            let result;
            if (existing) {
                result = await supabase
                    .from('metas_categorias')
                    .update({
                        tipo_meta: tipoMeta,
                        valor_meta: valorMeta,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id);
            } else {
                result = await supabase
                    .from('metas_categorias')
                    .insert({
                        categoria_id: categoriaId,
                        mes: mesNumero,
                        anio: anoActual,
                        tipo_meta: tipoMeta,
                        valor_meta: valorMeta,
                    });
            }

            if (result.error) {
                // Si falló el insert por duplicado (race), intentamos update
                if (result.error.code === '23505') {
                    const { data: row } = await supabase
                        .from('metas_categorias')
                        .select('id')
                        .eq('categoria_id', categoriaId)
                        .eq('mes', mesNumero)
                        .eq('anio', anoActual)
                        .maybeSingle();
                    if (row) {
                        await supabase
                            .from('metas_categorias')
                            .update({ tipo_meta: tipoMeta, valor_meta: valorMeta })
                            .eq('id', row.id);
                    }
                } else {
                    throw result.error;
                }
            }

            // Actualización optimista local (evita re-fetch completo)
            setMetas(prev => ({
                ...prev,
                [categoriaId]: {
                    ...(prev[categoriaId] || {}),
                    id: existing?.id,
                    valor: valorMeta,
                    tipo: tipoMeta,
                    categoria_id: categoriaId,
                },
            }));

            // Refrescar meses disponibles en background
            obtenerMesesDisponibles();

            return { success: true };
        } catch (err) {
            console.error('Error guardando meta:', err);
            return { success: false, error: err.message };
        }
    }, [mesNombre, anoActual, getMonthNumber, obtenerMesesDisponibles]);

    // ── Eliminar meta ──
    const eliminarMeta = useCallback(async (categoriaId) => {
        const mesNumero = getMonthNumber(mesNombre);

        try {
            const { error: delError } = await supabase
                .from('metas_categorias')
                .delete()
                .eq('categoria_id', categoriaId)
                .eq('mes', mesNumero)
                .eq('anio', anoActual);

            if (delError) throw delError;

            setMetas(prev => {
                const next = { ...prev };
                delete next[categoriaId];
                return next;
            });

            obtenerMesesDisponibles();
            return { success: true };
        } catch (err) {
            console.error('Error eliminando meta:', err);
            return { success: false, error: err.message };
        }
    }, [mesNombre, anoActual, getMonthNumber, obtenerMesesDisponibles]);

    // ── Efecto: inicializar (dep por IDs, no por array) ──
    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            if (!categoriasKey) {
                setLoading(false);
                setMetas({});
                return;
            }

            setLoading(true);
            const mesNumero = getMonthNumber(mesNombre);

            const [_, metasData] = await Promise.all([
                obtenerMesesDisponibles(),
                cargarMetas(mesNumero, anoActual),
            ]);

            if (cancelled) return;
            setMetas(metasData);
            setLoading(false);
        };

        init();
        return () => { cancelled = true; };
    }, [categoriasKey, mesNombre, anoActual, getMonthNumber, cargarMetas, obtenerMesesDisponibles]);

    const getMetaByCategoria = useCallback(
        (categoriaId) => metas[categoriaId] || null,
        [metas]
    );

    // ── Versión REAL: solo true si hay meta guardada para ese mes ──
    const tieneMetasRegistradas = useCallback(
        (mesNumero) => mesesDisponibles.includes(mesNumero),
        [mesesDisponibles]
    );

    const value = useMemo(() => ({
        metas,
        loading,
        error,
        guardarMeta,
        eliminarMeta,
        cargarMetas,
        getMetaByCategoria,
        mesesDisponibles,
        tieneMetasRegistradas,
        getMonthName,
    }), [metas, loading, error, guardarMeta, eliminarMeta,
        cargarMetas, getMetaByCategoria, mesesDisponibles,
        tieneMetasRegistradas, getMonthName]);

    return value;
};