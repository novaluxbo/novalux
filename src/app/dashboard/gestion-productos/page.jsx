'use client';

import { useState } from 'react';
import Header from './components/Header';
import FiltroProductos from './components/FiltroProductos';
import Tabla from './components/Tabla';
import ModalNuevoProducto from './components/ModalNuevoProducto';
import ModalEditarProducto from './components/ModalEditarProducto';
import { useProductos } from './hooks/useProductos';
import { useDescargarExcelProductos } from './hooks/useDescargarExcelProductos';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";

export default function GestionProductos() {
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);

    const [filtro, setFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [soloActivos, setSoloActivos] = useState(true);

    const { values } = useMultiLocalStorageListener(["sucursalSeleccionada"]);
    const { sucursalSeleccionada } = values;

    const {
        productos,
        catalogoGlobal,
        categorias,
        loading,
        error,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        recargarProductos
    } = useProductos(sucursalSeleccionada?.id);

    // ✅ Hook de descarga Excel
    const { descargarExcel, descargando: descargandoExcel } = useDescargarExcelProductos();

    const handleCrearProducto = async (datosProducto) => {
        const productoConSucursal = {
            ...datosProducto,
            sucursal_id: sucursalSeleccionada?.id
        };

        const resultado = await crearProducto(productoConSucursal);
        if (resultado.success) {
            setModalNuevoAbierto(false);
        }
        return resultado;
    };

    const handleEditarProducto = async (id, datosProducto) => {
        const productoConSucursal = {
            ...datosProducto,
            sucursal_id: sucursalSeleccionada?.id
        };

        const resultado = await actualizarProducto(id, productoConSucursal);
        if (resultado.success) {
            setProductoEditando(null);
        }
        return resultado;
    };

    const handleEliminarProducto = async (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            await eliminarProducto(id);
        }
    };

    // ✅ Handler del botón Descargar Excel
    const handleDescargarExcel = async () => {
        await descargarExcel({
            productosVisibles: productos,        // el hook aplica los filtros según rol
            filtros: { filtro, categoriaFiltro, soloActivos }
        });
    };

    return (
        <div className="p-2 sm:p-3 space-y-2 text-gray-800 w-full max-w-screen-2xl mx-auto">
            <Header
                onNuevoProducto={() => setModalNuevoAbierto(true)}
                onRecargar={recargarProductos}
                loading={loading}
                sucursalSeleccionada={sucursalSeleccionada}
                onDescargarExcel={handleDescargarExcel}   // ✅ nueva prop
                descargandoExcel={descargandoExcel}       // ✅ nueva prop
            />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
                    {error}
                </div>
            )}

            <FiltroProductos
                productos={productos}
                sucursalSeleccionada={sucursalSeleccionada}
                onFiltroChange={setFiltro}
                onCategoriaChange={setCategoriaFiltro}
                onSoloActivosChange={setSoloActivos}
            />

            <Tabla
                productos={productos}
                onEditar={setProductoEditando}
                loading={loading}
                sucursalSeleccionada={sucursalSeleccionada}
                filtro={filtro}
                categoriaFiltro={categoriaFiltro}
                soloActivos={soloActivos}
            />

            <ModalNuevoProducto
                abierto={modalNuevoAbierto}
                onCerrar={() => setModalNuevoAbierto(false)}
                onCrearProducto={handleCrearProducto}
                categorias={categorias}
                loading={loading}
                sucursalSeleccionada={sucursalSeleccionada}
                productosExistentes={catalogoGlobal}
            />

            {productoEditando && (
                <ModalEditarProducto
                    producto={productoEditando}
                    onCerrar={() => setProductoEditando(null)}
                    onActualizarProducto={handleEditarProducto}
                    categorias={categorias}
                    loading={loading}
                    sucursalSeleccionada={sucursalSeleccionada}
                    productosExistentes={catalogoGlobal}
                />
            )}
        </div>
    );
}