'use client';

import { useState } from 'react';
import { useSucursal } from '@/contexts/SucursalContext';
import { useMultiLocalStorageListener } from '@/hooks/listener/useLocalStorageListener';
import SucursalesTable from './components/SucursalesTable';
import Header from './components/Header';
import NuevoSucursal from './components/NuevoSucursal';
import EditarSucursal from './components/EditarSucursal';

export default function GestionSucursales() {
    const [vistaActual, setVistaActual] = useState('lista');
    const [sucursalEditando, setSucursalEditando] = useState(null);

    const { values } = useMultiLocalStorageListener(['currentUser']);
    const currentUser = values.currentUser;

    const {
        sucursales,
        loading,
        sucursalSeleccionada,
        createSucursal,
        updateSucursal,
    } = useSucursal();

    const handleNuevaSucursal = () => setVistaActual('nuevo');

    const handleEditarSucursal = (sucursal) => {
        setSucursalEditando(sucursal);
        setVistaActual('editar');
    };

    const handleVolverALista = () => {
        setVistaActual('lista');
        setSucursalEditando(null);
    };

    const renderVista = () => {
        switch (vistaActual) {
            case 'nuevo':
                return (
                    <NuevoSucursal
                        onCancelar={handleVolverALista}
                        onSucursalCreada={handleVolverALista}
                        createSucursal={createSucursal}
                        usuarioId={currentUser?.id}
                    />
                );
            case 'editar':
                return (
                    <EditarSucursal
                        sucursal={sucursalEditando}
                        onCancelar={handleVolverALista}
                        onSucursalActualizada={handleVolverALista}
                        updateSucursal={updateSucursal}
                        usuarioId={currentUser?.id}
                    />
                );
            default:
                return (
                    <SucursalesTable
                        sucursales={sucursales}
                        loading={loading}
                        onEditarSucursal={handleEditarSucursal}
                        sucursalSeleccionada={sucursalSeleccionada}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            <Header onNuevaSucursal={handleNuevaSucursal} />
            <div className="max-w-7xl mx-auto">
                {renderVista()}
            </div>
        </div>
    );
}