// components/layout/sidebar/AnimatedLogo.jsx
"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, memo } from 'react'

const BASE_PATH = '/image/empresa'
const LOGOS = [
    `${BASE_PATH}/01_vegano.png`,
    `${BASE_PATH}/02_sin_aditivos.png`,
    `${BASE_PATH}/03_origen_chileno.png`,
    `${BASE_PATH}/04_calidad_certificada.png`,
    `${BASE_PATH}/05_bienestar_integral.png`,
    `${BASE_PATH}/06_prevencion_y_salud.png`,
]
const INTERVAL_MS = 2500
const SIZE_CLASS = 'w-7 h-7'

const AnimatedLogo = memo(({ isCollapsed }) => {
    const [index, setIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (isPaused) return
        const id = setInterval(() => {
            setIndex(prev => (prev + 1) % LOGOS.length)
        }, INTERVAL_MS)
        return () => clearInterval(id)
    }, [isPaused])

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Glow sutil detrás */}
            <motion.div
                className="absolute inset-0 rounded-xl bg-amber-400/30 blur-md"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Contenedor con tamaño fijo */}
            <div className={`relative ${SIZE_CLASS} overflow-hidden`}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={LOGOS[index]}
                        src={LOGOS[index]}
                        alt="Logo empresa"
                        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="w-full h-full object-contain absolute inset-0"
                    />
                </AnimatePresence>
            </div>
        </div>
    )
})

AnimatedLogo.displayName = 'AnimatedLogo'

export default AnimatedLogo