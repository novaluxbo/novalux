// src/app/dashboard/ventas/components/ComprobanteUpload.jsx
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

/**
 * Props:
 *   - value: { url, publicId } | string | null  (acepta url string o {url})
 *   - onChange: (value | null) => void
 *   - compact?: boolean (modo tabla, más chico)
 */
export default function ComprobanteUpload({ value, onChange, compact = false }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const { subir, subiendo, progreso, error, reset } = useCloudinaryUpload();

    const urlActual = typeof value === 'string' ? value : value?.url || null;

    const handleFile = async (file) => {
        if (!file) return;
        try {
            const res = await subir(file);
            onChange(res);
        } catch {
            /* error ya seteado en hook */
        }
    };

    const onInputChange = (e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
        e.target.value = '';
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
    };

    // ---------- Modo compacto (tabla): solo muestra link + botón reemplazar ----------
    if (compact) {
        return (
            <div className="flex items-center justify-center gap-1.5">
                {urlActual ? (
                    <a
                        href={urlActual}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 rounded hover:bg-cyan-100 transition-colors"
                    >
                        <ImageIcon className="w-3 h-3" />
                        Ver
                        <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={subiendo}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                    title="Reemplazar comprobante"
                >
                    {subiendo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={onInputChange}
                    className="hidden"
                />
            </div>
        );
    }

    // ---------- Modo completo (modal): dropzone con preview ----------
    return (
        <div className="space-y-2">
            {urlActual ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                        src={urlActual}
                        alt="Comprobante"
                        className="w-full max-h-64 object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <a
                            href={urlActual}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow text-slate-700"
                            title="Ver completo"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow text-red-600"
                            title="Quitar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Subido
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !subiendo && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`
                        flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors
                        ${dragOver ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50/50'}
                        ${subiendo ? 'pointer-events-none opacity-70' : ''}
                    `}
                >
                    {subiendo ? (
                        <>
                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                            <p className="text-sm text-slate-600 font-medium">Subiendo... {progreso}%</p>
                            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progreso}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-cyan-500" />
                            <p className="text-sm text-slate-700 font-medium">
                                Arrastrá o hacé clic para subir
                            </p>
                            <p className="text-xs text-slate-500">JPG, PNG, WEBP, HEIC · máx 5 MB</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={onInputChange}
                className="hidden"
            />

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-xs text-red-600"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {error}
                        <button onClick={reset} className="ml-auto underline">cerrar</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}