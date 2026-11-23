// src/lib/cloudinary/cloudinary.js
export const CLOUDINARY_CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'novaluxVouchers';

export const CLOUDINARY_FOLDER = 'novaluxVouchers';

export const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
    ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    : '';

export function assertCloudinaryConfig() {
    if (!CLOUDINARY_CLOUD_NAME)
        throw new Error('Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en .env.local');
    if (!CLOUDINARY_UPLOAD_PRESET)
        throw new Error('Falta NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local');
}

export const COMPROBANTE_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
];

export const COMPROBANTE_MAX_BYTES = 5 * 1024 * 1024;

export function validarComprobante(file) {
    if (!file) return { valido: false, error: 'No se seleccionó archivo' };
    if (!COMPROBANTE_MIME_TYPES.includes(file.type))
        return { valido: false, error: 'Formato no soportado. Usá JPG, PNG, WEBP o HEIC.' };
    if (file.size > COMPROBANTE_MAX_BYTES)
        return { valido: false, error: 'El archivo supera los 5 MB.' };
    return { valido: true };
}