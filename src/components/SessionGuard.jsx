// components/SessionGuard.jsx
'use client'

/**
 * Wrapper del dashboard.
 *
 * La verificación de sesión (incluido el cambio de contraseña y la
 * desactivación de cuenta en tiempo real) la maneja AuthContext:
 *
 *   - Realtime (Supabase): detecta cambios al instante (~1s).
 *   - Polling (cada 60s): fallback si Realtime falla.
 *
 * Este componente se conserva como punto de extensión para futuras
 * verificaciones específicas del dashboard (roles, permisos, etc.).
 */
export default function SessionGuard({ children }) {
    return <>{children}</>
}