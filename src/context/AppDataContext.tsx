import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  agregarProducto: (p: Producto) => void;
  editarProducto: (p: Producto) => void;
  eliminarProducto: (id: string) => void;

  facturas: Factura[];
  agregarFactura: (f: Factura) => void;
  cerrarFactura: (id: string) => void;
  editarFactura: (f: Factura) => void;
  descartarFactura: (id: string) => void;

  cierres: CierreCaja[];
  agregarCierre: (c: CierreCaja) => void;
}

const AppDataContext = createContext<AppDataContextType>({
  productos: [],
  agregarProducto: () => {},
  editarProducto: () => {},
  eliminarProducto: () => {},
  facturas: [],
  agregarFactura: () => {},
  cerrarFactura: () => {},
  editarFactura: () => {},
  descartarFactura: () => {},
  cierres: [],
  agregarCierre: () => {},
});

// Helpers para localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}
function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>(() => loadFromStorage('productos', []));
  const [facturas, setFacturas] = useState<Factura[]>(() => loadFromStorage('facturas', []));
  const [cierres, setCierres] = useState<CierreCaja[]>(() => loadFromStorage('cierres', []));

  // Guardar en localStorage en cada cambio
  useEffect(() => { saveToStorage('productos', productos); }, [productos]);
  useEffect(() => { saveToStorage('facturas', facturas); }, [facturas]);
  useEffect(() => { saveToStorage('cierres', cierres); }, [cierres]);

  // Productos
  const agregarProducto = (p: Producto) => {
    setProductos(prev => [...prev, p]);
  };
  const editarProducto = (p: Producto) => {
    setProductos(prev => prev.map(prod => prod.id === p.id ? { ...p } : prod));
  };
  const eliminarProducto = (id: string) => {
    setProductos(prev => prev.filter(prod => prod.id !== id));
  };

  // Facturas
  const agregarFactura = (f: Factura) => {
    setFacturas(prev => [...prev, f]);
  };
  const cerrarFactura = (id: string) => {
    setFacturas(prev => prev.map(fac => fac.id === id ? { ...fac, abierta: false } : fac));
  };
  const editarFactura = (f: Factura) => {
    setFacturas(prev => prev.map(fac => fac.id === f.id ? { ...f } : fac));
  };
  const descartarFactura = (id: string) => {
    setFacturas(prev => prev.filter(fac => fac.id !== id));
  };

  // Cierres
  const agregarCierre = (c: CierreCaja) => {
    setCierres(prev => [...prev, c]);
  };

  return (
    <AppDataContext.Provider value={{
      productos, agregarProducto, editarProducto, eliminarProducto,
      facturas, agregarFactura, cerrarFactura, editarFactura, descartarFactura,
      cierres, agregarCierre
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
} 