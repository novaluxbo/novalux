// hooks/auth/useLogin.js
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

/**
 * Escapa caracteres especiales de ILIKE (% y _) para que el usuario
 * no pueda hacer wildcards accidentales.
 */
const escaparILike = (str) => str.replace(/[%_]/g, '\\$&')

export const useLogin = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const login = async (nombre, password) => {
        setLoading(true)
        setError(null)

        try {
            if (!nombre?.trim() || !password) {
                throw new Error('Usuario y contraseña son obligatorios')
            }

            const nombreLimpio = nombre.trim()
            const nombreEscapado = escaparILike(nombreLimpio)

            // 🔍 Búsqueda case-insensitive con ILIKE
            const { data: usersData, error: userError } = await supabase
                .from('usuarios')
                .select(`
                    *,
                    roles (*),
                    sucursales (*)
                `)
                .ilike('nombre', nombreEscapado)
                .eq('activo', true)

            if (userError) {
                console.error('Error de Supabase:', userError)
                throw new Error('Error al buscar usuario')
            }

            if (!usersData || usersData.length === 0) {
                throw new Error('Usuario no encontrado o inactivo')
            }

            // 🔑 Verificar contraseña con cada usuario encontrado
            // (puede haber homónimos: "Juan" y "juan")
            let usuarioValido = null

            for (const user of usersData) {
                const isPasswordValid = await bcrypt.compare(password, user.clave)
                if (isPasswordValid) {
                    usuarioValido = user
                    break
                }
            }

            if (!usuarioValido) {
                throw new Error('Contraseña incorrecta')
            }

            // Remover contraseña por seguridad
            const { clave, ...userWithoutPassword } = usuarioValido

            return userWithoutPassword

        } catch (err) {
            const errorMessage = err.message || 'Error al iniciar sesión'
            setError(errorMessage)
            return null
        } finally {
            setLoading(false)
        }
    }

    const clearError = () => setError(null)

    return { login, loading, error, clearError }
}