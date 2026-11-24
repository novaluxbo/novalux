// src/app/dashboard/components/CategoryCards.jsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useMetas } from '../hooks/useMetas';

const CATEGORIAS_UNIDADES = ['Celulares', 'Ropa', 'Zapatos', 'Accesorios'];

function getCategoryIcon(name) {
    const icons = {
        'Celulares': '📱', 'Ropa': '👕', 'Electrónicos': '💻',
        'Zapatos': '👟', 'Libros': '📚', 'Accesorios': '⌚',
        'Hogar': '🏠', 'Deportes': '⚽', 'Juguetes': '🎮',
        'Salud': '💊', 'Belleza': '💄', 'Alimentos': '🍔',
        'Bebidas': '🥤', 'Sin Categoría': '📦',
    };
    return icons[name] || '📦';
}

const getProgressColor = (p, hasMeta) => {
    if (!hasMeta) return 'bg-gray-300';
    if (p >= 100) return 'bg-emerald-600';
    if (p >= 80) return 'bg-green-500';
    if (p >= 50) return 'bg-yellow-500';
    if (p >= 30) return 'bg-orange-500';
    return 'bg-red-500';
};

function MetaEditor({ categoriaId, metaType, metaValue, onSave, onCancel }) {
    const [valor, setValor] = useState(metaValue ?? '');
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const commit = () => {
        const num = Number(valor);
        if (!Number.isFinite(num) || num < 0) {
            onCancel();
            return;
        }
        onSave(categoriaId, metaType, num);
    };

    return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
                ref={inputRef}
                type="number"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') onCancel();
                }}
                onBlur={commit}
                className="w-16 text-[10px] px-1 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="0"
            />
        </div>
    );
}

export default function CategoryCards({
    categories,
    selectedCategory,
    onSelectCategory,
    currentMonth,
    selectedMonth,
}) {
    const displayMonth = selectedMonth || currentMonth;
    const currentYear = new Date().getFullYear();

    const { metas, guardarMeta } = useMetas(categories, displayMonth, currentYear);

    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);
    const carouselRef = useRef(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2200);
    };

    const handleSave = async (categoriaId, tipo, valor) => {
        setEditingId(null);
        const res = await guardarMeta(categoriaId, tipo, valor);
        if (res.success) showToast('Meta guardada ✓');
        else showToast(res.error || 'Error al guardar', 'error');
    };

    const scrollLeft = () => carouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
    const scrollRight = () => carouselRef.current?.scrollBy({ left: 220, behavior: 'smooth' });

    return (
        <div className="relative group/carousel">
            <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pt-1
                           [&::-webkit-scrollbar]:h-1.5 
                           [&::-webkit-scrollbar-thumb]:bg-gray-300 
                           [&::-webkit-scrollbar-thumb]:rounded-full 
                           [&::-webkit-scrollbar-track]:bg-transparent"
            >
                {categories.map((category, index) => {
                    // ── AQUÍ ESTABAN LAS VARIABLES QUE SE BORRARON ──
                    const defaultType = CATEGORIAS_UNIDADES.includes(category.name) ? 'quantity' : 'revenue';
                    const meta = metas[category.id];
                    const metaType = meta?.tipo || defaultType;
                    const metaValue = meta?.valor ?? null;
                    const hasMeta = metaValue !== null && metaValue > 0;

                    const realValue = metaType === 'quantity'
                        ? category.totalUnits || 0
                        : category.sales || 0;

                    const progress = hasMeta ? Math.min(Math.round((realValue / metaValue) * 100), 150) : null;
                    const progressColor = getProgressColor(progress, hasMeta);
                    const isMet = hasMeta && progress >= 100;
                    const isSelected = selectedCategory === category.name;
                    const isEditing = editingId === category.id;
                    // ─────────────────────────────────────────────────

                    return (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={() => onSelectCategory(isSelected ? null : category.name)}
                            className={`
                                relative group cursor-pointer rounded-xl transition-all duration-300
                                w-[210px] shrink-0 snap-start
                                ${isSelected
                                    ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30'
                                    : 'bg-white hover:shadow-md border border-gray-100 shadow-sm'}
                            `}
                        >
                            <div className="p-3">
                                {/* Top row: icono + badges */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${isSelected ? 'bg-white/20' : ''}`} style={isSelected ? {} : { backgroundColor: `${category.color}15` }}>
                                        {getCategoryIcon(category.name)}
                                    </div>
                                    <div className="flex gap-1">
                                        {isMet && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✅ Metas</span>}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${category.trend >= 0 ? (isSelected ? 'bg-green-500/20 text-green-100' : 'bg-green-100 text-green-700') : (isSelected ? 'bg-red-500/20 text-red-100' : 'bg-red-100 text-red-700')}`}>
                                            {category.trend >= 0 ? '↑' : '↓'} {Math.abs(category.trend)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Nombre */}
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>{category.name}</h3>
                                </div>

                                {/* Ventas */}
                                <p className={`text-2xl font-bold tracking-tight tabular-nums ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    Bs. {category.sales?.toLocaleString('es-BO') || 0}
                                </p>

                                {/* Meta + progreso */}
                                <div className="pt-1">
                                    <div className="flex items-center justify-between mb-0.5 gap-1">
                                        <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                            {metaType === 'quantity' ? 'Meta: Unidades' : 'Meta: Ingresos'}
                                        </span>
                                        {hasMeta && !isEditing && (
                                            <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : progress >= 100 ? 'text-emerald-600' : progress >= 80 ? 'text-green-600' : 'text-gray-500'}`}>
                                                {progress}%
                                            </span>
                                        )}
                                    </div>

                                    <div className={`h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/30' : 'bg-gray-100'}`}>
                                        {hasMeta ? (
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5, delay: index * 0.04 }} className={`h-full rounded-full ${progressColor}`} />
                                        ) : (
                                            <div className="h-full w-full bg-gray-200 opacity-60" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-1 gap-1" onClick={(e) => e.stopPropagation()}>
                                        <span className={`text-[10px] tabular-nums ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                            Logrado: {metaType === 'quantity' ? realValue.toLocaleString('es-BO') : `Bs. ${realValue.toLocaleString('es-BO')}`}
                                        </span>
                                        {isEditing ? (
                                            <MetaEditor categoriaId={category.id} metaType={metaType} metaValue={metaValue} onSave={handleSave} onCancel={() => setEditingId(null)} />
                                        ) : (
                                            <button onClick={() => setEditingId(category.id)} className={`text-[10px] font-semibold rounded px-1.5 py-0.5 transition ${isSelected ? 'text-white/90 hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-700'}`}>
                                                {hasMeta ? (metaType === 'quantity' ? `${metaValue.toLocaleString('es-BO')}` : `Bs. ${metaValue.toLocaleString('es-BO')}`) : '+ Meta'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Extra info */}
                                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100/50 pt-2">
                                    <span className={isSelected ? 'text-white/80' : ''}>📦 {category.totalProducts || 0}</span>
                                    <span className={isSelected ? 'text-white/80' : ''}>🏷️ {category.totalSalesCount || 0} ventas</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Flechas de navegación (opcional, aparecen si pasás el mouse) */}
            {categories.length > 3 && (
                <>
                    <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border border-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 -ml-2 hover:bg-white">
                        ◀
                    </button>
                    <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border border-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 -mr-2 hover:bg-white">
                        ▶
                    </button>
                </>
            )}

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}