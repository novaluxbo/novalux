// src/app/dashboard/ventas/components/ClienteSearch.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ClienteSearch({ value, onChange, autoFocus = false }) {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [abierto, setAbierto] = useState(false);
    const debounceRef = useRef(null);
    const wrapRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) {
            setResultados([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setBuscando(true);
            try {
                const t = `%${query.trim()}%`;
                const { data, error } = await supabase
                    .from('clientes')
                    .select('id, codigo_cliente, nombre_cliente, nombre_comercial, tipo_cliente, activo')
                    .eq('activo', true)
                    .or(`nombre_cliente.ilike.${t},codigo_cliente.ilike.${t},nombre_comercial.ilike.${t}`)
                    .limit(10);
                if (error) throw error;
                setResultados(data || []);
            } catch (err) {
                console.error('Error buscando clientes:', err);
                setResultados([]);
            } finally {
                setBuscando(false);
            }
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const seleccionar = (cli) => {
        onChange(cli);
        setQuery('');
        setResultados([]);
        setAbierto(false);
    };

    const limpiar = () => {
        onChange(null);
        setQuery('');
        setResultados([]);
    };

    if (value) {
        return (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 truncate">
                        {value.nombre_cliente}
                    </p>
                    <p className="text-xs text-blue-700 truncate">
                        {value.codigo_cliente || 'sin código'} · {value.tipo_cliente}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={limpiar}
                    className="text-blue-600 hover:text-blue-800 shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                    autoFocus={autoFocus}
                    type="text"
                    placeholder="Buscar cliente por nombre o código..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
                    onFocus={() => setAbierto(true)}
                    className="flex-1 outline-none text-sm text-gray-900 bg-transparent"
                />
                {buscando && <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />}
            </div>

            <AnimatePresence>
                {abierto && query.trim() && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-72 overflow-y-auto"
                    >
                        {resultados.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                {buscando ? 'Buscando...' : 'Sin resultados'}
                            </div>
                        ) : (
                            resultados.map((cli) => (
                                <button
                                    key={cli.id}
                                    type="button"
                                    onClick={() => seleccionar(cli)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                >
                                    <p className="text-sm font-medium text-gray-900">
                                        {cli.nombre_cliente}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {cli.codigo_cliente || 'sin código'} · {cli.tipo_cliente}
                                        {cli.nombre_comercial ? ` · ${cli.nombre_comercial}` : ''}
                                    </p>
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}