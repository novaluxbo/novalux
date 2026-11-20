// src/app/dashboard/gestion-categorias/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useCategorias } from './hooks/useCategorias';
import Header from './components/Header';
import Tabla from './components/Tabla';
import ModalNuevaCategoria from './components/ModalNuevaCategoria';
import ModalEditarCategoria from './components/ModalEditarCategoria';
import ModalReglasComision from './components/ModalReglasComision';

const GestionCategorias = () => {
    const {
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
    } = useCategorias();

    const [mostrarModalNueva, setMostrarModalNueva] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

    useEffect(() => {
        obtenerCategorias();
    }, []);

    const handleCrearCategoria = async (categoriaData) => {
        try {
            await crearCategoria(categoriaData);
            setMostrarModalNueva(false);
            return { success: true };
        } catch (error) {
            console.error('Error al crear categoría:', error);
            return {
                success: false,
                errors: { general: error.message || 'Error al crear la categoría' },
            };
        }
    };

    const handleEditarCategoria = async (id, categoriaData) => {
        try {
            await actualizarCategoria(id, categoriaData);
            setMostrarModalEditar(false);
            limpiarSeleccion();
        } catch (error) {
            console.error('Error al editar categoría:', error);
        }
    };

    const handleActualizarReglas = async (reglasComision) => {
        try {
            await actualizarReglasComision(categoriaSeleccionada.id, reglasComision);
            cerrarModalReglas();
        } catch (error) {
            console.error('Error al actualizar reglas:', error);
        }
    };

    const handleEliminarCategoria = async (categoria) => {
        const motivo = prompt(`Ingrese el motivo para desactivar "${categoria.nombre}":`);
        if (motivo && motivo.trim().length > 0) {
            try {
                await eliminarCategoria(categoria.id, motivo.trim());
            } catch (error) {
                console.error('Error al eliminar categoría:', error);
            }
        }
    };

    const handleReactivarCategoria = async (categoria) => {
        if (!confirm(`¿Reactivar la categoría "${categoria.nombre}"?`)) return;
        try {
            await reactivarCategoria(categoria.id);
        } catch (error) {
            console.error('Error al reactivar categoría:', error);
        }
    };

    const abrirModalEditar = (categoria) => {
        seleccionarCategoria(categoria);
        setMostrarModalEditar(true);
    };

    if (loading && categorias.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    <p className="text-emerald-200 text-sm">Cargando categorías...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-1 space-y-1 text-gray-800">
            <Header
                onNuevaCategoria={() => setMostrarModalNueva(true)}
                totalCategorias={categorias.length}
            />

            {error && (
                <div className="bg-rose-100 border border-rose-400 text-rose-700 px-3 py-2 rounded text-sm">
                    {error}
                </div>
            )}

            <Tabla
                categorias={categorias}
                onEditar={abrirModalEditar}
                onEliminar={handleEliminarCategoria}
                onReactivar={handleReactivarCategoria}
                onReglasComision={abrirModalReglas}
            />

            <ModalNuevaCategoria
                isOpen={mostrarModalNueva}
                onClose={() => setMostrarModalNueva(false)}
                onGuardar={handleCrearCategoria}
                loading={loading}
            />

            <ModalEditarCategoria
                isOpen={mostrarModalEditar}
                onClose={() => {
                    setMostrarModalEditar(false);
                    limpiarSeleccion();
                }}
                categoria={categoriaSeleccionada}
                onGuardar={handleEditarCategoria}
                loading={loading}
            />

            <ModalReglasComision
                isOpen={mostrarModalReglas}
                onClose={cerrarModalReglas}
                categoria={categoriaSeleccionada}
                onGuardar={handleActualizarReglas}
                loading={loading}
            />
        </div>
    );
};

export default GestionCategorias;