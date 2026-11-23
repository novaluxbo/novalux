// src/config/metas.js
import { getItem, setItem } from '@/lib/storage';

export const METAS = {
    // Configuración por categoría: qué tipo de meta usar
    config: {
        'Celulares': { type: 'quantity', label: 'Unidades', suffix: 'und', icon: '📱' },
        'Ropa': { type: 'quantity', label: 'Unidades', suffix: 'und', icon: '👕' },
        'Electrónicos': { type: 'revenue', label: 'Ingresos', suffix: '$', icon: '💻' },
        'Zapatos': { type: 'quantity', label: 'Unidades', suffix: 'und', icon: '👟' },
        'Libros': { type: 'revenue', label: 'Ingresos', suffix: '$', icon: '📚' },
        'Accesorios': { type: 'quantity', label: 'Unidades', suffix: 'und', icon: '⌚' },
        'Hogar': { type: 'revenue', label: 'Ingresos', suffix: '$', icon: '🏠' },
        'default': { type: 'quantity', label: 'Unidades', suffix: 'und', icon: '📦' }
    },

    // Metas mensuales (valores numéricos)
    mensuales: {
        'Enero': {
            'Celulares': 100,
            'Ropa': 200,
            'Electrónicos': 50000,
            'Zapatos': 150,
            'Libros': 8000
        },
        'Febrero': {
            'Celulares': 110,
            'Ropa': 210,
            'Electrónicos': 55000,
            'Zapatos': 160,
            'Libros': 8500
        },
        'Marzo': {},
        'Abril': {},
        'Mayo': {},
        'Junio': {},
        'Julio': {},
        'Agosto': {},
        'Septiembre': {},
        'Octubre': {},
        'Noviembre': {},
        'Diciembre': {}
    }
};

// Obtener configuración de una categoría
export const getCategoryConfig = (categoryName) => {
    return METAS.config[categoryName] || METAS.config.default;
};

// Obtener meta para una categoría y mes (puede ser null si no hay meta asignada)
export const getMeta = (month, categoryName, metas = null) => {
    const metasData = metas || METAS;
    const monthData = metasData.mensuales?.[month];

    if (!monthData) return null;

    const metaValue = monthData[categoryName];

    if (metaValue !== undefined && metaValue !== null) {
        return metaValue;
    }

    if (monthData.default !== undefined && monthData.default !== null) {
        return monthData.default;
    }

    return null;
};

// Obtener el valor real según el tipo de meta
export const getRealValue = (category, metaType) => {
    if (!category) return 0;

    if (metaType === 'quantity') {
        return category.totalUnits || 0;
    } else if (metaType === 'revenue') {
        return category.sales || 0;
    }

    return category.sales || 0;
};

// Formatear valores para mostrar
export const getFormat = (type, value) => {
    if (value === null || value === undefined) {
        return 'Sin meta';
    }

    if (type === 'quantity') {
        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
        return value.toLocaleString();
    } else {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
        return `$${value.toLocaleString()}`;
    }
};

// Obtener el sufijo según el tipo de meta
export const getMetaSuffix = (type) => {
    if (type === 'quantity') {
        return 'und';
    } else {
        return 'ingresos';
    }
};

// Obtener la etiqueta completa para mostrar
export const getMetaLabel = (categoryName, type) => {
    const config = getCategoryConfig(categoryName);
    const suffix = getMetaSuffix(type);

    if (type === 'quantity') {
        return `🎯 Meta (${suffix})`;
    } else {
        return `💰 Meta (${suffix})`;
    }
};

// ================================
// Persistencia (localStorage con namespace jc_)
// ================================
export const loadMetas = () => {
    // 1. Intentar leer con el prefijo nuevo
    let saved = getItem('metas_config');

    // 2. Si no hay, intentar migrar del formato viejo (sin prefijo)
    if (!saved && typeof window !== 'undefined') {
        const legacy = window.localStorage.getItem('metas_config');
        if (legacy) {
            try {
                const parsed = JSON.parse(legacy);
                if (parsed && typeof parsed === 'object') {
                    setItem('metas_config', parsed);
                    window.localStorage.removeItem('metas_config');
                    console.log('[metas] migrado de formato legacy → jc_metas_config');
                    saved = parsed;
                }
            } catch (e) {
                console.warn('[metas] legacy corrupto, se ignora:', e);
            }
        }
    }

    // 3. Validar y devolver
    if (saved && typeof saved === 'object') {
        return saved;
    }
    return METAS;
};

export const saveMetas = (metas) => {
    setItem('metas_config', metas);
};

export const updateMeta = (month, categoryName, value, type) => {
    const metas = loadMetas();

    if (!metas.mensuales[month]) {
        metas.mensuales[month] = {};
    }

    if (value === null || value === undefined || value === '') {
        delete metas.mensuales[month][categoryName];
    } else {
        metas.mensuales[month][categoryName] = Number(value);
    }

    if (type) {
        if (!metas.config) metas.config = {};
        metas.config[categoryName] = {
            type,
            label: type === 'quantity' ? 'Unidades' : 'Ingresos',
            suffix: type === 'quantity' ? 'und' : '$',
            icon: metas.config[categoryName]?.icon || (type === 'quantity' ? '📦' : '💰')
        };
    }

    saveMetas(metas);
    return metas;
};

// Obtener progreso (maneja metas null)
export const getProgress = (realValue, meta) => {
    if (!meta || meta === 0 || meta === null) return null;
    return Math.min(Math.round((realValue / meta) * 100), 150);
};

// Obtener color del progreso
export const getProgressColor = (progress, metaExists) => {
    if (!metaExists) return 'bg-gray-300';
    if (progress >= 100) return 'bg-emerald-600';
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-orange-500';
    return 'bg-red-500';
};

// Obtener texto completo de la meta mostrada
export const getMetaDisplayText = (categoryName, type, value) => {
    const config = getCategoryConfig(categoryName);
    const suffix = getMetaSuffix(type);
    const formattedValue = getFormat(type, value);

    if (type === 'quantity') {
        return `${formattedValue} ${suffix}`;
    } else {
        return `${formattedValue} ${suffix}`;
    }
};