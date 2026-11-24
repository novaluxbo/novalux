// src/app/dashboard/page.jsx
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, ChevronDown } from 'lucide-react';

import { useDashboardData } from './hooks/useDashboardData';
import { useClientes } from './hooks/useClientes';

import KpiRow from './components/KpiRow';
import CategoryCards from './components/CategoryCards';
import SalesChart from './components/SalesChart';
import ClientsCard from './components/ClientsCard';
import TopProductsList from './components/TopProductsList';
import SkeletonDashboard from './components/SkeletonDashboard';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function EmptyState({ title, subtitle, icon = '📊' }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">
                <div className="text-5xl mb-3">{icon}</div>
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 max-w-md w-full p-8 text-center">
                <div className="text-5xl mb-3">⚠️</div>
                <h2 className="text-lg font-bold text-gray-800">Error al cargar</h2>
                <p className="text-sm text-gray-500 mt-1 mb-4">{message}</p>
                <button onClick={onRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    Reintentar
                </button>
            </div>
        </div>
    );
}

function relTime(date) {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'hace unos segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('es-BO');
}

function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (e) => {
            if (!ref.current || ref.current.contains(e.target)) return;
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

export default function DashboardPage() {
    const {
        dashboardData, loading, error, currentSucursal, lastUpdated,
        getCategoriesByMonth, getTopProductsByMonth, getClientsByMonth, refetch,
    } = useDashboardData();

    const {
        clientesById, resumen: clientesResumen, loading: clientesLoading,
        error: clientesError, refetch: refetchClientes,
    } = useClientes();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [bottomView, setBottomView] = useState('products');
    const [monthPickerOpen, setMonthPickerOpen] = useState(false);
    const monthPickerRef = useRef(null);

    useClickOutside(monthPickerRef, () => setMonthPickerOpen(false));

    const categories = useMemo(() => {
        if (!dashboardData) return [];
        return selectedMonth ? getCategoriesByMonth(selectedMonth) : dashboardData.categories;
    }, [dashboardData, selectedMonth, getCategoriesByMonth]);

    const topProducts = useMemo(() => {
        if (!dashboardData) return {};
        return selectedMonth ? getTopProductsByMonth(selectedMonth) : dashboardData.topProducts;
    }, [dashboardData, selectedMonth, getTopProductsByMonth]);

    const clientsInMonth = useMemo(() => {
        if (!dashboardData) return [];
        return getClientsByMonth(selectedMonth);
    }, [dashboardData, selectedMonth, getClientsByMonth]);

    const monthlySales = dashboardData?.monthlySales || [];

    const handleSelectCategory = useCallback((name) => {
        setSelectedCategory(name);
        setBottomView('products');
    }, []);

    const handleMonthSelect = useCallback((month) => {
        setSelectedMonth(prev => (prev === month ? null : month));
        setBottomView('products');
    }, []);

    const handleSelectClients = useCallback(() => {
        setBottomView('clients');
        setSelectedCategory(null);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
        refetchClientes();
    }, [refetch, refetchClientes]);

    if (error && !dashboardData) return <div className="p-6"><ErrorState message={error} onRetry={refetch} /></div>;
    if (!loading && !currentSucursal) return <div className="p-6"><EmptyState icon="🏢" title="Sin sucursal seleccionada" subtitle="Elegí una sucursal para ver el dashboard." /></div>;
    if (loading && !dashboardData) return <SkeletonDashboard />;

    return (
        <div className="min-h-[100dvh] bg-[#f8fafc] flex flex-col">
            <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-4 flex flex-col gap-4">

                {/* ───── Header ───── */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Dashboard de Ventas</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="font-medium text-emerald-700">{currentSucursal?.nombre || 'Sucursal'}</span>
                            <span>•</span>
                            <span>{dashboardData?.stats?.totalVentas || 0} ventas totales</span>
                            <span>•</span>
                            <span className="font-medium text-emerald-700">Bs. {dashboardData?.stats?.totalIngresos?.toLocaleString('es-BO') || 0} ingresos</span>
                            {lastUpdated && (
                                <span className="flex items-center gap-1 ml-2">
                                    <Clock className="w-3 h-3" /> {relTime(lastUpdated)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative" ref={monthPickerRef}>
                            <button onClick={() => setMonthPickerOpen(o => !o)} className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm">
                                📅 {selectedMonth || 'Año completo'} <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <AnimatePresence>
                                {monthPickerOpen && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-30 w-40 max-h-64 overflow-y-auto">
                                        <button onClick={() => { setSelectedMonth(null); setMonthPickerOpen(false); }} className={`w-full text-left text-xs px-3 py-2 hover:bg-gray-50 ${!selectedMonth ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>Año completo</button>
                                        {MESES.map(m => (
                                            <button key={m} onClick={() => { setSelectedMonth(m); setMonthPickerOpen(false); }} className={`w-full text-left text-xs px-3 py-2 hover:bg-gray-50 ${selectedMonth === m ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-gray-700'}`}>{m}</button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden sm:inline">Actualizar</span>
                        </button>
                    </div>
                </div>

                {(!loading && dashboardData && !dashboardData.categories?.length) ? (
                    <div className="text-center py-10 text-gray-500 text-sm">No hay categorías ni datos de ventas para mostrar.</div>
                ) : (
                    /* ───── Layout Principal (2 Columnas) ───── */
                    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

                        {/* ───── COLUMNA IZQUIERDA (Categorías + Gráfica) ───── */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-0">

                            {/* Carrusel Horizontal de Categorías */}
                            <div className="shrink-0">
                                <CategoryCards
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={handleSelectCategory}
                                    currentMonth={dashboardData?.currentMonth || 'Diciembre'}
                                    selectedMonth={selectedMonth}
                                />
                            </div>

                            {/* Gráfica */}
                            <div className="flex-1 min-h-[300px]">
                                <SalesChart
                                    data={monthlySales}
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    selectedMonth={selectedMonth}
                                    onMonthSelect={handleMonthSelect}
                                />
                            </div>
                        </div>

                        {/* ───── COLUMNA DERECHA (Card Clientes + Lista Top) ───── */}
                        <div className="w-full lg:w-[340px] xl:w-[380px] flex flex-col gap-4 shrink-0">

                            {/* Card de Clientes (Fijo arriba) */}
                            <div className="shrink-0">
                                <ClientsCard
                                    resumen={clientesResumen}
                                    loading={clientesLoading}
                                    onSelectClients={handleSelectClients}
                                    active={bottomView === 'clients'}
                                />
                            </div>

                            {/* Lista Top (Productos o Clientes) */}
                            <div className="flex-1 min-h-0">
                                <TopProductsList
                                    products={topProducts}
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    currentMonth={dashboardData?.currentMonth || 'Diciembre'}
                                    selectedMonth={selectedMonth}
                                    view={bottomView}
                                    clients={clientsInMonth}
                                    clientesById={clientesById}
                                    onViewChange={setBottomView}
                                />
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}