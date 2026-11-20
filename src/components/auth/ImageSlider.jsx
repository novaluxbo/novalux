"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider({
    images = [],
    interval = 3000,
    height = "h-64",
    showDots = true,
    showControls = true,
    autoPlay = true,
    borderRadius = "rounded-2xl",
}) {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((prev) => (prev + 1) % images.length);
    const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
    const goTo = (index) => setCurrent(index);

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(() => next(), interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, images.length]);

    if (images.length === 0) {
        return (
            <div className={`w-full ${height} ${borderRadius} bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center overflow-hidden`}>
                <div className="text-center text-emerald-500">
                    <div className="w-16 h-16 bg-emerald-300 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🖼️</span>
                    </div>
                    <p className="text-sm">No hay imágenes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Contenedor principal */}
            <div className={`relative w-full ${height} ${borderRadius} overflow-hidden group bg-emerald-950`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        className="w-full h-full relative"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        <img
                            src={images[current]}
                            alt={`Imagen ${current + 1} de ${images.length}`}
                            className="w-full h-full object-contain p-4"
                        />

                        {/* Glow sutil */}
                        <div className="absolute inset-0 bg-amber-400/5"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Controles */}
                {showControls && images.length > 1 && (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={prev}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-emerald-50/90 hover:bg-emerald-50 text-emerald-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, x: 2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={next}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-emerald-50/90 hover:bg-emerald-50 text-emerald-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </>
                )}

                {/* Contador de imágenes */}
                {images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-emerald-950/70 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full">
                        {current + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Dots */}
            {showDots && images.length > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="flex gap-2">
                        {images.map((_, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => goTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${current === index
                                    ? 'bg-amber-400 w-6'
                                    : 'bg-emerald-200/60 w-2 hover:bg-emerald-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}