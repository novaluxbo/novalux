// src/app/dashboard/gestion-productos/hooks/useDescargarExcelProductos.js
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import { supabase } from '@/lib/supabase/client';
import { useMultiLocalStorageListener } from "@/hooks/listener/useLocalStorageListener";
import { formatearFechaVencimiento } from '@/utils/fechasProducto';

// ============================================================
// UTILIDADES
// ============================================================

const formatearDiasRestantes = (dias) => {
    if (dias === null || dias === undefined) return '';
    if (dias === 0) return 'Vence hoy';
    if (dias < 0) {
        const abs = Math.abs(dias);
        if (abs >= 30) {
            const meses = Math.floor(abs / 30);
            return `Vencido hace ${meses} mes${meses === 1 ? '' : 'es'}`;
        }
        return `Vencido hace ${abs} día${abs === 1 ? '' : 's'}`;
    }
    if (dias >= 30) {
        const meses = Math.floor(dias / 30);
        return `${meses} mes${meses === 1 ? '' : 'es'}`;
    }
    return `${dias} día${dias === 1 ? '' : 's'}`;
};

const productoAFila = (producto, index) => {
    const diasRestantes = producto.fecha_vencimiento
        ? Math.ceil((new Date(producto.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return {
        'N°': index + 1,
        'Código': producto.codigo || '',
        'Producto': producto.nombre || '',
        'Descripción': producto.descripcion || '',
        'Sucursal': producto.sucursales?.nombre || '',
        'Categoría': producto.categorias?.nombre || '',
        'Precio': producto.precio !== null && producto.precio !== undefined
            ? parseFloat(producto.precio)
            : '',
        'Precio Mayorista': producto.precio_mayorista !== null && producto.precio_mayorista !== undefined
            ? parseFloat(producto.precio_mayorista)
            : '',
        'Stock Actual': producto.stock_actual ?? '',
        'Stock Mínimo': producto.stock_minimo ?? '',
        'Comisión': producto.comision_variable
            ? parseFloat(producto.comision_variable)
            : producto.categorias?.reglas_comision?.comision_base
                ? parseFloat(producto.categorias.reglas_comision.comision_base)
                : '',
        'Fecha Vencimiento': producto.fecha_vencimiento
            ? formatearFechaVencimiento(producto.fecha_vencimiento)
            : '',
        'Días Restantes': diasRestantes !== null ? formatearDiasRestantes(diasRestantes) : '',
        'Activo': producto.activo ? 'Sí' : 'No'
    };
};

const aplicarFiltros = (productos, { filtro = '', categoriaFiltro = '', soloActivos = false }) => {
    return productos.filter(producto => {
        const coincideTexto =
            producto.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
            producto.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
            producto.precio?.toString().includes(filtro) ||
            parseFloat(producto.precio || 0).toFixed(2).includes(filtro);

        const coincideCategoria = categoriaFiltro
            ? producto.categorias?.id === Number(categoriaFiltro)
            : true;

        const coincideActivo = soloActivos ? producto.activo : true;

        return coincideTexto && coincideCategoria && coincideActivo;
    });
};

// ============================================================
// ESTILOS
// ============================================================

const COLORES = {
    headerBg: '1E40AF',      // azul oscuro
    headerText: 'FFFFFF',
    subHeaderBg: 'DBEAFE',   // azul claro
    borderColor: 'BFDBFE',
    zebraBg: 'F8FAFC',
    successBg: 'D1FAE5',
    successText: '065F46',
    dangerBg: 'FEE2E2',
    dangerText: '991B1B',
    warningBg: 'FEF3C7',
    warningText: '92400E',
    infoBg: 'DBEAFE',
    infoText: '1E40AF'
};

// Ancho por columna (en caracteres)
const ANCHOS_COLUMNAS = {
    'N°': 6,
    'Código': 14,
    'Producto': 30,
    'Descripción': 36,
    'Sucursal': 20,
    'Categoría': 18,
    'Precio': 12,
    'Precio Mayorista': 16,
    'Stock Actual': 12,
    'Stock Mínimo': 13,
    'Comisión': 12,
    'Fecha Vencimiento': 18,
    'Días Restantes': 20,
    'Activo': 8
};

const COLUMNAS = Object.keys(ANCHOS_COLUMNAS);

// Estilo base de celda
const estiloCelda = (extra = {}) => ({
    font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } },
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
    border: {
        top: { style: 'thin', color: { rgb: COLORES.borderColor } },
        bottom: { style: 'thin', color: { rgb: COLORES.borderColor } },
        left: { style: 'thin', color: { rgb: COLORES.borderColor } },
        right: { style: 'thin', color: { rgb: COLORES.borderColor } }
    },
    ...extra
});

// Estilo del encabezado
const estiloHeader = () => ({
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: COLORES.headerText } },
    fill: { fgColor: { rgb: COLORES.headerBg } },
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    border: {
        top: { style: 'thin', color: { rgb: COLORES.headerBg } },
        bottom: { style: 'thin', color: { rgb: COLORES.headerBg } },
        left: { style: 'thin', color: { rgb: COLORES.headerBg } },
        right: { style: 'thin', color: { rgb: COLORES.headerBg } }
    }
});

// ============================================================
// CONSTRUCCIÓN DE HOJA CON ESTILOS
// ============================================================

const construirHojaConEstilos = (filas, nombreHoja = 'Productos') => {
    if (filas.length === 0) {
        // Hoja vacía con encabezados
        const wsVacia = XLSX.utils.aoa_to_sheet([COLUMNAS]);
        aplicarEstilosHoja(wsVacia, 0, COLUMNAS.length, 0);
        wsVacia['!cols'] = COLUMNAS.map(col => ({ wch: ANCHOS_COLUMNAS[col] }));
        return wsVacia;
    }

    // Crear hoja desde JSON
    const ws = XLSX.utils.json_to_sheet(filas, { header: COLUMNAS });

    // Aplicar estilos
    aplicarEstilosHoja(ws, filas.length, COLUMNAS.length, 0);

    // Ancho de columnas
    ws['!cols'] = COLUMNAS.map(col => ({ wch: ANCHOS_COLUMNAS[col] }));

    // Altura de filas
    ws['!rows'] = [{ hpt: 24 }]; // header
    for (let i = 0; i < filas.length; i++) {
        ws['!rows'].push({ hpt: 20 });
    }

    // Auto-filtro en el encabezado
    const rango = XLSX.utils.decode_range(ws['!ref']);
    ws['!autofilter'] = { ref: XLSX.utils.encode_range(rango) };

    return ws;
};

// Aplica estilos a todas las celdas
const aplicarEstilosHoja = (ws, numFilas, numColumnas, filaInicio) => {
    const rango = XLSX.utils.decode_range(ws['!ref']);

    for (let R = rango.s.r; R <= rango.e.r; R++) {
        for (let C = rango.s.c; C <= rango.e.c; C++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (!cell) continue;

            if (R === filaInicio) {
                // Encabezado
                cell.s = estiloHeader();
                continue;
            }

            const colName = COLUMNAS[C];
            const esFilaPar = (R - filaInicio) % 2 === 0;

            // Alineación por tipo de columna
            let horizontal = 'left';
            if (colName === 'N°' || colName === 'Activo') horizontal = 'center';
            if (colName === 'Precio' || colName === 'Precio Mayorista' ||
                colName === 'Stock Actual' || colName === 'Stock Mínimo' ||
                colName === 'Comisión') horizontal = 'right';

            // Fondo base (zebra)
            let fill = esFilaPar ? COLORES.zebraBg : 'FFFFFF';

            // Estilos condicionales
            let font = { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } };

            if (colName === 'Activo') {
                const valor = String(cell.v || '').toLowerCase();
                if (valor === 'sí' || valor === 'si') {
                    fill = COLORES.successBg;
                    font.color = { rgb: COLORES.successText };
                    font.bold = true;
                } else {
                    fill = COLORES.dangerBg;
                    font.color = { rgb: COLORES.dangerText };
                    font.bold = true;
                }
            }

            if (colName === 'Días Restantes') {
                const valor = String(cell.v || '').toLowerCase();
                if (valor.includes('vencido')) {
                    fill = COLORES.dangerBg;
                    font.color = { rgb: COLORES.dangerText };
                    font.bold = true;
                } else if (valor.includes('vence hoy')) {
                    fill = COLORES.dangerBg;
                    font.color = { rgb: COLORES.dangerText };
                    font.bold = true;
                } else if (valor.match(/^\d+\s*día/)) {
                    const dias = parseInt(valor, 10);
                    if (!isNaN(dias) && dias <= 7) {
                        fill = COLORES.warningBg;
                        font.color = { rgb: COLORES.warningText };
                        font.bold = true;
                    } else if (!isNaN(dias) && dias <= 30) {
                        fill = 'FEF9C3'; // amarillo muy claro
                        font.color = { rgb: '854D0E' };
                    } else {
                        fill = COLORES.successBg;
                        font.color = { rgb: COLORES.successText };
                    }
                } else if (valor.includes('mes')) {
                    fill = COLORES.successBg;
                    font.color = { rgb: COLORES.successText };
                }
            }

            if (colName === 'Comisión' && cell.v) {
                fill = COLORES.infoBg;
                font.color = { rgb: COLORES.infoText };
                font.bold = true;
            }

            cell.s = estiloCelda({
                font,
                fill: { fgColor: { rgb: fill } },
                alignment: { vertical: 'center', horizontal, wrapText: true }
            });
        }
    }
};

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export const useDescargarExcelProductos = () => {
    const [descargando, setDescargando] = useState(false);
    const [error, setError] = useState(null);
    const { values } = useMultiLocalStorageListener(["currentUser"]);
    const { currentUser } = values;

    const esAdmin = currentUser?.roles?.nombre === 'admin';

    // ✅ PROMOTOR: solo lo que ve en la tabla
    const descargarPromotor = ({ productosVisibles, filtros }) => {
        const productosFiltrados = aplicarFiltros(productosVisibles, filtros);
        const filas = productosFiltrados.map((p, i) => productoAFila(p, i));

        const ws = construirHojaConEstilos(filas, 'Productos');
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');

        const nombreArchivo = `productos_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo, { cellStyles: true });
    };

    // ✅ ADMIN: todas las sucursales
    const descargarAdmin = async ({ filtros }) => {
        const { data: sucursales, error: errSuc } = await supabase
            .from('sucursales')
            .select('id, nombre')
            .eq('activo', true)
            .order('nombre');

        if (errSuc) throw errSuc;
        if (!sucursales || sucursales.length === 0) {
            throw new Error('No hay sucursales activas');
        }

        const { data: stockData, error: errStock } = await supabase
            .from('productos_stock')
            .select(`
                *,
                producto:producto_id (
                    id, codigo, nombre, descripcion, precio, precio_mayorista,
                    fecha_vencimiento, costo, comision_variable, activo,
                    categoria_id, categorias ( id, nombre, reglas_comision )
                )
            `)
            .order('producto(codigo)', { ascending: true });

        if (errStock) throw errStock;

        const productosPorSucursal = {};
        sucursales.forEach(s => {
            productosPorSucursal[s.id] = [];
        });

        stockData
            .filter(item => item.producto !== null)
            .forEach(item => {
                const sucursal = sucursales.find(s => s.id === item.sucursal_id);
                if (!sucursal) return;

                productosPorSucursal[item.sucursal_id].push({
                    id: item.producto.id,
                    codigo: item.producto.codigo,
                    nombre: item.producto.nombre,
                    descripcion: item.producto.descripcion,
                    precio: item.producto.precio,
                    precio_mayorista: item.producto.precio_mayorista,
                    fecha_vencimiento: item.producto.fecha_vencimiento,
                    comision_variable: item.producto.comision_variable,
                    activo: item.producto.activo,
                    stock_actual: item.stock_actual,
                    stock_minimo: item.stock_minimo,
                    categorias: item.producto.categorias,
                    sucursales: sucursal
                });
            });

        const wb = XLSX.utils.book_new();

        // Hoja principal: Todas las Sucursales
        const todasLasFilas = [];
        sucursales.forEach(sucursal => {
            const productosSuc = aplicarFiltros(productosPorSucursal[sucursal.id], filtros);
            productosSuc.forEach(p => {
                todasLasFilas.push(productoAFila(p, todasLasFilas.length));
            });
        });

        const wsTodas = construirHojaConEstilos(todasLasFilas, 'Todas las Sucursales');
        XLSX.utils.book_append_sheet(wb, wsTodas, 'Todas las Sucursales');

        // Una hoja por sucursal
        sucursales.forEach(sucursal => {
            const productosSuc = aplicarFiltros(productosPorSucursal[sucursal.id], filtros);
            const filas = productosSuc.map((p, i) => productoAFila(p, i));

            let nombreHoja = sucursal.nombre.replace(/[\\/*?:[\]]/g, '').slice(0, 31);
            if (!nombreHoja) nombreHoja = `Sucursal ${sucursal.id}`;

            let sufijo = 1;
            let nombreFinal = nombreHoja;
            while (wb.SheetNames.includes(nombreFinal)) {
                nombreFinal = `${nombreHoja.slice(0, 28)}_${sufijo}`;
                sufijo++;
            }

            const ws = construirHojaConEstilos(filas, nombreFinal);
            XLSX.utils.book_append_sheet(wb, ws, nombreFinal);
        });

        const nombreArchivo = `productos_todas_sucursales_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo, { cellStyles: true });
    };

    const descargarExcel = async ({ productosVisibles = [], filtros = {} }) => {
        setDescargando(true);
        setError(null);
        try {
            if (esAdmin) {
                await descargarAdmin({ filtros });
            } else {
                descargarPromotor({ productosVisibles, filtros });
            }
            return { success: true };
        } catch (err) {
            const msg = err.message || 'Error al generar el Excel';
            setError(msg);
            console.error('Error descargando Excel:', err);
            return { success: false, error: msg };
        } finally {
            setDescargando(false);
        }
    };

    return {
        descargarExcel,
        descargando,
        error,
        esAdmin
    };
};