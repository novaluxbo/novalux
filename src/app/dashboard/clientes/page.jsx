// src/app/dashboard/clientes/page.jsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import FiltrosClientes from './components/FiltrosClientes';
import TablaClientes from './components/TablaClientes';
import ModalNuevoCliente from './components/ModalNuevoCliente';
import ModalEditarCliente from './components/ModalEditarCliente';
import ModalConfirmarBaja from './components/ModalConfirmarBaja';   // ✅ nuevo
import { useClientes } from './hooks/useClientes';
import { useCrearCliente } from './hooks/useCrearCliente';
import { useEditarCliente } from './hooks/useEditarCliente';
import { useBajaCliente } from './hooks/useBajaCliente';
import { useMultiLocalStorageListener } from '@/hooks/listener/useLocalStorageListener';

export default function ClientesPage() {
    const [busqueda, setBusqueda] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [modalNuevo, setModalNuevo] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);

    // ✅ Nuevo estado para el modal de baja
    const [clienteADarBaja, setClienteADarBaja] = useState(null);

    const { values } = useMultiLocalStorageListener([
        'currentUser',
        'sucursalSeleccionada',
    ]);
    const currentUser = values.currentUser;
    const currentSucursal = values.sucursalSeleccionada;

    const rolNombre =
        currentUser?.roles?.nombre ||
        (Array.isArray(currentUser?.roles) ? currentUser.roles[0]?.nombre : null) ||
        (currentUser?.rol_id ? `Rol ${currentUser.rol_id}` : '—');

    const {
        clientes,
        responsables,
        loading,
        error,
        metricas,
        obtenerClientes,
        filtrarClientes,
    } = useClientes();

    const { crearCliente, creando } = useCrearCliente();
    const { actualizarCliente, actualizando } = useEditarCliente();
    const { darDeBajaCliente, reactivarCliente, dandoDeBaja } = useBajaCliente();

    const clientesFiltrados = useMemo(
        () => filtrarClientes(clientes, { busqueda, departamento }),
        [clientes, busqueda, departamento, filtrarClientes]
    );

    const handleCrear = useCallback(async (datos) => {
        const res = await crearCliente(datos);
        if (res.success) {
            setModalNuevo(false);
            await obtenerClientes();
        }
        return res;
    }, [crearCliente, obtenerClientes]);

    const handleEditar = useCallback(async (id, datos) => {
        const res = await actualizarCliente(id, datos);
        if (res.success) {
            setClienteEditando(null);
            await obtenerClientes();
        }
        return res;
    }, [actualizarCliente, obtenerClientes]);

    // ✅ Ahora el "Dar de baja" viene desde el modal de edición → abre confirmación
    const handleSolicitarBaja = useCallback((cliente) => {
        setClienteADarBaja(cliente);
    }, []);

    // ✅ Confirmación final desde el modal de baja
    const handleConfirmarBaja = useCallback(async () => {
        if (!clienteADarBaja) return;
        const res = await darDeBajaCliente(clienteADarBaja.id);
        if (res.success) {
            setClienteADarBaja(null);
            setClienteEditando(null);   // cerramos también el modal de editar
            await obtenerClientes();
        }
    }, [clienteADarBaja, darDeBajaCliente, obtenerClientes]);

    const handleReactivar = useCallback(async (cliente) => {
        const res = await reactivarCliente(cliente.id);
        if (res.success) await obtenerClientes();
    }, [reactivarCliente, obtenerClientes]);

    if (!currentUser) {
        return (
            <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-amber-800">⚠️ Debe iniciar sesión para ver los clientes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-1 space-y-1 text-gray-800">
            <Header
                metricas={metricas}
                onNuevoCliente={() => setModalNuevo(true)}
                currentUser={currentUser}
                currentSucursal={currentSucursal}
                rolNombre={rolNombre}
            />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                </div>
            )}

            <FiltrosClientes
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                departamento={departamento}
                onDepartamentoChange={setDepartamento}
                totalMostrados={clientesFiltrados.length}
                totalOriginal={clientes.length}
                onLimpiar={() => { setBusqueda(''); setDepartamento(''); }}
            />

            <TablaClientes
                clientes={clientesFiltrados}
                loading={loading}
                onEditar={setClienteEditando}
                currentUser={currentUser}
            />

            <ModalNuevoCliente
                abierto={modalNuevo}
                onCerrar={() => setModalNuevo(false)}
                onCrear={handleCrear}
                responsables={responsables}
                currentUser={currentUser}
                loading={creando}
            />

            {clienteEditando && (
                <ModalEditarCliente
                    cliente={clienteEditando}
                    onCerrar={() => setClienteEditando(null)}
                    onActualizar={handleEditar}
                    onDarBaja={handleSolicitarBaja}     // ✅ abre modal de confirmación
                    onReactivar={handleReactivar}
                    responsables={responsables}
                    currentUser={currentUser}
                    loading={actualizando}
                    dandoDeBaja={dandoDeBaja}
                />
            )}

            {/* ✅ Modal de confirmación de baja */}
            <ModalConfirmarBaja
                abierto={!!clienteADarBaja}
                cliente={clienteADarBaja}
                onCerrar={() => setClienteADarBaja(null)}
                onConfirmar={handleConfirmarBaja}
                loading={dandoDeBaja}
            />
        </div>
    );
}