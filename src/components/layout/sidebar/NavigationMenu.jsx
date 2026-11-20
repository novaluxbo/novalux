// components/layout/sidebar/NavigationMenu.jsx
"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, memo } from 'react'
import {
    ShoppingCart,
    Package,
    Users,
    Settings,
} from 'lucide-react'

// Roles frecuentes
const ROLES_ALL = [1, 2, 3]
const ROLES_ADMIN = [1]

const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ShoppingCart, roles: ROLES_ALL, path: '/dashboard/dashboard' },
    { id: 'ventas', name: 'Registro de Ventas', icon: ShoppingCart, roles: ROLES_ALL, path: '/dashboard/ventas' },
    { id: 'clientes', name: 'Cartera de Clientes', icon: Package, roles: ROLES_ALL, path: '/dashboard/clientes' },
    { id: 'productos', name: 'Cartera de Productos', icon: Package, roles: ROLES_ALL, path: '/dashboard/gestion-productos' },
    { id: 'categorias', name: 'Gestión de Categorías', icon: Package, roles: ROLES_ADMIN, path: '/dashboard/gestion-categorias' },
    { id: 'traspasos', name: 'Traspaso - Aumentos', icon: Package, roles: ROLES_ALL, path: '/dashboard/traspasos-aumentos' },
    { id: 'usuarios', name: 'Gestión de Usuarios', icon: Users, roles: ROLES_ADMIN, path: '/dashboard/gestion-usuarios' },
    { id: 'sucursales', name: 'Gestión de Sucursales', icon: Package, roles: ROLES_ADMIN, path: '/dashboard/gestion-sucursales' },
    { id: 'configuracion', name: 'Contraseña', icon: Settings, roles: [2, 3], path: '/dashboard/ajustes-usuario' },
]

const MenuItem = memo(({ item, isActive, isCollapsed, onClick }) => {
    const Icon = item.icon

    return (
        <button
            onClick={() => onClick(item.path)}
            className={`
                flex items-center cursor-pointer 
                ${isCollapsed ? 'justify-center px-1 w-full' : 'px-3 w-full'} 
                py-2.5 text-emerald-200 rounded-lg 
                transition-all duration-200
                hover:bg-emerald-800 hover:text-amber-400
                group relative
                ${isActive ? 'bg-emerald-800 text-amber-400' : ''}
            `}
        >
            {/* Indicador de página activa */}
            {isActive && !isCollapsed && (
                <div className="absolute -left-1 w-1 h-6 bg-amber-400 rounded-full transition-all duration-200" />
            )}

            {/* Icono */}
            <Icon
                className={`
                    ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'}
                    transition-colors duration-200
                    ${isActive ? 'text-amber-400' : 'text-emerald-400 group-hover:text-amber-400'}
                `}
            />

            {/* Punto indicador colapsado */}
            {isActive && isCollapsed && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-emerald-900 transition-all duration-200" />
            )}

            {/* Texto */}
            <span className={`
                font-medium text-sm whitespace-nowrap
                transition-all duration-200
                ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}
            `}>
                {item.name}
            </span>
        </button>
    )
})

MenuItem.displayName = 'MenuItem'

export default function NavigationMenu({ isCollapsed }) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const filteredItems = menuItems.filter(item =>
        item.roles.includes(user?.rol_id)
    )

    const isActive = useCallback((path) => {
        if (!pathname) return false
        if (pathname === path) return true
        if (path !== '/dashboard' && pathname.startsWith(path)) return true
        return false
    }, [pathname])

    const handleNavigation = useCallback((path) => {
        router.push(path)
    }, [router])

    return (
        <nav className="space-y-1 px-2">
            {filteredItems.map((item) => (
                <MenuItem
                    key={item.id}
                    item={item}
                    isActive={isActive(item.path)}
                    isCollapsed={isCollapsed}
                    onClick={handleNavigation}
                />
            ))}
        </nav>
    )
}