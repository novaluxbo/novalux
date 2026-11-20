// app/page.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const EMPRESA = 'NOVALUX'
const PROGRAMA = 'Jard Complications'
const DESCRIPTOR = 'Cuidado & Bienestar'

const BASE_PATH = '/image/empresa'
const LOGOS = [
  `${BASE_PATH}/01_vegano.png`,
  `${BASE_PATH}/02_sin_aditivos.png`,
  `${BASE_PATH}/03_origen_chileno.png`,
  `${BASE_PATH}/04_calidad_certificada.png`,
  `${BASE_PATH}/05_bienestar_integral.png`,
  `${BASE_PATH}/06_prevencion_y_salud.png`,
]

const INTERVALO_LOGO_MS = 800
const DURACION_FADE = 0.6
const DURACION_PANTALLA_MS = 3400

// Letras para animación (NOVALUX)
const letraVariants = {
  hidden: { opacity: 0, z: -400, scale: 0.3, rotateX: 45, rotateY: -25 },
  visible: (i) => ({
    opacity: 1, z: 0, scale: 1, rotateX: 0, rotateY: 0,
    transition: { type: 'spring', stiffness: 180, damping: 18, mass: 0.9, delay: i * 0.05 },
  }),
}

// ─────────────────────────────────────────────
// Logo con transición estilo PS4 Pro
// ─────────────────────────────────────────────
function LogoRotativo() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % LOGOS.length)
    }, INTERVALO_LOGO_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
      <motion.div
        className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AnimatePresence>
        <motion.div
          key={LOGOS[index]}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{
            opacity: { duration: DURACION_FADE, ease: 'easeInOut' },
            scale: { duration: DURACION_FADE, ease: 'easeInOut' },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={LOGOS[index]}
            alt="Novalux"
            fill
            className="object-contain"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        duration: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
      }))
    )
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => router.push('/login'), DURACION_PANTALLA_MS)
    return () => clearTimeout(timer)
  }, [router])

  const letras = useMemo(() => EMPRESA.split(''), [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 flex items-center justify-center overflow-hidden">

      {/* Partículas */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/40 blur-[1px]"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.drift, 0],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Glow central */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-amber-400/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 text-center px-4"
      >
        {/* Logo PS4 Pro */}
        <motion.div
          initial={{ z: -300, scale: 0.2, rotateX: 60, opacity: 0 }}
          animate={{ z: 0, scale: 1, rotateX: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16, duration: 0.9 }}
          style={{ perspective: 1200 }}
          className="relative w-32 h-32 sm:w-40 sm:h-40 bg-emerald-50 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-amber-400/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <LogoRotativo />
        </motion.div>

        {/* ✅ NOVALUX — nombre del emprendimiento (protagonista) */}
        <div
          className="flex flex-wrap justify-center gap-x-1 mb-1"
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        >
          {letras.map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letraVariants}
              initial="hidden"
              animate="visible"
              className="inline-block text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-br from-emerald-50 via-amber-200 to-amber-400 bg-clip-text text-transparent"
              style={{
                display: char === ' ' ? 'inline' : 'inline-block',
                transformStyle: 'preserve-3d',
                textShadow: '0 0 40px rgba(251, 191, 36, 0.4)',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>

        {/* Línea decorativa con ✦ */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
          <span className="text-amber-400 text-lg">✦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
        </motion.div>

        {/* ✅ JARD COMPLICATIONS — nombre del programa (secundario) */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-xs sm:text-sm font-semibold text-emerald-300 uppercase tracking-[0.4em] mb-2"
        >
          {PROGRAMA}
        </motion.p>

        {/* ✅ CUIDADO & BIENESTAR — descriptor (terciario) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-[10px] sm:text-xs text-amber-300/80 tracking-[0.2em] uppercase mb-6"
        >
          {DESCRIPTOR}
        </motion.p>

        {/* Línea inferior */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
          className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"
          style={{ maxWidth: '280px' }}
        />

        {/* Cargando */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex items-center justify-center gap-2 text-emerald-200 text-sm"
        >
          <span>Cargando</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}