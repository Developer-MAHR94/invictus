import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { productoService, facturaService, cierreCajaService } from '../services/supabaseService';

// Tipos de datos
export interface Producto {
  id: string;
  nombre: string;
  precioEntrada: number;
  precioSalida: number;
  cantidad: number;
  fechaIngreso: string;
}

export interface Servicio {
  id: string;
  barbero: string;
  costo: number;
  observacion?: string;
  propina?: number;
}

export interface Factura {
  id: string;
  cliente: string;
  productos: Producto[];
  servicios: Servicio[];
  tipoPago: 'efectivo' | 'transferencia' | 'combinado';
  efectivo: number;
  transferencia: number;
  abierta: boolean;
  fecha: string;
}

export interface CierreCaja {
  id: string;
  tipo: 'diario' | 'semanal';
  fecha: string;
  detalle: string;
  pdfUrl?: string;
}

interface AppDataContextType {
  productos: Producto[];
  agregarProducto: (p: Producto) => Promise<void>;
  editarProducto: (p: Producto) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;

  facturas: Factura[];
  agregarFactura: (f: Factura) => Promise<void>;
  cerrarFactura: (id: string) => Promise<void>;
  editarFactura: (f: Factura) => Promise<void>;
  descartarFactura: (id: string) => Promise<void>;

  cierres: CierreCaja[];
  agregarCierre: (c: CierreCaja) => Promise<void>;
  
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType>({
  productos: [],
  agregarProducto: async () => {},
  editarProducto: async () => {},
  eliminarProducto: async () => {},
  facturas: [],
  agregarFactura: async () => {},
  cerrarFactura: async () => {},
  editarFactura: async () => {},
  descartarFactura: async () => {},
  cierres: [],
  agregarCierre: async () => {},
  loading: true,
});

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [cierres, setCierres] = useState<CierreCaja[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde Supabase al inicializar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productosData, facturasData, cierresData] = await Promise.all([
          productoService.getProductos(),
          facturaService.getFacturas(),
          cierreCajaService.getCierres()
        ]);
        
        // Mapear productos de Supabase al formato de la app
        const productosMapeados = productosData.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precioEntrada: p.precio_entrada,
          precioSalida: p.precio_salida,
          cantidad: p.cantidad,
          fechaIngreso: p.fecha_ingreso
        }));
        
        // Mapear facturas de Supabase al formato de la app
        const facturasMapeadas = facturasData.map(f => ({
          id: f.id,
          cliente: f.cliente,
          productos: [], // Los productos se manejan por separado
          servicios: f.servicios || [],
          tipoPago: 'efectivo' as const, // Valor por defecto
          efectivo: f.total,
          transferencia: 0,
          abierta: f.abierta,
          fecha: f.fecha
        }));
        
        // Mapear cierres de Supabase al formato de la app
        const cierresMapeados = cierresData.map(c => ({
          id: c.id,
          tipo: 'diario' as const, // Valor por defecto
          fecha: c.fecha,
          detalle: c.observaciones || `Ventas: $${c.total_ventas}, Propinas: $${c.total_propinas}`
        }));
        
        setProductos(productosMapeados);
        setFacturas(facturasMapeadas);
        setCierres(cierresMapeados);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Productos
  const agregarProducto = async (p: Producto) => {
    try {
      const nuevoProducto = await productoService.crearProducto({
        nombre: p.nombre,
        precio_entrada: p.precioEntrada,
        precio_salida: p.precioSalida,
        cantidad: p.cantidad,
        fecha_ingreso: p.fechaIngreso
      });
      
      if (nuevoProducto) {
        setProductos(prev => [...prev, {
          id: nuevoProducto.id,
          nombre: nuevoProducto.nombre,
          precioEntrada: nuevoProducto.precio_entrada,
          precioSalida: nuevoProducto.precio_salida,
          cantidad: nuevoProducto.cantidad,
          fechaIngreso: nuevoProducto.fecha_ingreso
        }]);
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
    }
  };
  
  const editarProducto = async (p: Producto) => {
    try {
      const productoActualizado = await productoService.actualizarProducto(p.id, {
        nombre: p.nombre,
        precio_entrada: p.precioEntrada,
        precio_salida: p.precioSalida,
        cantidad: p.cantidad,
        fecha_ingreso: p.fechaIngreso
      });
      
      if (productoActualizado) {
        setProductos(prev => prev.map(prod => prod.id === p.id ? {
          id: productoActualizado.id,
          nombre: productoActualizado.nombre,
          precioEntrada: productoActualizado.precio_entrada,
          precioSalida: productoActualizado.precio_salida,
          cantidad: productoActualizado.cantidad,
          fechaIngreso: productoActualizado.fecha_ingreso
        } : prod));
      }
    } catch (error) {
      console.error('Error editando producto:', error);
    }
  };
  
  const eliminarProducto = async (id: string) => {
    try {
      const eliminado = await productoService.eliminarProducto(id);
      if (eliminado) {
        setProductos(prev => prev.filter(prod => prod.id !== id));
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  // Facturas
  const agregarFactura = async (f: Factura) => {
    try {
      const nuevaFactura = await facturaService.crearFactura({
        numero: `FAC-${Date.now()}`, // Generar número único
        fecha: f.fecha,
        cliente: f.cliente,
        servicios: f.servicios,
        total: f.efectivo + f.transferencia,
        abierta: f.abierta
      });
      
      if (nuevaFactura) {
        setFacturas(prev => [...prev, {
          id: nuevaFactura.id,
          cliente: nuevaFactura.cliente,
          productos: [],
          servicios: nuevaFactura.servicios || [],
          tipoPago: 'efectivo',
          efectivo: nuevaFactura.total,
          transferencia: 0,
          abierta: nuevaFactura.abierta,
          fecha: nuevaFactura.fecha
        }]);
      }
    } catch (error) {
      console.error('Error agregando factura:', error);
    }
  };
  
  const cerrarFactura = async (id: string) => {
    try {
      const facturaActualizada = await facturaService.actualizarFactura(id, { abierta: false });
      if (facturaActualizada) {
        setFacturas(prev => prev.map(fac => fac.id === id ? { ...fac, abierta: false } : fac));
      }
    } catch (error) {
      console.error('Error cerrando factura:', error);
    }
  };
  
  const editarFactura = async (f: Factura) => {
    try {
      const facturaActualizada = await facturaService.actualizarFactura(f.id, {
        cliente: f.cliente,
        servicios: f.servicios,
        total: f.efectivo + f.transferencia,
        abierta: f.abierta
      });
      
      if (facturaActualizada) {
        setFacturas(prev => prev.map(fac => fac.id === f.id ? {
          ...f,
          id: facturaActualizada.id,
          cliente: facturaActualizada.cliente,
          servicios: facturaActualizada.servicios || [],
          efectivo: facturaActualizada.total,
          abierta: facturaActualizada.abierta
        } : fac));
      }
    } catch (error) {
      console.error('Error editando factura:', error);
    }
  };
  
  const descartarFactura = async (id: string) => {
    try {
      const eliminada = await facturaService.eliminarFactura(id);
      if (eliminada) {
        setFacturas(prev => prev.filter(fac => fac.id !== id));
      }
    } catch (error) {
      console.error('Error descartando factura:', error);
    }
  };

  // Cierres
  const agregarCierre = async (c: CierreCaja) => {
    try {
      const nuevoCierre = await cierreCajaService.crearCierre({
        fecha: c.fecha,
        total_ventas: 0, // Calcular basado en facturas
        total_propinas: 0, // Calcular basado en propinas
        total_efectivo: 0,
        total_tarjeta: 0,
        observaciones: c.detalle
      });
      
      if (nuevoCierre) {
        setCierres(prev => [...prev, {
          id: nuevoCierre.id,
          tipo: 'diario',
          fecha: nuevoCierre.fecha,
          detalle: nuevoCierre.observaciones || ''
        }]);
      }
    } catch (error) {
      console.error('Error agregando cierre:', error);
    }
  };

  return (
    <AppDataContext.Provider value={{
      productos, agregarProducto, editarProducto, eliminarProducto,
      facturas, agregarFactura, cerrarFactura, editarFactura, descartarFactura,
      cierres, agregarCierre, loading
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
} 