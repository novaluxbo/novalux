// components/layout/sidebar/SidebarHeader.jsx
"use client"

import { MapPin } from 'lucide-react'
import { useSucursal } from '@/contexts/SucursalContext'
import { useMultiLocalStorageListener } from '@/hooks/listener/useLocalStorageListener'
import { useCallback, useMemo, memo, useEffect, useRef } from 'react'
import AnimatedLogo from './AnimatedLogo'   // ✅ nuevo import

const SidebarHeader = memo(({ isCollapsed }) => {
    const {
        sucursalSeleccionada,
        sucursales,
        loading,
        selectSucursal
    } = useSucursal()

    // ✅ Ref para poder cerrar el dropdown nativo programáticamente
    const selectRef = useRef(null)

    const handleSucursalChange = useCallback((e) => {
        const selectedId = parseInt(e.target.value)
        const sucursal = sucursales.find(s => s.id === selectedId)
        if (sucursal) {
            selectSucursal(sucursal.id, sucursal.nombre)
        }
    }, [sucursales, selectSucursal])

    const { values: localStorageValues } = useMultiLocalStorageListener([
        'currentUser',
        'sucursalSeleccionada'
    ]);

    const currentUser = useMemo(() => {
        return localStorageValues.currentUser || null;
    }, [localStorageValues.currentUser]);

    const isSupervisorOrAdmin = useMemo(() => {
        const userRole = currentUser?.roles?.nombre?.toLowerCase();
        return userRole === 'admin' || userRole === 'supervisor';
    }, [currentUser]);

    // ✅ Cerrar el dropdown nativo cuando el sidebar se colapsa
    useEffect(() => {
        if (isCollapsed && selectRef.current) {
            selectRef.current.blur()
        }
    }, [isCollapsed])

    // ✅ Cerrar el dropdown nativo al hacer clic fuera del select
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                selectRef.current.blur()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!sucursalSeleccionada && currentUser && sucursales.length > 0 && !loading) {
            if (isSupervisorOrAdmin) {
                const primeraSucursalActiva = sucursales.find(s => s.activo === true || s.activo === 1);
                if (primeraSucursalActiva) {
                    selectSucursal(primeraSucursalActiva.id, primeraSucursalActiva.nombre);
                }
            } else {
                const userSucursalId = currentUser?.sucursal_id;
                const userSucursal = sucursales.find(s => s.id === userSucursalId && (s.activo === true || s.activo === 1));

                if (userSucursal) {
                    selectSucursal(userSucursal.id, userSucursal.nombre);
                } else if (sucursales.length > 0) {
                    const primeraSucursal = sucursales.find(s => s.activo === true || s.activo === 1);
                    if (primeraSucursal) {
                        selectSucursal(primeraSucursal.id, primeraSucursal.nombre);
                    }
                }
            }
        }
    }, [currentUser, sucursales, loading, sucursalSeleccionada, selectSucursal, isSupervisorOrAdmin]);

    return (
        <div className="border-b border-emerald-800 bg-gradient-to-r from-emerald-900 to-emerald-950">
            {/* Header con altura fija */}
            <div className={`${isCollapsed ? 'py-3 px-4' : 'py-4 px-6'} transition-all duration-200`}>
                <div className="flex items-center gap-3">
                    {/* ✅ Logo animado (reemplaza el <img> estático) */}
                    <div className="bg-emerald-50 p-2 rounded-xl flex-shrink-0">
                        <AnimatedLogo isCollapsed={isCollapsed} />
                    </div>

                    <div className={`min-w-0 flex-1 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        <h1 className="text-lg font-bold text-emerald-50 truncate">
                            Jard Complications
                        </h1>
                        <p className="text-emerald-300 text-xs truncate">
                            {sucursalSeleccionada?.nombre || 'Torre Fuerte'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector de sucursal */}
            {isSupervisorOrAdmin && (
                <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-32 opacity-100'}`}>
                    <div className="px-4 pb-4">
                        <div className="bg-emerald-800/50 backdrop-blur-sm rounded-lg p-3 border border-emerald-700">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <label className="text-emerald-200 text-sm font-medium truncate">
                                    Cambiar Sucursal
                                </label>
                            </div>

                            {loading ? (
                                <div className="text-center py-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mx-auto"></div>
                                </div>
                            ) : (
                                <select
                                    ref={selectRef}
                                    value={sucursalSeleccionada?.id || ''}
                                    onChange={handleSucursalChange}
                                    className="w-full bg-emerald-950 border border-emerald-700 rounded-lg px-3 py-2 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                                >
                                    <option value="">Seleccionar sucursal</option>
                                    {sucursales
                                        .filter(sucursal => {
                                            if (!sucursal?.activo) return false;
                                            const userRole = currentUser?.roles?.nombre;
                                            if (!userRole) return false;
                                            if (userRole === 'admin') return true;
                                            const userSucursalId = currentUser?.sucursal_id;
                                            return sucursal.id === userSucursalId;
                                        })
                                        .map((sucursal) => (
                                            <option key={sucursal.id} value={sucursal.id}>
                                                {sucursal.nombre}
                                            </option>
                                        ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;