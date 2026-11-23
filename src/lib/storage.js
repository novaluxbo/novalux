// lib/storage.js
// Capa central de acceso a localStorage con namespace por app.
// Evita colisiones entre proyectos que comparten el mismo origen.

const APP_PREFIX = 'jc_'; // Jard Complications

/**
 * Construye la clave final con prefijo.
 */
const k = (key) => `${APP_PREFIX}${key}`;

/**
 * Lee y parsea un valor. Devuelve null si no existe o está corrupto.
 */
export function getItem(key, fallback = null) {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(k(key));
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

/**
 * Guarda un valor serializado.
 */
export function setItem(key, value) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(k(key), JSON.stringify(value));
        // Notificar a otros listeners de la misma pestaña
        window.dispatchEvent(new CustomEvent('jc:storage', { detail: { key, value } }));
    } catch (err) {
        console.error(`[storage] Error guardando "${key}":`, err);
    }
}

/**
 * Elimina una clave.
 */
export function removeItem(key) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(k(key));
    window.dispatchEvent(new CustomEvent('jc:storage', { detail: { key, value: null } }));
}

/**
 * Borra TODAS las claves de esta app (solo las que empiezan con el prefijo).
 */
export function clearApp() {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(window.localStorage).filter(key => key.startsWith(APP_PREFIX));
    keys.forEach(key => window.localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent('jc:storage', { detail: { key: '*', value: null } }));
}

/**
 * Lista las claves de esta app (útil para debug).
 */
export function listKeys() {
    if (typeof window === 'undefined') return [];
    return Object.keys(window.localStorage)
        .filter(key => key.startsWith(APP_PREFIX))
        .map(key => key.slice(APP_PREFIX.length));
}

/**
 * Valida que un currentUser tenga la forma mínima esperada.
 * Si no, devuelve null (forzando re-login).
 */
export function validarCurrentUser(user) {
    if (!user || typeof user !== 'object') return null;
    if (!user.id) return null;
    if (!user.nombre) return null;
    if (!user.roles || typeof user.roles !== 'object') return null;
    if (!user.roles.nombre) return null;
    return user;
}

export const APP_STORAGE_PREFIX = APP_PREFIX;