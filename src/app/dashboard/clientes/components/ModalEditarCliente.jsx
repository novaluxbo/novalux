// src/app/dashboard/clientes/components/ModalEditarCliente.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Loader2, UserX, UserCheck } from 'lucide-react';
import {
    TIPOS_COMERCIO,
    ORIGENES_CLIENTE,
    TIPOS_CLIENTE,
    DEPARTAMENTOS_BOLIVIA,
    ESTADOS_CLIENTE,
} from '../utils/constantes';

const inputClass =
    'w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors';

const labelClass = 'block text-xs font-medium text-emerald-700 mb-1';

const isoToLocalInput = (iso) => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
};

export default function ModalEditarCliente({
    cliente,
    onCerrar,
    onActualizar,
    onDarBaja,
    onReactivar,
    responsables,
    currentUser,
    loading,
    dandoDeBaja,
}) {
    const [form, setForm] = useState(null);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (!cliente) return;
        setForm({
            codigo_cliente: cliente.codigo_cliente || '',
            nombre_cliente: cliente.nombre_cliente || '',
            nombre_comercial: cliente.nombre_comercial || '',
            numero_contacto: cliente.numero_contacto || '',
            responsable_id: cliente.responsable_id ?? '',
            tipo_comercio: cliente.tipo_comercio || 'No aplica',
            origen_cliente: cliente.origen_cliente || 'Otro',
            tipo_cliente: cliente.tipo_cliente || 'Cliente Final',
            departamento: cliente.departamento || '',
            localidad: cliente.localidad || '',
            estado: cliente.estado || 'Prospecto',
            ultimo_contacto: isoToLocalInput(cliente.ultimo_contacto),
            proximo_seguimiento: isoToLocalInput(cliente.proximo_seguimiento),
            notas: cliente.notas || '',
        });
        setErrores({});
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
    };

    const validar = () => {
        const errs = {};
        if (!form.nombre_cliente.trim()) errs.nombre_cliente = 'El nombre es obligatorio';
        if (!form.responsable_id) errs.responsable_id = 'Debe asignar un responsable';
        if (form.codigo_cliente && !/^[A-Za-z0-9\-]+$/.test(form.codigo_cliente.trim())) {
            errs.codigo_cliente = 'Solo letras, números y guiones';
        }
        if (form.numero_contacto && !/^[0-9+\-\s()]{6,20}$/.test(form.numero_contacto.trim())) {
            errs.numero_contacto = 'Formato inválido';
        }
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validar()) return;
        await onActualizar(cliente.id, {
            ...form,
            responsable_id: Number(form.responsable_id),
            ultimo_contacto: form.ultimo_contacto || null,
            proximo_seguimiento: form.proximo_seguimiento || null,
        });
    };

    if (!cliente || !form) return null;

    const activo = cliente.activo !== false;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCerrar}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100 bg-emerald-50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Edit className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-emerald-950">Editar cliente</h2>
                                <p className="text-xs text-emerald-600">
                                    {cliente.codigo_cliente} · {cliente.nombre_cliente}
                                </p>
                            </div>
                        </div>
                        <button onClick={onCerrar} className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-emerald-700" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                        {/* Identificación */}
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                                Identificación
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Código cliente</label>
                                    <input name="codigo_cliente" value={form.codigo_cliente} onChange={handleChange} className={inputClass} />
                                    {errores.codigo_cliente && <p className="text-[11px] text-red-600 mt-1">{errores.codigo_cliente}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nombre del cliente *</label>
                                    <input name="nombre_cliente" value={form.nombre_cliente} onChange={handleChange} className={inputClass} required />
                                    {errores.nombre_cliente && <p className="text-[11px] text-red-600 mt-1">{errores.nombre_cliente}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Nombre comercial</label>
                                    <input name="nombre_comercial" value={form.nombre_comercial} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Número de contacto</label>
                                    <input name="numero_contacto" value={form.numero_contacto} onChange={handleChange} className={inputClass} />
                                    {errores.numero_contacto && <p className="text-[11px] text-red-600 mt-1">{errores.numero_contacto}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Clasificación */}
                        <fieldset className="space-y-3 pt-3 border-t border-emerald-100">
                            <legend className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                                Clasificación
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Tipo de cliente</label>
                                    <select name="tipo_cliente" value={form.tipo_cliente} onChange={handleChange} className={inputClass}>
                                        {TIPOS_CLIENTE.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Tipo de comercio</label>
                                    <select name="tipo_comercio" value={form.tipo_comercio} onChange={handleChange} className={inputClass}>
                                        {TIPOS_COMERCIO.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Origen del cliente</label>
                                    <select name="origen_cliente" value={form.origen_cliente} onChange={handleChange} className={inputClass}>
                                        {ORIGENES_CLIENTE.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Ubicación */}
                        <fieldset className="space-y-3 pt-3 border-t border-emerald-100">
                            <legend className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                                Ubicación
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Departamento</label>
                                    <select name="departamento" value={form.departamento} onChange={handleChange} className={inputClass}>
                                        <option value="">Sin especificar</option>
                                        {DEPARTAMENTOS_BOLIVIA.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Localidad</label>
                                    <input name="localidad" value={form.localidad} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </fieldset>

                        {/* Seguimiento */}
                        <fieldset className="space-y-3 pt-3 border-t border-emerald-100">
                            <legend className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                                Seguimiento
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Estado</label>
                                    <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                                        {ESTADOS_CLIENTE.map((e) => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Último contacto</label>
                                    <input type="datetime-local" name="ultimo_contacto" value={form.ultimo_contacto} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Próximo seguimiento</label>
                                    <input type="datetime-local" name="proximo_seguimiento" value={form.proximo_seguimiento} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Responsable *</label>
                                <select name="responsable_id" value={form.responsable_id} onChange={handleChange} className={inputClass} required>
                                    <option value="">Seleccionar responsable...</option>
                                    {responsables.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.nombre} {r.caja ? `(Caja ${r.caja})` : ''} — {r.roles?.nombre || 'sin rol'}
                                        </option>
                                    ))}
                                </select>
                                {errores.responsable_id && <p className="text-[11px] text-red-600 mt-1">{errores.responsable_id}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Notas</label>
                                <textarea name="notas" value={form.notas} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} maxLength={500} />
                                <p className="text-right text-[10px] text-emerald-400">{form.notas.length}/500</p>
                            </div>
                        </fieldset>
                    </form>

                    {/* Footer con 3 botones */}
                    <div className="flex flex-wrap gap-3 px-6 py-4 bg-emerald-50 border-t border-emerald-100">
                        {activo ? (
                            <button
                                type="button"
                                onClick={() => onDarBaja && onDarBaja(cliente)}
                                disabled={dandoDeBaja}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-800 bg-rose-100 border border-rose-300 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {dandoDeBaja ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Dando de baja...
                                    </>
                                ) : (
                                    <>
                                        <UserX className="w-4 h-4" />
                                        Dar de baja
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onReactivar && onReactivar(cliente)}
                                disabled={dandoDeBaja}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-lime-800 bg-lime-100 border border-lime-300 rounded-lg hover:bg-lime-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {dandoDeBaja ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Reactivando...
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        Reactivar cliente
                                    </>
                                )}
                            </button>
                        )}

                        <div className="flex-1" />

                        <button
                            type="button"
                            onClick={onCerrar}
                            className="px-4 py-2 text-sm font-medium text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-emerald-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4" />
                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}