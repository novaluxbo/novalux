// src/app/dashboard/ajustes-usuario/components/CambiarPassword.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    KeyIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useEditCurrentUser } from '../hooks/useEditCurrentUser';

export default function CambiarPassword() {
    const { changePassword, loading, error, success, resetStates } = useEditCurrentUser();

    const [formData, setFormData] = useState({
        claveActual: '',
        claveNueva: '',
        confirmarClave: '',
    });

    const [localError, setLocalError] = useState('');
    const [mostrarClaves, setMostrarClaves] = useState({
        actual: false,
        nueva: false,
        confirmar: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (localError) setLocalError('');
        if (error || success) resetStates();
    };

    const toggleMostrar = (campo) => {
        setMostrarClaves(prev => ({ ...prev, [campo]: !prev[campo] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validaciones locales
        if (!formData.claveActual || !formData.claveNueva || !formData.confirmarClave) {
            setLocalError('Completá todos los campos');
            return;
        }
        if (formData.claveNueva.length < 4) {
            setLocalError('La nueva contraseña debe tener al menos 4 caracteres');
            return;
        }
        if (formData.claveNueva !== formData.confirmarClave) {
            setLocalError('Las contraseñas nuevas no coinciden');
            return;
        }
        if (formData.claveActual === formData.claveNueva) {
            setLocalError('La nueva contraseña debe ser distinta a la actual');
            return;
        }

        const result = await changePassword(formData.claveActual, formData.claveNueva);

        if (result.success) {
            // ✅ Toast de éxito
            toast.success('Contraseña actualizada correctamente', {
                duration: 4000,
                icon: '🔐',
            });
            setFormData({ claveActual: '', claveNueva: '', confirmarClave: '' });
        } else {
            // ✅ Toast de error (por si el hook devuelve un error específico)
            toast.error(result.error || 'No se pudo cambiar la contraseña', {
                duration: 4000,
            });
        }
    };

    const errorMostrar = localError || error;

    const inputVariants = {
        focus: { scale: 1.01, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 md:p-8"
        >
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <motion.div
                    whileHover={{ rotate: 15 }}
                    className="p-3 bg-amber-400 rounded-xl"
                >
                    <KeyIcon className="h-7 w-7 text-emerald-950" />
                </motion.div>
                <div>
                    <h2 className="text-xl font-bold text-emerald-900">
                        Cambiar Contraseña
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Actualizá tu contraseña de acceso al sistema
                    </p>
                </div>
            </div>

            {/* Alerta inline solo para error local */}
            <AnimatePresence mode="wait">
                {errorMostrar && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl"
                    >
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                            <p className="text-red-700 text-sm font-medium">{errorMostrar}</p>
                        </div>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl"
                    >
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                            <p className="text-emerald-700 text-sm font-medium">
                                Contraseña actualizada correctamente
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Contraseña actual */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2 text-emerald-500" />
                        Contraseña actual *
                    </label>
                    <div className="relative">
                        <motion.input
                            whileFocus="focus"
                            variants={inputVariants}
                            type={mostrarClaves.actual ? 'text' : 'password'}
                            name="claveActual"
                            value={formData.claveActual}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all duration-200 placeholder:text-gray-500"
                            placeholder="Ingresá tu contraseña actual"
                        />
                        <button
                            type="button"
                            onClick={() => toggleMostrar('actual')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-600 cursor-pointer"
                            tabIndex={-1}
                        >
                            {mostrarClaves.actual ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Nueva contraseña */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2 text-emerald-500" />
                        Nueva contraseña *
                    </label>
                    <div className="relative">
                        <motion.input
                            whileFocus="focus"
                            variants={inputVariants}
                            type={mostrarClaves.nueva ? 'text' : 'password'}
                            name="claveNueva"
                            value={formData.claveNueva}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all duration-200 placeholder:text-gray-500"
                            placeholder="Mínimo 4 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => toggleMostrar('nueva')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-600 cursor-pointer"
                            tabIndex={-1}
                        >
                            {mostrarClaves.nueva ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2 text-emerald-500" />
                        Confirmar nueva contraseña *
                    </label>
                    <div className="relative">
                        <motion.input
                            whileFocus="focus"
                            variants={inputVariants}
                            type={mostrarClaves.confirmar ? 'text' : 'password'}
                            name="confirmarClave"
                            value={formData.confirmarClave}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all duration-200 placeholder:text-gray-500"
                            placeholder="Repetí la nueva contraseña"
                        />
                        <button
                            type="button"
                            onClick={() => toggleMostrar('confirmar')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-600 cursor-pointer"
                            tabIndex={-1}
                        >
                            {mostrarClaves.confirmar ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Botón */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg cursor-pointer"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full mr-2"
                            />
                            Actualizando...
                        </div>
                    ) : (
                        'Cambiar Contraseña'
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
}