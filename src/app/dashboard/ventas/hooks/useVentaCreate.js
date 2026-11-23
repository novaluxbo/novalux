// src/app/dashboard/ventas/hooks/useVentaCreate.js
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useVentaCreate({ currentUser } = {}) {
    const [creando, setCreando] = useState(false);
    const [error, setError] = useState(null);

    const crearVentasMultiples = useCallback(async ({
        cliente,
        items,
        tipoCliente,
        metodoPago,
        comprobanteUrl,
        notaCabecera,
    }) => {
        if (!currentUser?.id) throw new Error('No hay usuario autenticado');
        if (!currentUser?.sucursal_id)
            throw new Error('Tu usuario no tiene sucursal asignada');
        if (!cliente?.id) throw new Error('Debés seleccionar un cliente');
        if (!items?.length) throw new Error('El carrito está vacío');
        if (!tipoCliente) throw new Error('Debés indicar el tipo de cliente');
        if (!comprobanteUrl)
            throw new Error('Debés subir el comprobante de la venta');

        setCreando(true);
        setError(null);

        try {
            const ahora = new Date().toISOString();

            const filas = items.map((item) => {
                const cantidad = Number(item.cantidad) || 0;
                const precioUnit = Number(item.precio_unitario) || 0;
                const descuentoLinea = Number(item.descuento_venta) || 0;
                const montoBruto = +(cantidad * precioUnit).toFixed(2);
                const montoTotal = +(montoBruto - descuentoLinea).toFixed(2);

                if (cantidad <= 0) throw new Error('Cantidad inválida');
                if (precioUnit < 0) throw new Error('Precio inválido');
                if (montoTotal < 0)
                    throw new Error('El descuento supera el monto bruto');

                return {
                    fecha_venta: ahora,
                    created_at: ahora,
                    updated_at: ahora,
                    cliente_id: cliente.id,
                    codigo_cliente: cliente.codigo_cliente || null,
                    nombre_cliente: cliente.nombre_cliente,
                    tipo_cliente: tipoCliente,
                    producto_id: item.producto_id,
                    codigo_producto: item.codigo_producto,
                    nombre_producto: item.nombre_producto,
                    descripcion_producto: item.descripcion_producto || null,
                    categoria_id: item.categoria_id ?? null,
                    categoria_nombre: item.categoria_nombre ?? null,
                    cantidad,
                    precio_unitario: precioUnit,
                    monto_bruto: montoBruto,
                    descuento_venta: descuentoLinea,
                    monto_total: montoTotal,
                    vendedor_id: currentUser.id,
                    sucursal_id: currentUser.sucursal_id,
                    metodo_pago: metodoPago,
                    comprobante_url: comprobanteUrl,
                    depositado: false,
                    nota_individual: notaCabecera || item.nota_individual || null,
                    estado: 'activa',
                };
            });

            // ✅ Devolvemos las filas COMPLETAS con el id que asignó la BD
            const { data, error: err } = await supabase
                .from('ventas')
                .insert(filas)
                .select(`
                    id, fecha_venta, created_at, updated_at,
                    cliente_id, codigo_cliente, nombre_cliente, tipo_cliente,
                    producto_id, codigo_producto, nombre_producto, descripcion_producto,
                    categoria_id, categoria_nombre,
                    cantidad, precio_unitario, monto_bruto, descuento_venta, monto_total,
                    vendedor_id, sucursal_id,
                    metodo_pago, comprobante_url, depositado,
                    nota_individual, estado,
                    motivo_anulacion, fecha_anulacion, usuario_anulacion
                `);

            if (err) throw err;
            return { success: true, ventasCreadas: data || [] };
        } catch (err) {
            setError(err.message || 'Error al crear la venta');
            return { success: false, error: err.message };
        } finally {
            setCreando(false);
        }
    }, [currentUser]);

    return { crearVentasMultiples, creando, error };
}