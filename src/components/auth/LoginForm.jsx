"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/auth/useLogin";
import { LogIn, User, Lock, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ImageSlider from "./ImageSlider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading, login: authLogin } = useAuth();
    const { login: hookLogin, loading: loginLoading, error, clearError } = useLogin();

    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [currentSecurityMessage, setCurrentSecurityMessage] = useState(0);

    const securityMessages = [
        "💊 Magnesios: el mineral esencial para tu descanso y bienestar diario",
        "❤️ Corazón y Movimiento: cuida tu sistema cardiovascular con constancia",
        "🧠 Mente y Bienestar: apoya tu equilibrio emocional y cognitivo",
        "⚡ Energía y Nutrición: potencia tu día con los nutrientes adecuados",
        "🛡️ Defensas y Antioxidantes: refuerza tus defensas naturales",
        "🌿 Bienestar Digestivo y Cuidado Específico: salud desde adentro",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSecurityMessage((prev) =>
                prev === securityMessages.length - 1 ? 0 : prev + 1
            );
        }, 4000);
        return () => clearInterval(interval);
    }, [securityMessages.length]);

    useEffect(() => {
        if (error) clearError();
    }, [nombre, password, error, clearError]);

    useEffect(() => {
        if (!authLoading && isAuthenticated()) {
            router.push('/dashboard/dashboard');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre.trim() || !password.trim()) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        const userData = await hookLogin(nombre, password);

        if (userData) {
            authLogin(userData);
            await new Promise((resolve) => setTimeout(resolve, 100));
            toast.success(`¡Bienvenid@ ${userData.nombre}! 🎉`);
            setNombre("");
            setPassword("");
            window.location.href = '/dashboard/dashboard';
        } else {
            toast.error(error || "Credenciales incorrectas");
        }
    };

    // 🖼️ Las 6 imágenes de bienestar
    const BASE_PATH = '/image/empresa';
    const empresaImages = [
        `${BASE_PATH}/01_vegano.png`,
        `${BASE_PATH}/02_sin_aditivos.png`,
        `${BASE_PATH}/03_origen_chileno.png`,
        `${BASE_PATH}/04_calidad_certificada.png`,
        `${BASE_PATH}/05_bienestar_integral.png`,
        `${BASE_PATH}/06_prevencion_y_salud.png`,
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    };

    const securityMessageVariants = {
        enter: { y: 20, opacity: 0, scale: 0.95 },
        center: {
            y: 0, opacity: 1, scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 15 },
        },
        exit: { y: -20, opacity: 0, scale: 1.05, transition: { duration: 0.3 } },
    };

    if (authLoading || isAuthenticated()) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-emerald-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
            >
                {/* Lado Izquierdo - Formulario */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        {/* Header */}
                        {/* Header con jerarquía NOVALUX / Jard Complications */}
                        <motion.div className="text-center mb-8" variants={itemVariants}>
                            {/* Ícono + Nombre del emprendimiento */}
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg shadow-amber-200">
                                    <Leaf className="w-8 h-8 text-emerald-950" />
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-700 bg-clip-text text-transparent">
                                    NOVALUX
                                </h1>
                            </div>

                            {/* Línea decorativa */}
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400"></div>
                                <span className="text-amber-500 text-lg">✦</span>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400"></div>
                            </div>

                            {/* Nombre del programa */}
                            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-[0.3em] mb-1">
                                Jard Complications
                            </p>

                            {/* Badge del sistema */}
                            <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                    Sistema de Gestión Integral
                                </span>
                            </div>
                        </motion.div>

                        {/* Formulario */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            autoComplete="off"
                            noValidate
                        >
                            {/* Usuario */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-emerald-800 mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-600" />
                                        Usuario
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ingresa tu nombre de usuario"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 text-emerald-950 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-emerald-50"
                                        disabled={loginLoading}
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        name="username-new"
                                        id="username-field"
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                </div>
                            </motion.div>

                            {/* Contraseña */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-emerald-800 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-emerald-600" />
                                        Contraseña
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 text-emerald-950 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-emerald-50"
                                        disabled={loginLoading}
                                        autoComplete="new-password"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        name="hidden-password"
                                        id="hidden-password-field"
                                        required
                                    />
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                </div>
                            </motion.div>

                            {/* Botón */}
                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    disabled={loginLoading || !nombre.trim() || !password.trim()}
                                    whileHover={{ scale: loginLoading ? 1 : 1.02 }}
                                    whileTap={{ scale: loginLoading ? 1 : 0.98 }}
                                    className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                                >
                                    {loginLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full"
                                            />
                                            Verificando...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Ingresar al Sistema
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl"
                                >
                                    <p className="text-rose-700 text-sm text-center font-medium">
                                        ⚠️ {error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Seguridad */}
                        <motion.div
                            className="mt-8 relative h-16 overflow-hidden"
                            variants={itemVariants}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSecurityMessage}
                                    variants={securityMessageVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl absolute inset-0"
                                >
                                    <p className="text-emerald-800 text-sm text-center font-medium">
                                        {securityMessages[currentSecurityMessage]}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Dots */}
                        <div className="flex justify-center gap-1 mt-4">
                            {securityMessages.map((_, index) => (
                                <motion.div
                                    key={index}
                                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${index === currentSecurityMessage
                                        ? 'bg-amber-400 w-4'
                                        : 'bg-emerald-200 w-2'
                                        }`}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => setCurrentSecurityMessage(index)}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Lado Derecho - Carrusel */}
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 hidden lg:flex flex-col justify-center items-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>

                    <motion.div
                        className="relative z-10 text-center text-white"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-emerald-50">
                            Bienvenido de vuelta
                        </h2>
                        <div className="mb-6">
                            <ImageSlider
                                images={empresaImages}
                                interval={3500}
                                height="h-80"
                                showDots={true}
                                showControls={true}
                                autoPlay={true}
                                borderRadius="rounded-3xl"
                            />
                        </div>
                        <p className="text-emerald-200 text-sm max-w-md">
                            Accede a todas las herramientas de gestión, inventario y reportes de tu empresa
                        </p>
                    </motion.div>

                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </motion.div>
        </motion.div>
    );
}