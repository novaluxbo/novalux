// components/layout/sidebar/LogoutButton.jsx
"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// Animaciones del modal
// ─────────────────────────────────────────────
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
}

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: { delay: 0.08, type: 'spring', stiffness: 200, damping: 15 },
    },
}

// ─────────────────────────────────────────────
// Modal de confirmación
// ─────────────────────────────────────────────
function LogoutModal({ user, onCancel, onConfirm }) {
    return (
        <>
            <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onCancel}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white shadow-2xl rounded-2xl p-6 border border-emerald-200 w-full max-w-md pointer-events-auto"
                >
                    <div className="text-center">
                        <motion.div
                            variants={iconVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <LogOut className="w-7 h-7 text-rose-600" />
                        </motion.div>

                        <h3 className="text-xl font-bold text-emerald-950 mb-2">
                            Cerrar Sesión
                        </h3>
                        <p className="text-emerald-700 mb-1">
                            ¿Estás seguro de que quieres salir?
                        </p>
                        <p className="text-sm text-emerald-600 mb-6">
                            Usuario: <span className="font-semibold">{user?.nombre || 'Usuario'}</span>
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-2.5 px-4 border border-emerald-300 text-emerald-800 rounded-xl font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                                Sí, Salir
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function LogoutButton({ isCollapsed }) {
    const { logout, user } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleCancel = () => closeModal()

    const handleConfirm = async () => {
        closeModal()
        const loadingToast = toast.loading('Cerrando sesión...', {
            position: 'top-center',
        })

        try {
            await logout()
            toast.success(`¡Hasta pronto ${user?.nombre || ''}! 👋`, {
                id: loadingToast,
                duration: 1500,
            })
            // ⚠️ No hace falta router.push: logout() ya redirige a /login
        } catch (error) {
            toast.error('Error al cerrar sesión', { id: loadingToast })
        }
    }

    // ─────────────────────────────────────────────
    // Skeleton de carga (mientras user es null)
    // ─────────────────────────────────────────────
    if (!user) {
        return (
            <motion.div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-950" />
                </div>
                {!isCollapsed && (
                    <div className="h-4 w-24 bg-emerald-800 rounded animate-pulse" />
                )}
                {!isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 animate-pulse" />
                )}
            </motion.div>
        )
    }

    return (
        <>
            <motion.div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} relative`}>
                {/* Avatar (icono por defecto) */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-500">
                    <User className="w-5 h-5 text-emerald-950" />
                </div>

                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            key="user-info"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="min-w-0 w-full flex-1"
                        >
                            <p className="font-medium text-emerald-50 text-sm truncate">
                                {user.nombre || 'Usuario'}
                            </p>
                            <p className="text-xs text-emerald-300 truncate">
                                {user.roles?.nombre || '—'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Botón Salir */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openModal}
                    className={`
                        flex items-center gap-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${isCollapsed
                            ? 'p-2 bg-rose-950 text-rose-300 hover:bg-rose-900'
                            : 'px-2.5 py-1.5 text-emerald-300 hover:bg-rose-950 hover:text-rose-300'
                        }
                    `}
                >
                    <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    {!isCollapsed && (
                        <span className="text-sm font-medium">Salir</span>
                    )}
                </motion.button>
            </motion.div>

            {/* Modal con AnimatePresence */}
            <AnimatePresence>
                {isModalOpen && (
                    <LogoutModal
                        user={user}
                        onCancel={handleCancel}
                        onConfirm={handleConfirm}
                    />
                )}
            </AnimatePresence>
        </>
    )
}