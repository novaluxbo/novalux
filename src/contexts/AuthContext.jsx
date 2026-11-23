// contexts/AuthContext.jsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
    getItem,
    setItem,
    removeItem,
    clearApp,
    validarCurrentUser,
} from '@/lib/storage'

const AuthContext = createContext(undefined)
const CLAVE_HASH_PREFIX_KEY = 'auth_clave_hash_prefix'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessionValid, setSessionValid] = useState(true)

    const isMountedRef = useRef(true)
    const realtimeChannelRef = useRef(null)

    // ============================================================
    // Logout
    // ============================================================
    const logout = useCallback(async (silent = false, redirect = true) => {
        clearApp()
        setUser(null)
        setSessionValid(false)
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Error cerrando sesión en Supabase:', error)
        }
        if (!silent) toast.success('Sesión cerrada correctamente')
        if (redirect && typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }, [])

    // ============================================================
    // Helper: obtener prefijo del hash actual en BD
    // ============================================================
    const hashActualEnBD = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('clave')
                .eq('id', userId)
                .single()
            if (error || !data?.clave) return null
            return String(data.clave).substring(0, 12)
        } catch {
            return null
        }
    }, [])

    // ============================================================
    // Verificar integridad (polling + mount)
    // ============================================================
    const verificarIntegridadSesion = useCallback(async (userId, loginTimestamp, userData) => {
        try {
            const { data: usuario, error } = await supabase
                .from('usuarios')
                .select(`
                    updated_at, activo, clave,
                    sucursal_id, rol_id, nombre, caja,
                    roles:rol_id ( id, nombre, descripcion, created_at, updated_at ),
                    sucursales:sucursal_id ( id, nombre, direccion, telefono )
                `)
                .eq('id', parseInt(userId))
                .single()

            if (error) return true

            if (usuario.activo === false) {
                toast.error('Tu cuenta ha sido desactivada. Contacta al administrador.')
                await logout(true)
                return false
            }

            const hashGuardado = getItem(CLAVE_HASH_PREFIX_KEY)
            const hashActual = usuario.clave ? String(usuario.clave).substring(0, 12) : null

            if (hashGuardado && hashActual && hashGuardado !== hashActual) {
                toast.error('Tu contraseña fue modificada. Por favor, inicia sesión nuevamente.')
                await logout(true)
                return false
            }

            // ============================================================
            // ✅ NUEVO: sincronizar datos mutables del usuario
            // (sucursal, rol, nombre, caja, roles/sucursales anidados)
            // ============================================================
            const currentUser = getItem('currentUser')
            if (currentUser) {
                const cambio =
                    usuario.sucursal_id !== currentUser.sucursal_id ||
                    usuario.rol_id !== currentUser.rol_id ||
                    usuario.nombre !== currentUser.nombre ||
                    usuario.caja !== currentUser.caja ||
                    JSON.stringify(usuario.roles) !== JSON.stringify(currentUser.roles) ||
                    JSON.stringify(usuario.sucursales) !== JSON.stringify(currentUser.sucursales)

                if (cambio) {
                    const nuevo = {
                        ...currentUser,
                        sucursal_id: usuario.sucursal_id,
                        rol_id: usuario.rol_id,
                        nombre: usuario.nombre,
                        caja: usuario.caja,
                        roles: usuario.roles,
                        sucursales: usuario.sucursales,
                        updated_at: usuario.updated_at,
                    }
                    setItem('currentUser', nuevo)
                    if (isMountedRef.current) setUser(nuevo)
                    // Notificar al listener de la misma pestaña
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('jc:storage', {
                            detail: { key: 'currentUser', value: nuevo }
                        }))
                    }
                }
            }

            return true
        } catch {
            return true
        }
    }, [logout])

    // ============================================================
    // Helper: verificar si el cambio fue de contraseña
    // ============================================================
    const verificarSiCambioClave = useCallback(async (userId) => {
        const hashGuardado = getItem(CLAVE_HASH_PREFIX_KEY)
        const hashActual = await hashActualEnBD(userId)
        if (!hashGuardado || !hashActual) return false
        return hashGuardado !== hashActual
    }, [hashActualEnBD])

    // ============================================================
    // INIT
    // ============================================================
    useEffect(() => {
        isMountedRef.current = true
        try {
            const storedUser = getItem('currentUser')
            const loginTimestamp = getItem('auth_login_timestamp')
            const userId = getItem('auth_user_id')
            const usuarioValido = validarCurrentUser(storedUser)

            if (usuarioValido) {
                setUser(usuarioValido)
                if (userId && loginTimestamp) {
                    verificarIntegridadSesion(userId, loginTimestamp, usuarioValido)
                }
            } else if (storedUser !== null) {
                removeItem('currentUser')
                removeItem('auth_login_timestamp')
                removeItem('auth_user_id')
                removeItem(CLAVE_HASH_PREFIX_KEY)
                removeItem('auth_user_updated_at')
            }
        } catch (error) {
            console.error('❌ Error cargando usuario:', error)
            removeItem('currentUser')
            removeItem('auth_login_timestamp')
            removeItem('auth_user_id')
            removeItem(CLAVE_HASH_PREFIX_KEY)
            removeItem('auth_user_updated_at')
        } finally {
            setLoading(false)
        }
        return () => { isMountedRef.current = false }
    }, [verificarIntegridadSesion])

    useEffect(() => {
        if (!user?.id) return

        // ✅ Nombre único para evitar reutilización en StrictMode / re-render
        const channelName = `usuario-${user.id}-changes-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

        const handleUserChange = async (payload) => {
            const { eventType, new: newRow } = payload
            if (eventType !== 'UPDATE') return

            if (typeof window !== 'undefined' && window.__skipNextRealtimeLogout) {
                window.__skipNextRealtimeLogout = false
                clearTimeout(window.__skipRealtimeTimeout)
                window.__skipRealtimeTimeout = null
                setItem('auth_user_updated_at', newRow.updated_at)
                return
            }

            if (newRow.activo === false) {
                toast.error('Tu cuenta ha sido desactivada. Contacta al administrador.')
                logout(true)
                return
            }

            await new Promise(r => setTimeout(r, 150))

            const cambioClave = await verificarSiCambioClave(user.id)
            if (cambioClave) {
                toast.error('Tu contraseña fue modificada. Por favor, inicia sesión nuevamente.')
                logout(true)
                return
            }

            const hashGuardado = getItem(CLAVE_HASH_PREFIX_KEY)
            if (!hashGuardado) {
                const updatedAtGuardado = getItem('auth_user_updated_at')
                if (updatedAtGuardado && newRow.updated_at && updatedAtGuardado !== newRow.updated_at) {
                    toast.error('Tu sesión fue invalidada. Por favor, inicia sesión nuevamente.')
                    logout(true)
                    return
                }
            }

            // Rol cambiado → forzar re-login
            try {
                const { data: usuarioBD } = await supabase
                    .from('usuarios')
                    .select('rol_id')
                    .eq('id', user.id)
                    .single()
                if (usuarioBD && usuarioBD.rol_id !== user.rol_id) {
                    toast.error('Tu rol fue modificado. Por favor, inicia sesión nuevamente.')
                    logout(true)
                    return
                }
            } catch {
                // silencioso
            }

            // Resincronizar datos sin logout
            try {
                const userId = getItem('auth_user_id')
                const loginTimestamp = getItem('auth_login_timestamp')
                if (userId && loginTimestamp) {
                    await verificarIntegridadSesion(userId, loginTimestamp, user)
                }
            } catch {
                // silencioso
            }
        }

        const channel = supabase
            .channel(channelName) // ✅ nombre único
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'usuarios',
                    filter: `id=eq.${Number(user.id)}`,
                },
                handleUserChange
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('⚠️ [Realtime] Error/timeout, se usará polling como fallback')
                }
            })

        realtimeChannelRef.current = channel

        return () => {
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current)
                realtimeChannelRef.current = null
            }
        }
    }, [user?.id, logout, verificarSiCambioClave, verificarIntegridadSesion])
    // ============================================================
    // Polling fallback
    // ============================================================
    useEffect(() => {
        if (!user) return
        const interval = setInterval(async () => {
            const userId = getItem('auth_user_id')
            const loginTimestamp = getItem('auth_login_timestamp')
            if (userId && loginTimestamp) {
                const isValid = await verificarIntegridadSesion(userId, loginTimestamp, user)
                if (!isValid) await logout(true)
            }
        }, 60000)
        return () => clearInterval(interval)
    }, [user, verificarIntegridadSesion, logout])

    // ============================================================
    // Login
    // ============================================================
    const login = useCallback(async (userData) => {
        if (!userData) return { success: false, error: 'Datos inválidos' }
        const usuarioValidado = validarCurrentUser(userData)
        if (!usuarioValidado) return { success: false, error: 'Datos incompletos' }

        const { clave, ...safeUserData } = userData
        setUser(safeUserData)
        setSessionValid(true)
        const loginTimestamp = Date.now()
        setItem('currentUser', safeUserData)
        setItem('auth_login_timestamp', loginTimestamp)
        setItem('auth_user_id', safeUserData.id)
        setItem('auth_user_updated_at', safeUserData.updated_at || new Date().toISOString())

        if (clave) {
            setItem(CLAVE_HASH_PREFIX_KEY, String(clave).substring(0, 12))
        }
        return { success: true }
    }, [])

    const forceVerification = useCallback(async () => {
        if (!user) return false
        const userId = getItem('auth_user_id')
        const loginTimestamp = getItem('auth_login_timestamp')
        if (userId && loginTimestamp) {
            return await verificarIntegridadSesion(userId, loginTimestamp, user)
        }
        return true
    }, [user, verificarIntegridadSesion])

    const isAuthenticated = useCallback(() => !!user && sessionValid, [user, sessionValid])

    const value = useMemo(() => ({
        user, loading, login, logout, isAuthenticated,
        hasRole: (roleId) => user?.rol_id === roleId,
        forceVerification, sessionValid,
    }), [user, loading, login, logout, isAuthenticated, forceVerification, sessionValid])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
    return context
}