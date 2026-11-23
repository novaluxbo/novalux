// components/layout/sidebar/NavigationMenu.jsx
"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, memo, useMemo } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    Tags,
    ArrowLeftRight,
    UserCog,
    Building2,
    KeyRound,
} from 'lucide-react'

// ✅ Roles por NOMBRE, no por ID
const ROLES_ALL = ['admin', 'promotor']
const ROLES_ADMIN = ['admin']
const ROLES_PROMOTOR = ['promotor']

// ✅ Menú agrupado por categorías lógicas
const menuGroups = [
    {
        id: 'operaciones',
        label: 'Operaciones',
        items: [
            { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ROLES_ALL, path: '/dashboard/dashboard' },
            { id: 'ventas', name: 'Registro de Ventas', icon: ShoppingCart, roles: ROLES_ALL, path: '/dashboard/ventas' },
            { id: 'clientes', name: 'Cartera de Clientes', icon: Users, roles: ROLES_ALL, path: '/dashboard/clientes' },
            { id: 'productos', name: 'Cartera de Productos', icon: Package, roles: ROLES_ALL, path: '/dashboard/cartera-productos' },
            { id: 'traspasos', name: 'Traspaso - Aumentos', icon: ArrowLeftRight, roles: ROLES_ALL, path: '/dashboard/traspasos-aumentos' },
        ],
    },
    {
        id: 'administracion',
        label: 'Administración',
        items: [
            { id: 'categorias', name: 'Gestión de Categorías', icon: Tags, roles: ROLES_ADMIN, path: '/dashboard/gestion-categorias' },
            { id: 'usuarios', name: 'Gestión de Usuarios', icon: UserCog, roles: ROLES_ADMIN, path: '/dashboard/gestion-usuarios' },
            { id: 'sucursales', name: 'Gestión de Sucursales', icon: Building2, roles: ROLES_ADMIN, path: '/dashboard/gestion-sucursales' },
        ],
    },
    {
        id: 'personal',
        label: 'Personal',
        items: [
            { id: 'configuracion', name: 'Contraseña', icon: KeyRound, roles: ROLES_PROMOTOR, path: '/dashboard/ajustes-usuario' },
        ],
    },
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

// ✅ Separador visual entre grupos
const GroupLabel = memo(({ label, isCollapsed }) => {
    if (isCollapsed) {
        // En modo colapsado, mostramos una línea divisoria
        return (
            <div className="my-2 mx-2 border-t border-emerald-800/60" aria-hidden="true" />
        )
    }

    return (
        <div className="px-3 pt-4 pb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
                {label}
            </p>
        </div>
    )
})

GroupLabel.displayName = 'GroupLabel'

export default function NavigationMenu({ isCollapsed }) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    // ✅ Comparar por NOMBRE de rol, no por ID
    const rolNombre = user?.roles?.nombre?.toLowerCase() || null

    // ✅ Memoizar el filtrado por grupo
    const filteredGroups = useMemo(() => {
        if (!rolNombre) return []

        return menuGroups
            .map(group => ({
                ...group,
                items: group.items.filter(item => item.roles.includes(rolNombre)),
            }))
            // Quitamos grupos que quedaron vacíos después del filtro
            .filter(group => group.items.length > 0)
    }, [rolNombre])

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
        <nav className="space-y-1 px-2 pb-4">
            {filteredGroups.map((group, index) => (
                <div key={group.id}>
                    {/* Separador entre grupos (excepto el primero) */}
                    {index > 0 && <GroupLabel label={group.label} isCollapsed={isCollapsed} />}
                    {/* Si es el primer grupo, no mostramos label para ahorrar espacio */}
                    {index === 0 && !isCollapsed && (
                        <div className="px-3 pt-2 pb-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
                                {group.label}
                            </p>
                        </div>
                    )}
                    {index === 0 && isCollapsed && (
                        <div className="my-2 mx-2 border-t border-emerald-800/60" aria-hidden="true" />
                    )}

                    {/* Items del grupo */}
                    {group.items.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={isActive(item.path)}
                            isCollapsed={isCollapsed}
                            onClick={handleNavigation}
                        />
                    ))}
                </div>
            ))}
        </nav>
    )
}