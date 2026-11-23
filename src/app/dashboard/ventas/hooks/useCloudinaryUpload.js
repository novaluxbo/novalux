// src/app/dashboard/ventas/hooks/useCloudinaryUpload.js
import { useCallback, useState } from 'react';
import {
    CLOUDINARY_UPLOAD_URL,
    CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_FOLDER,
    assertCloudinaryConfig,
    validarComprobante,
} from '@/lib/cloudinary/cloudinary';

export function useCloudinaryUpload() {
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [error, setError] = useState(null);

    const reset = useCallback(() => {
        setSubiendo(false);
        setProgreso(0);
        setError(null);
    }, []);

    const subir = useCallback((file) => {
        return new Promise((resolve, reject) => {
            try {
                assertCloudinaryConfig();
                const v = validarComprobante(file);
                if (!v.valido) {
                    setError(v.error);
                    reject(new Error(v.error));
                    return;
                }

                setSubiendo(true);
                setProgreso(0);
                setError(null);

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                formData.append('folder', CLOUDINARY_FOLDER);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', CLOUDINARY_UPLOAD_URL);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setProgreso(Math.round((e.loaded / e.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const json = JSON.parse(xhr.responseText);
                            setProgreso(100);
                            setSubiendo(false);
                            resolve({
                                url: json.secure_url,
                                publicId: json.public_id,
                            });
                        } catch {
                            const msg = 'Respuesta inválida de Cloudinary';
                            setError(msg);
                            setSubiendo(false);
                            reject(new Error(msg));
                        }
                    } else {
                        let msg = `Error ${xhr.status} al subir`;
                        try {
                            const json = JSON.parse(xhr.responseText);
                            if (json?.error?.message) msg = json.error.message;
                        } catch { /* noop */ }
                        setError(msg);
                        setSubiendo(false);
                        reject(new Error(msg));
                    }
                };

                xhr.onerror = () => {
                    const msg = 'Error de red al subir el comprobante';
                    setError(msg);
                    setSubiendo(false);
                    reject(new Error(msg));
                };

                xhr.send(formData);
            } catch (err) {
                setError(err.message);
                setSubiendo(false);
                reject(err);
            }
        });
    }, []);

    return { subir, subiendo, progreso, error, reset };
}