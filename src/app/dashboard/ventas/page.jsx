// src/app/dashboard/ventas/page.jsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiLocalStorageListener } from '@/hooks/listener/useLocalStorageListener';
import { useVentasList } from './hooks/useVentasList';
import { useVentaCreate } from './hooks/useVentaCreate';
import { useVentaAnular } from './hooks/useVentaAnular';
import { useVentaDeposito } from './hooks/useVentaDeposito';
import Header from './components/Header';
import FiltrosVentas from './components/FiltrosVentas';
import TablaVentas from './components/TablaVentas';
import ModalNuevaVenta from './components/ModalNuevaVenta';

export default function VentasPage() {
    const { values } = useMultiLocalStorageListener(['currentUser']);
    const currentUserFromStorage = values?.currentUser || null;
    const { user: userFromContext } = useAuth();
    const user = currentUserFromStorage || userFromContext;

    const currentSucursal = useMemo(() => {
        if (!user?.sucursal_id) return null;
        return {
            id: user.sucursal_id,
            nombre: user?.sucursales?.nombre || `Sucursal ${user.sucursal_id}`,
        };
    }, [user]);

    const rolNombre = useMemo(() => {
        return user?.roles?.nombre || user?.rol_nombre || null;
    }, [user]);

    const [modalAbierto, setModalAbierto] = useState(false);

    const {
        ventas,
        loading,
        loadingMore,
        hasMore,
        filtros,
        setFiltros,
        resetFiltros,
        cargarMas,
        exportarVentas,
        totales,
        actualizarEnMemoria,
        agregarVentasEnMemoria,
    } = useVentasList({ currentUser: user, currentSucursal });

    const { crearVentasMultiples } = useVentaCreate({ currentUser: user });
    const { anularVenta, anulando } = useVentaAnular({ currentUser: user });
    const { marcarDepositado, actualizando: actualizandoDeposito } = useVentaDeposito();

    // Crear: agrega en memoria, sin refetch
    const handleCrear = useCallback(async (payload) => {
        const res = await crearVentasMultiples(payload);
        if (res.success && res.ventasCreadas?.length) {
            agregarVentasEnMemoria(res.ventasCreadas);
        }
        return res;
    }, [crearVentasMultiples, agregarVentasEnMemoria]);

    // Anular: actualiza en memoria. El useMemo del hook excluye la fila
    // automáticamente si filtros.estado === 'activa'.
    const handleAnular = useCallback(async (id, motivo) => {
        const res = await anularVenta(id, motivo);
        if (res?.success === false) return res;

        actualizarEnMemoria(id, {
            estado: 'anulada',
            motivo_anulacion: motivo,
            fecha_anulacion: new Date().toISOString(),
        });
        return res;
    }, [anularVenta, actualizarEnMemoria]);

    const handleNuevaVenta = useCallback(() => setModalAbierto(true), []);
    const handleCerrarModal = useCallback(() => setModalAbierto(false), []);

    return (
        <div className="p-4 space-y-3">
            <Header
                currentUser={user}
                currentSucursal={currentSucursal}
                rolNombre={rolNombre}
                onNuevaVenta={handleNuevaVenta}
            />

            <FiltrosVentas
                filtros={filtros}
                setFiltros={setFiltros}
                resetFiltros={resetFiltros}
                onExportar={exportarVentas}
                totales={totales}
            />

            <TablaVentas
                ventas={ventas}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onCargarMas={cargarMas}
                rolNombre={rolNombre}
                onAnular={handleAnular}
                onMarcarDepositado={marcarDepositado}
                anulando={anulando}
                actualizandoDeposito={actualizandoDeposito}
                actualizarEnMemoria={actualizarEnMemoria}
            />

            <ModalNuevaVenta
                abierto={modalAbierto}
                onCerrar={handleCerrarModal}
                onCrear={handleCrear}
                currentUser={user}
                currentSucursal={currentSucursal}
            />
        </div>
    );
}