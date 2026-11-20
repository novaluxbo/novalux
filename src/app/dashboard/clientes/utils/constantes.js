// src/app/dashboard/clientes/utils/constantes.js

export const TIPOS_COMERCIO = [
    'Tienda Natural',
    'Farmacia',
    'Centro de salud',
    'Gimnasio',
    'Tienda / Comercio general',
    'Profesional independiente',
    'Otro',
    'No aplica',
];

export const ORIGENES_CLIENTE = [
    'Live TikTok',
    'TikTok',
    'Instagram',
    'Facebook',
    'WhatsApp',
    'Recomendación',
    'Ferias',
    'Eventos',
    'Activación comercial',
    'Prospección',
    'Cliente actual',
    'Otro',
];

export const TIPOS_CLIENTE = ['Cliente Final', 'Mayorista'];

export const DEPARTAMENTOS_BOLIVIA = [
    'La Paz',
    'Santa Cruz',
    'Cochabamba',
    'Oruro',
    'Potosí',
    'Tarija',
    'Chuquisaca',
    'Beni',
    'Pando',
];

export const ESTADOS_CLIENTE = [
    'Prospecto',
    'Contactado',
    'Preventa',
    'Cliente',
];

// Helpers para JSONB (el backend guarda string JSON, ej: '"Farmacia"')
export const jsonbToStr = (v) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return String(v);
};

export const strToJsonb = (v) => JSON.stringify(v);