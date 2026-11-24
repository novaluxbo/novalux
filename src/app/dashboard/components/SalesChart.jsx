// src/app/dashboard/components/SalesChart.jsx
'use client';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useMemo, useCallback, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const fmtBs = (v) => {
    const n = Number(v) || 0;
    if (n >= 1_000_000) return `Bs. ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Bs. ${(n / 1_000).toFixed(0)}k`;
    return `Bs. ${n}`;
};

export default function SalesChart({ data, categories, selectedCategory, onMonthSelect, selectedMonth }) {
    const months = useMemo(() => data.map(d => d.month), [data]);
    const hoveredMonthRef = useRef(null);

    const selectedCategoryData = useMemo(
        () => categories.find(c => c.name === selectedCategory),
        [categories, selectedCategory]
    );
    const categoryColor = selectedCategoryData?.color || '#3B82F6';

    // Sin deps de hoveredMonth → no re-render por hover
    const handleHover = useCallback((event, elements) => {
        hoveredMonthRef.current = elements?.length > 0 ? months[elements[0].index] : null;
    }, [months]);

    const handleClick = useCallback((event, elements) => {
        if (elements?.length > 0 && onMonthSelect) {
            onMonthSelect(months[elements[0].index]);
        }
    }, [months, onMonthSelect]);

    const chartData = useMemo(() => {
        const values = selectedCategory
            ? data.map(item => item.categorias[selectedCategory] || 0)
            : data.map(item => item.ventas);

        return {
            labels: months,
            datasets: [{
                label: selectedCategory || 'Total Ventas',
                data: values,
                borderColor: categoryColor,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const g = ctx.createLinearGradient(0, 0, 0, 300);
                    g.addColorStop(0, `${categoryColor}40`);
                    g.addColorStop(1, `${categoryColor}05`);
                    return g;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: (ctx) => months[ctx.dataIndex] === selectedMonth ? 7 : 5,
                pointHoverRadius: 9,
                pointBackgroundColor: (ctx) =>
                    months[ctx.dataIndex] === selectedMonth ? '#F59E0B' : categoryColor,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            }],
        };
    }, [selectedCategory, data, months, categoryColor, selectedMonth]);

    const options = useMemo(() => {
        const allVals = chartData.datasets[0].data;
        const max = Math.max(...allVals, 0);
        const step = max > 0 ? Math.ceil(max / 5 / 1000) * 1000 : 1000;

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            onClick: handleClick,
            onHover: handleHover,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#F3F4F6',
                    bodyColor: '#D1D5DB',
                    borderColor: categoryColor,
                    borderWidth: 2,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${fmtBs(ctx.parsed.y)}`,
                        afterLabel: (ctx) => {
                            const i = ctx.dataIndex;
                            if (i > 0 && ctx.dataset.data[i - 1]) {
                                const prev = ctx.dataset.data[i - 1];
                                const var_ = ((ctx.parsed.y - prev) / prev) * 100;
                                return `vs mes ant.: ${var_ >= 0 ? '↑' : '↓'} ${Math.abs(var_).toFixed(1)}%`;
                            }
                            return null;
                        },
                        footer: () => '💡 Click para filtrar por este mes',
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#F3F4F6' },
                    border: { display: false },
                    ticks: {
                        callback: fmtBs,
                        font: { size: 11, weight: '500' },
                        color: '#6B7280',
                        stepSize: step,
                    },
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 11, weight: '500' }, color: '#6B7280' },
                },
            },
            elements: { line: { borderJoin: 'round' }, point: { hitRadius: 15 } },
            layout: { padding: { left: 5, right: 15, top: 20, bottom: 10 } },
        };
    }, [chartData, handleClick, handleHover, categoryColor]);

    const metrics = useMemo(() => {
        const sales = chartData.datasets[0].data;
        const valid = sales.filter(s => s > 0);
        const total = valid.reduce((a, b) => a + b, 0);
        const average = total / (valid.length || 1);
        const max = Math.max(...valid, 0);
        const min = valid.length ? Math.min(...valid) : 0;
        const last = sales[sales.length - 1] || 0;
        const prev = sales[sales.length - 2] || 0;
        const variation = prev ? ((last - prev) / prev) * 100 : 0;
        return {
            total, average, max, min, variation,
            bestMonth: months[sales.indexOf(max)] || '-',
            worstMonth: months[sales.indexOf(min)] || '-',
        };
    }, [chartData, months]);

    const isPos = metrics.variation >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
        >
            <div className="px-5 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Análisis Anual {selectedMonth && `· ${selectedMonth}`}
                    </h3>
                    <p className="text-base font-bold text-gray-800 mt-0.5">
                        {selectedCategory || 'Ventas Totales'}
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-right ${isPos ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-xs font-bold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                        {isPos ? '↑' : '↓'} {Math.abs(metrics.variation).toFixed(1)}%
                    </p>
                    <p className="text-[9px] text-gray-500">vs mes anterior</p>
                </div>
            </div>

            <div className="px-2 pt-2 pb-1" style={{ height: 280 }}>
                <Line data={chartData} options={options} />
            </div>

            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 grid grid-cols-4 gap-2 text-center">
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-semibold">Total</p>
                    <p className="text-xs font-bold text-gray-800">{fmtBs(metrics.total)}</p>
                </div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-semibold">Promedio</p>
                    <p className="text-xs font-bold text-gray-800">{fmtBs(metrics.average)}</p>
                </div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-semibold">Mejor</p>
                    <p className="text-xs font-bold text-green-600">{metrics.bestMonth}</p>
                </div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-semibold">Peor</p>
                    <p className="text-xs font-bold text-red-600">{metrics.worstMonth}</p>
                </div>
            </div>
        </motion.div>
    );
}