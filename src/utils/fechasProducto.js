// src/utils/fechasProducto.js

/**
 * Convierte "24-12-2027", "24/12/2027" o "24.12.2027" a "2027-12-24" (ISO)
 * Devuelve null si el formato es inválido o la fecha no existe.
 */
export const parsearFechaVencimiento = (input) => {
    if (!input || typeof input !== 'string') return null;
    const limpio = input.trim().replace(/[-./]/g, '-');
    const partes = limpio.split('-');
    if (partes.length !== 3) return null;

    const [dia, mes, anio] = partes.map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || anio < 1900 || anio > 2100) return null;

    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
        return null;
    }

    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
};

/**
 * Convierte "2027-12-24" a "24-12-2027" para mostrar al usuario.
 */
export const formatearFechaVencimiento = (fechaISO) => {
    if (!fechaISO) return '';
    const partes = String(fechaISO).split('-');
    if (partes.length !== 3) return '';
    const [anio, mes, dia] = partes;
    return `${dia}-${mes}-${anio}`;
};

/**
 * Devuelve el estado de vencimiento y la info del badge.
 */
export const estadoVencimiento = (fechaISO) => {
    if (!fechaISO) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = new Date(fechaISO + 'T00:00:00');
    if (isNaN(fecha.getTime())) return null;

    const diffDias = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
        return { estado: 'vencido', dias: diffDias, label: 'Vencido', clase: 'bg-red-100 text-red-800' };
    }
    if (diffDias <= 7) {
        return { estado: 'critico', dias: diffDias, label: `Vence ${diffDias}d`, clase: 'bg-orange-100 text-orange-800' };
    }
    if (diffDias <= 30) {
        return { estado: 'pronto', dias: diffDias, label: `Vence ${diffDias}d`, clase: 'bg-amber-100 text-amber-800' };
    }
    return { estado: 'ok', dias: diffDias, label: null, clase: 'text-gray-600' };
};