// src/app/dashboard/gestion-categorias/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCategorias } from './hooks/useCategorias';
import Header from './components/Header';
import Tabla from './components/Tabla';
import ModalNuevaCategoria from './components/ModalNuevaCategoria';
import ModalEditarCategoria from './components/ModalEditarCategoria';
import ModalReglasComision from './components/ModalReglasComision';

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: 'easeOut', staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen p-1 space-y-1 text-gray-800"
        >
            {/* ✅ Header siempre se renderiza; maneja su propio loading interno */}
            <motion.div variants={itemVariants}>
                <Header
                    onNuevaCategoria={() => setMostrarModalNueva(true)}
                    totalCategorias={categorias.length}
                />
            </motion.div>

            {error && (
                <motion.div
                    variants={itemVariants}
                    className="bg-rose-100 border border-rose-400 text-rose-700 px-3 py-2 rounded text-sm"
                >
                    {error}
                </motion.div>
            )}

            {/* ✅ Tabla maneja su propio estado de carga (como sucursales) */}
            <motion.div variants={itemVariants}>
                <Tabla
                    categorias={categorias}
                    loading={loading}
                    onEditar={abrirModalEditar}
                    onEliminar={handleEliminarCategoria}
                    onReactivar={handleReactivarCategoria}
                    onReglasComision={abrirModalReglas}
                />
            </motion.div>

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
        </motion.div>
    );
};

export default GestionCategorias;