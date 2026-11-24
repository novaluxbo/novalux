// src/app/dashboard/components/TopProductsList.jsx
'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const fmtBs = (v) => {
    const n = Number(v) || 0;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString('es-BO');
};

const ESTADO_COLOR = {
    'Prospecto': 'bg-gray-100 text-gray-700',
    'Contactado': 'bg-blue-100 text-blue-700',
    'Preventa': 'bg-amber-100 text-amber-700',
    'Cliente': 'bg-emerald-100 text-emerald-700',
};

const TIPO_COLOR = {
    'Mayorista': 'bg-violet-100 text-violet-700',
    'Cliente Final': 'bg-sky-100 text-sky-700',
};

function ProductRow({ product, index, maxSales, showCategory }) {
    const rank = index + 1;
    const isTop3 = rank <= 3;
    const pct = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
    const medals = { 1: 'from-yellow-500 to-amber-600', 2: 'from-gray-400 to-gray-500', 3: 'from-orange-500 to-orange-600' };
    const medalIcons = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`group relative px-4 py-2.5 hover:bg-gray-50 transition-colors ${isTop3 ? 'bg-gradient-to-r from-amber-50/50' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    {isTop3 ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medals[rank]} flex items-center justify-center shadow-sm`}>
                            <span className="text-sm">{medalIcons[rank]}</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">{rank}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                        {showCategory && product.category && (
                            <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                                style={{
                                    backgroundColor: `${product.categoryColor || '#888'}15`,
                                    color: product.categoryColor || '#555',
                                }}
                            >
                                {product.category}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600">
                        <span>{product.sales.toLocaleString('es-BO')} u</span>
                        <span className="text-gray-300">·</span>
                        <span>Bs. {fmtBs(product.revenue)}</span>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">Bs. {fmtBs(product.revenue)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            />
                        </div>
                        <span className="text-[9px] text-gray-400">{Math.round(pct)}%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ClientRow({ client, index, maxCompras, clientesById }) {
    const rank = index + 1;
    const isTop3 = rank <= 3;
    const pct = maxCompras > 0 ? (client.compras / maxCompras) * 100 : 0;
    const medals = { 1: 'from-yellow-500 to-amber-600', 2: 'from-gray-400 to-gray-500', 3: 'from-orange-500 to-orange-600' };
    const medalIcons = { 1: '🥇', 2: '🥈', 3: '🥉' };

    const info = clientesById?.get(client.id) || {};
    const estado = info.estado;
    const origen = info.origen_cliente;
    const tipo = client.tipo_cliente || info.tipo_cliente || 'Cliente Final';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`group relative px-4 py-2.5 hover:bg-gray-50 transition-colors ${isTop3 ? 'bg-gradient-to-r from-violet-50/50' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    {isTop3 ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medals[rank]} flex items-center justify-center shadow-sm`}>
                            <span className="text-sm">{medalIcons[rank]}</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">{rank}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 truncate">{client.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${TIPO_COLOR[tipo] || 'bg-gray-100 text-gray-700'}`}>
                            {tipo}
                        </span>
                        {estado && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_COLOR[estado] || 'bg-gray-100 text-gray-700'}`}>
                                {estado}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600">
                        <span>{client.unidades.toLocaleString('es-BO')} u</span>
                        {origen && (
                            <>
                                <span className="text-gray-300">·</span>
                                <span className="truncate">{origen}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">Bs. {fmtBs(client.compras)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                            />
                        </div>
                        <span className="text-[9px] text-gray-400">{Math.round(pct)}%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function TopProductsList({
    products,
    categories,
    selectedCategory,
    currentMonth = 'Diciembre',
    selectedMonth,
    // nuevos:
    view = 'products',           // 'products' | 'clients'
    clients = [],                // clientes activos en compras
    clientesById,                // Map id → cliente (para enriquecer)
    onViewChange,
}) {
    const displayMonth = selectedMonth || currentMonth;

    // Memo: productos ordenados
    const displayProducts = useMemo(() => {
        if (!products) return [];

        if (selectedCategory) {
            const list = products[selectedCategory] || [];
            const color = categories.find(c => c.name === selectedCategory)?.color;
            return list.map(p => ({ ...p, category: selectedCategory, categoryColor: color }));
        }

        const all = [];
        Object.keys(products).forEach(cat => {
            const list = products[cat];
            if (!Array.isArray(list)) return;
            const color = categories.find(c => c.name === cat)?.color;
            list.forEach(p => all.push({ ...p, category: cat, categoryColor: color }));
        });
        return all.sort((a, b) => b.sales - a.sales).slice(0, 10);
    }, [products, selectedCategory, categories]);

    const displayClients = useMemo(() => clients.slice(0, 10), [clients]);

    const isClientsView = view === 'clients';
    const isGlobalView = !selectedCategory && !isClientsView;

    const maxSales = useMemo(
        () => displayProducts.reduce((m, p) => Math.max(m, p.sales), 0) || 1,
        [displayProducts]
    );
    const maxCompras = useMemo(
        () => displayClients.reduce((m, c) => Math.max(m, c.compras), 0) || 1,
        [displayClients]
    );

    const totalRevenue = useMemo(
        () => displayProducts.reduce((s, p) => s + (p.revenue || 0), 0),
        [displayProducts]
    );
    const totalCompras = useMemo(
        () => displayClients.reduce((s, c) => s + (c.compras || 0), 0),
        [displayClients]
    );

    const list = isClientsView ? displayClients : displayProducts;
    const hasItems = list.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
        >
            {/* Header */}
            <div className={`
                px-4 py-3 border-b
                ${isClientsView
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100'
                    : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100'}
            `}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                            ${isClientsView
                                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                                : 'bg-gradient-to-br from-orange-400 to-amber-500'}
                        `}>
                            <span className="text-white text-lg">{isClientsView ? '👥' : '🏆'}</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 truncate">
                                {isClientsView
                                    ? `Top Clientes ${displayMonth}`
                                    : `Top Productos ${displayMonth}`}
                            </h3>
                            <p className="text-[10px] text-gray-500 truncate">
                                {isClientsView
                                    ? `${displayClients.length} clientes activos`
                                    : isGlobalView
                                        ? `Top 10 general · ${displayProducts.length}`
                                        : `${selectedCategory} · ${displayProducts.length}`}
                            </p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-white/70 rounded-lg p-0.5 shrink-0">
                        <button
                            onClick={() => onViewChange?.('products')}
                            className={`text-[10px] font-semibold px-2 py-1 rounded transition ${!isClientsView ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => onViewChange?.('clients')}
                            className={`text-[10px] font-semibold px-2 py-1 rounded transition ${isClientsView ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            Clientes
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto max-h-[380px]">
                {!hasItems ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="text-5xl mb-3">{isClientsView ? '👤' : '📭'}</div>
                        <p className="text-sm text-gray-500 font-medium">
                            {isClientsView ? 'Sin compras registradas' : 'No hay productos'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {isClientsView
                                ? `No hubo compras en ${displayMonth}`
                                : selectedCategory
                                    ? `No hay ventas en ${selectedCategory} para ${displayMonth}`
                                    : `No hay ventas en ${displayMonth}`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {isClientsView
                            ? displayClients.map((client, i) => (
                                <ClientRow
                                    key={client.id}
                                    client={client}
                                    index={i}
                                    maxCompras={maxCompras}
                                    clientesById={clientesById}
                                />
                            ))
                            : displayProducts.map((product, i) => (
                                <ProductRow
                                    key={`${product.category}-${product.name}`}
                                    product={product}
                                    index={i}
                                    maxSales={maxSales}
                                    showCategory={isGlobalView}
                                />
                            ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {hasItems && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">
                            {isClientsView
                                ? `${displayClients.length} de ${clients.length} clientes`
                                : `${displayProducts.length} productos`}
                        </span>
                        <span className="font-semibold text-gray-800">
                            Total: Bs. {fmtBs(isClientsView ? totalCompras : totalRevenue)}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}