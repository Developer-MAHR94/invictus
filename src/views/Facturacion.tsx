import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Producto, Factura, Servicio } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

const BARBEROS_KEY = 'barberos';
const barberosBase = [
  'jose.torres',
  'breiner.ferrer',
  'edinson.vergara',
];
function loadBarberos() {
  try {
    const data = localStorage.getItem(BARBEROS_KEY);
    return data ? JSON.parse(data) : barberosBase;
  } catch {
    return barberosBase;
  }
}

function generarId() {
  return Math.random().toString(36).substring(2, 10);
}

function normalizar(str: string) {
  return str.trim().toLowerCase();
}

function EditarFacturaModal({ factura, productos, setFacturaEditando, editarFactura, generarId, setError }: {
  factura: Factura;
  productos: Producto[];
  setFacturaEditando: (f: Factura | null) => void;
  editarFactura: (f: Factura) => void;
  generarId: () => string;
  setError: (error: string) => void;
}) {
  const [busquedaModal, setBusquedaModal] = useState('');
  const productosFiltradosModal = productos.filter((p: Producto) => p.cantidad > 0 && normalizar(p.nombre).includes(normalizar(busquedaModal)));
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 24, minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
        <h3 style={{ color: '#4C2E00', marginBottom: 16 }}>Editar factura</h3>
        <div style={{ marginBottom: 12, color: 'black' }}>
          <b>Cliente:</b> <input type="text" value={factura.cliente} onChange={e => setFacturaEditando({ ...factura, cliente: e.target.value })} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', marginLeft: 8, color: 'black' }} />
        </div>
        {/* Productos */}
        <div style={{ marginBottom: 12 }}>
          <b style={{ color: '#4C2E00' }}>Productos:</b>
          <ul style={{ paddingLeft: 20, maxWidth: 250, wordBreak: 'break-word' }}>
            {factura.productos.map((p: Producto, idx: number) => (
              <li key={p.id + idx} style={{ color: 'black', overflowWrap: 'break-word' }}>
                {p.nombre} (${p.precioSalida}) x {p.cantidad || 1}
                <button onClick={() => {
                  const nuevos = [...factura.productos];
                  nuevos.splice(idx, 1);
                  setFacturaEditando({ ...factura, productos: nuevos });
                }} style={{ marginLeft: 8, background: '#b00', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px' }}>Quitar</button>
              </li>
            ))}
          </ul>
          {/* Agregar producto */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <input type="text" placeholder="Buscar producto" value={busquedaModal} onChange={e => setBusquedaModal(e.target.value)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', color: 'black', marginRight: 8, width: '100%', boxSizing: 'border-box' }} />
            {busquedaModal.trim() !== '' && productosFiltradosModal.length > 0 && (
              <div style={{ maxHeight: 100, overflowY: 'auto', overflowX: 'auto', background: '#fff', borderRadius: 6, marginTop: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', position: 'absolute', zIndex: 9999, width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordBreak: 'break-all' }}>
                {productosFiltradosModal.map((p: Producto) => (
                  <div key={p.id} style={{ color: 'black', cursor: 'pointer', padding: 4, wordBreak: 'break-all' }} onClick={() => {
                    setFacturaEditando({ ...factura, productos: [...factura.productos, { ...p, cantidad: 1 }] });
                    setBusquedaModal('');
                  }}>{p.nombre} (${p.precioSalida})</div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Servicios */}
        <div style={{ marginBottom: 12 }}>
          <b style={{ color: '#4C2E00' }}>Servicios de barbería:</b>
          <ul style={{ paddingLeft: 20 }}>
            {factura.servicios.map((s: Servicio, idx: number) => (
              <li key={s.id + idx} style={{ color: 'black', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <select value={s.barbero} onChange={e => {
                  const nuevos = [...factura.servicios];
                  nuevos[idx].barbero = e.target.value;
                  setFacturaEditando({ ...factura, servicios: nuevos });
                }} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', color: 'black' }}>
                  <option value="">Barbero</option>
                  <option value="jose.torres">jose.torres</option>
                  <option value="breiner.ferrer">breiner.ferrer</option>
                  <option value="edinson.vergara">edinson.vergara</option>
                </select>
                <input type="number" placeholder="Costo" value={s.costo} onChange={e => {
                  const nuevos = [...factura.servicios];
                  nuevos[idx].costo = Number(e.target.value);
                  setFacturaEditando({ ...factura, servicios: nuevos });
                }} style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #ccc', color: 'black' }} />
                <input type="text" placeholder="Observación" value={s.observacion || ''} onChange={e => {
                  const nuevos = [...factura.servicios];
                  nuevos[idx].observacion = e.target.value;
                  setFacturaEditando({ ...factura, servicios: nuevos });
                }} style={{ width: 120, padding: 4, borderRadius: 4, border: '1px solid #ccc', color: 'black' }} />
                <input type="number" placeholder="Propina" value={s.propina || ''} onChange={e => {
                  const nuevos = [...factura.servicios];
                  let valor = Number(e.target.value);
                  if (valor < 0) {
                    valor = 0;
                    setError('La propina no puede ser negativa');
                  }
                  nuevos[idx].propina = valor;
                  setFacturaEditando({ ...factura, servicios: nuevos });
                }} style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #ccc', color: 'black' }} />
                <button onClick={() => {
                  const nuevos = [...factura.servicios];
                  nuevos.splice(idx, 1);
                  setFacturaEditando({ ...factura, servicios: nuevos });
                }} style={{ background: '#b00', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px' }}>Quitar</button>
              </li>
            ))}
          </ul>
          <button onClick={() => {
            setFacturaEditando({ ...factura, servicios: [...factura.servicios, { id: generarId(), barbero: '', costo: 0, observacion: '', propina: 0 }] });
          }} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', marginTop: 8 }}>Agregar servicio</button>
        </div>
        {/* Total */}
        <div style={{ marginBottom: 16, color: '#4C2E00', fontWeight: 'bold' }}>
          Total: ${
            (factura.productos.reduce((acc: number, p: Producto) => acc + (p.precioSalida * (p.cantidad || 1)), 0) +
            factura.servicios.reduce((acc: number, s: Servicio) => acc + s.costo + (s.propina || 0), 0))
          }
        </div>
        <button type="button" onClick={() => { editarFactura(factura); setFacturaEditando(null); }} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', marginRight: 8 }}>Guardar</button>
        <button type="button" onClick={() => setFacturaEditando(null)} style={{ background: '#888', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold' }}>Cancelar</button>
      </div>
    </div>,
    document.body
  );
}

// FIFO: solo muestra el lote más antiguo disponible, considerando la cantidad seleccionada en el carrito
function obtenerLotesFifo(productos: Producto[], busqueda: string, productosSeleccionados: Producto[]): Producto[] {
  const normalizado = normalizar(busqueda);
  const lotes = productos.filter((p: Producto) => p.cantidad > 0 && normalizar(p.nombre).includes(normalizado));
  const lotesPorNombre: { [key: string]: Producto } = {};
  lotes.forEach((p: Producto) => {
    const key = normalizar(p.nombre);
    // Calcular cuántos de este lote ya están en el carrito
    const enCarrito = productosSeleccionados.filter((sel: Producto) => sel.id === p.id).length;
    // Solo mostrar el lote si aún hay cantidad disponible para agregar
    if ((p.cantidad - enCarrito) > 0 && (!lotesPorNombre[key] || new Date(p.fechaIngreso) < new Date(lotesPorNombre[key].fechaIngreso))) {
      lotesPorNombre[key] = { ...p, cantidad: p.cantidad - enCarrito };
    }
  });
  return Object.values(lotesPorNombre);
}

export default function Facturacion() {
  const { productos, facturas, agregarFactura, cerrarFactura, editarProducto, editarFactura, descartarFactura } = useAppData();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  // Variables de pago comentadas ya que no se usan actualmente
  // const [tipoPago, setTipoPago] = useState<'efectivo' | 'transferencia' | 'combinado'>('efectivo');
  // const [efectivo, setEfectivo] = useState(0);
  // const [transferencia, setTransferencia] = useState(0);
  const [barbero, setBarbero] = useState('');
  const [costo, setCosto] = useState(0);
  const [observacion, setObservacion] = useState('');
  const [propina, setPropina] = useState(0);
  const [error, setError] = useState('');
  const [productoParaCantidad, setProductoParaCantidad] = useState<Producto | null>(null);
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  const [facturaEditando, setFacturaEditando] = useState<Factura | null>(null);
  const [facturaCerrando, setFacturaCerrando] = useState<Factura | null>(null);
  const [tipoPagoCierre, setTipoPagoCierre] = useState<'efectivo' | 'transferencia' | 'combinado'>('efectivo');
  const [efectivoCierre, setEfectivoCierre] = useState(0);
  const [transferenciaCierre, setTransferenciaCierre] = useState(0);
  const [errorCierre, setErrorCierre] = useState('');
  // const busquedaInputRef = useRef<HTMLInputElement>(null);
  const barberos = loadBarberos();

  // Filtrar productos por búsqueda, solo con cantidad > 0, coincidencia parcial e insensible a mayúsculas/minúsculas
  // const productosFiltrados = productos
  //   .filter(p => p.cantidad > 0 && normalizar(p.nombre).includes(normalizar(busqueda)));

  // Al hacer clic en agregar, mostrar input de cantidad
  // const handleAgregarClick = (p: Producto) => {
  //   setProductoParaCantidad(p);
  //   setCantidadAgregar(1);
  //   setError('');
  // };

  // Confirmar cantidad y agregar producto
  const confirmarAgregarProducto = () => {
    if (!productoParaCantidad) return;
    if (cantidadAgregar < 1 || cantidadAgregar > productoParaCantidad.cantidad) {
      setError(`Debes ingresar una cantidad entre 1 y ${productoParaCantidad.cantidad}`);
      return;
    }
    // Descontar stock
    editarProducto({ ...productoParaCantidad, cantidad: productoParaCantidad.cantidad - cantidadAgregar });
    setProductosSeleccionados(prev => [...prev, { ...productoParaCantidad, cantidad: cantidadAgregar }]);
    setProductoParaCantidad(null);
    setCantidadAgregar(1);
    setError('');
  };

  // Al agregar producto, limpiar el campo de búsqueda usando ref
  const agregarProducto = (p: Producto) => {
    setProductosSeleccionados(prev => [...prev, { ...p, cantidad: 1 }]);
    setBusqueda(''); // Limpiar el campo de búsqueda automáticamente
    setError('');
  };

  // Agregar servicio de barbería
  const agregarServicio = () => {
    if (!barbero || costo <= 0) {
      setError('Debes seleccionar un barbero y un costo válido');
      return;
    }
    setServicios(prev => [
      ...prev,
      {
        id: generarId(),
        barbero,
        costo,
        observacion,
        propina: propina > 0 ? propina : undefined,
      },
    ]);
    setBarbero('');
    setCosto(0);
    setObservacion('');
    setPropina(0);
    setError('');
  };

  // Crear factura
  const handleCrearFactura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) {
      setError('Debes ingresar el nombre del cliente');
      return;
    }
    if (productosSeleccionados.length === 0 && servicios.length === 0) {
      setError('Debes agregar al menos un producto o servicio');
      return;
    }
    // Descontar stock FIFO solo al crear la factura
    productosSeleccionados.forEach(pSel => {
      const prod = productos.find(prod => prod.id === pSel.id);
      if (prod) editarProducto({ ...prod, cantidad: prod.cantidad - (pSel.cantidad || 1) });
    });
    agregarFactura({
      id: generarId(),
      cliente,
      productos: productosSeleccionados,
      servicios,
      tipoPago: 'efectivo',
      efectivo: 0,
      transferencia: 0,
      abierta: true,
      fecha: new Date().toISOString(),
    });
    setCliente('');
    setProductosSeleccionados([]);
    setServicios([]);
    setError('');
  };

  // Cerrar factura
  const handleCerrarFactura = (id: string) => {
    const f = facturas.find(fac => fac.id === id);
    if (f) {
      setFacturaCerrando(f);
      setTipoPagoCierre('efectivo');
      setEfectivoCierre(0);
      setTransferenciaCierre(0);
      setErrorCierre('');
    }
  };

  // Obtener solo el lote más antiguo disponible por nombre (FIFO)
  const productosFifo = obtenerLotesFifo(productos, busqueda, productosSeleccionados);

  // Obtener facturas del día
  const hoy = new Date().toISOString().slice(0, 10);
  const facturasHoy = facturas.filter(f => f.fecha.slice(0, 10) === hoy);

  return (
    <div style={{ padding: 32 }}>
      <h2>Facturación</h2>
      <form onSubmit={handleCrearFactura} style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32 }}>
        <h3>Crear nueva factura</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={e => setCliente(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              autoComplete="off"
            />
            {busqueda.trim() !== '' && productosFifo.length > 0 && !productoParaCantidad && (
              <div style={{ maxHeight: 160, overflowY: 'auto', background: '#fff', borderRadius: 6, marginTop: 4, position: 'absolute', width: '100%', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', boxSizing: 'border-box', wordBreak: 'break-all' }}>
                {productosFifo.map(p => (
                  <div key={p.id} style={{ color: 'black', cursor: 'pointer', padding: 6, wordBreak: 'break-all' }} onClick={() => agregarProducto(p)}>
                    <span style={{ color: 'black' }}>{p.nombre} (${p.precioSalida})</span>
                  </div>
                ))}
              </div>
            )}
            {(busqueda.trim() !== '' && productosFifo.length === 0 && !productoParaCantidad) && (
              <div style={{ background: '#fff', borderRadius: 6, marginTop: 4, position: 'absolute', width: '100%', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', color: '#888', padding: 8 }}>
                No hay productos disponibles
              </div>
            )}
            {productoParaCantidad && createPortal(
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
                  <div style={{ marginBottom: 12, color: 'black' }}>
                    <b>{productoParaCantidad.nombre}</b> (Stock: {productoParaCantidad.cantidad})
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={productoParaCantidad.cantidad}
                    value={cantidadAgregar}
                    onChange={e => setCantidadAgregar(Number(e.target.value) || 1)}
                    style={{ width: 80, padding: 6, borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }}
                  />
                  <button type="button" onClick={confirmarAgregarProducto} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', marginRight: 8 }}>Confirmar</button>
                  <button type="button" onClick={() => setProductoParaCantidad(null)} style={{ background: '#888', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold' }}>Cancelar</button>
                  {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h4>Servicios de barbería</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={barbero} onChange={e => setBarbero(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
              <option value="">Barbero</option>
              {barberos.map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" placeholder="Costo" value={costo} onChange={e => setCosto(Number(e.target.value))} style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
            <input type="text" placeholder="Observación" value={observacion} onChange={e => setObservacion(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
            <input type="number" placeholder="Propina" value={propina} onChange={e => setPropina(Number(e.target.value))} style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
            <button type="button" onClick={agregarServicio} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold' }}>Agregar servicio</button>
          </div>
          <ul>
            {productosSeleccionados.map((p, idx) => (
              <li key={p.id + idx} style={{ color: 'black', overflowWrap: 'break-word' }}>
                {p.nombre} (${p.precioSalida}) x {p.cantidad || 1}
                <button onClick={() => {
                  const nuevos = [...productosSeleccionados];
                  nuevos.splice(idx, 1);
                  setProductosSeleccionados(nuevos);
                }} style={{ marginLeft: 8, background: '#b00', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px' }}>Quitar</button>
              </li>
            ))}
          </ul>
        </div>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        <button type="submit" style={{ marginTop: 18, background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16 }}>Crear factura</button>
      </form>

      <h3>Facturas abiertas</h3>
      <table style={{ width: '100%', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
        <thead style={{ background: 'var(--color-marron-oscuro)', color: 'white' }}>
          <tr>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Servicios</th>
            <th>Pago</th>
            <th>Monto</th>
            <th>Propina</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {facturas.filter(f => f.abierta).map(f => (
            <tr key={f.id}>
              <td>{f.cliente}</td>
              <td>{f.productos.map(p => p.nombre).join(', ')}</td>
              <td>{f.servicios.map(s => `${s.barbero} ($${s.costo})`).join(', ')}</td>
              <td>{f.tipoPago}</td>
              <td>${f.efectivo + f.transferencia}</td>
              <td>{f.servicios.reduce((acc, s) => acc + (s.propina || 0), 0)}</td>
              <td>
                {(usuario?.rol === 'admin' || usuario?.rol === 'asistente') && (
                  <>
                    <button onClick={() => setFacturaEditando(f)} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', marginRight: 8 }}>Editar</button>
                    <button onClick={() => handleCerrarFactura(f.id)} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', marginRight: 8 }}>Cerrar</button>
                    {usuario?.rol === 'admin' && (
                      <button onClick={() => {
                        // Devolver productos al stock
                        f.productos.forEach(p => {
                          const prod = productos.find(prod => prod.id === p.id);
                          if (prod) editarProducto({ ...prod, cantidad: prod.cantidad + (p.cantidad || 1) });
                        });
                        descartarFactura(f.id);
                      }} style={{ background: '#b00', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Descartar</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {facturaEditando && <EditarFacturaModal factura={facturaEditando} productos={productos} setFacturaEditando={setFacturaEditando} editarFactura={editarFactura} generarId={generarId} setError={setError} />}
      {facturaCerrando && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
            <h3 style={{ color: '#4C2E00', marginBottom: 16 }}>Cerrar factura</h3>
            <div style={{ marginBottom: 12, color: 'black' }}>
              <b>Total a pagar:</b> ${
                (facturaCerrando.productos.reduce((acc, p) => acc + (p.precioSalida * (p.cantidad || 1)), 0) +
                facturaCerrando.servicios.reduce((acc, s) => acc + s.costo + (s.propina || 0), 0))
              }
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Tipo de pago:</b>
              <select value={tipoPagoCierre} onChange={e => setTipoPagoCierre(e.target.value as 'efectivo' | 'transferencia' | 'combinado')} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', color: 'black', marginLeft: 8 }}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="combinado">Combinado</option>
              </select>
            </div>
            {tipoPagoCierre === 'efectivo' && (
              <input type="number" placeholder="Monto en efectivo" value={efectivoCierre} onChange={e => setEfectivoCierre(Number(e.target.value))} style={{ width: 160, padding: 8, borderRadius: 6, border: '1px solid #ccc', color: 'black', marginBottom: 8 }} />
            )}
            {tipoPagoCierre === 'transferencia' && (
              <input type="number" placeholder="Monto en transferencia" value={transferenciaCierre} onChange={e => setTransferenciaCierre(Number(e.target.value))} style={{ width: 160, padding: 8, borderRadius: 6, border: '1px solid #ccc', color: 'black', marginBottom: 8 }} />
            )}
            {tipoPagoCierre === 'combinado' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <label style={{ color: '#4C2E00', fontWeight: 'bold' }}>Efectivo:</label>
                <input type="number" placeholder="Efectivo" value={efectivoCierre} onChange={e => setEfectivoCierre(Number(e.target.value))} style={{ width: 100, padding: 8, borderRadius: 6, border: '1px solid #ccc', color: 'black' }} />
                <label style={{ color: '#4C2E00', fontWeight: 'bold' }}>Transferencia:</label>
                <input type="number" placeholder="Transferencia" value={transferenciaCierre} onChange={e => setTransferenciaCierre(Number(e.target.value))} style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #ccc', color: 'black' }} />
              </div>
            )}
            {errorCierre && <div style={{ color: 'red', marginBottom: 8 }}>{errorCierre}</div>}
            <button type="button" onClick={() => {
              const total = (facturaCerrando.productos.reduce((acc, p) => acc + (p.precioSalida * (p.cantidad || 1)), 0) + facturaCerrando.servicios.reduce((acc, s) => acc + s.costo + (s.propina || 0), 0));
              if (tipoPagoCierre === 'efectivo' && efectivoCierre < total) {
                setErrorCierre('El monto en efectivo debe ser igual al total');
                return;
              }
              if (tipoPagoCierre === 'transferencia' && transferenciaCierre < total) {
                setErrorCierre('El monto en transferencia debe ser igual al total');
                return;
              }
              if (tipoPagoCierre === 'combinado' && (efectivoCierre + transferenciaCierre !== total)) {
                setErrorCierre('La suma de efectivo y transferencia debe ser igual al total');
                return;
              }
              cerrarFactura(facturaCerrando.id);
              editarFactura({ ...facturaCerrando, tipoPago: tipoPagoCierre, efectivo: efectivoCierre, transferencia: transferenciaCierre, abierta: false, fecha: new Date().toISOString() });
              setFacturaCerrando(null);
            }} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', marginRight: 8 }}>Confirmar pago y cerrar</button>
            <button type="button" onClick={() => setFacturaCerrando(null)} style={{ background: '#888', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold' }}>Cancelar</button>
          </div>
        </div>,
        document.body
      )}
      {/* Historial de facturas del día */}
      {(usuario?.rol === 'admin' || usuario?.rol === 'barbero') && (
        <div style={{ marginTop: 48 }}>
          <h3>Historial de facturas de hoy</h3>
          <table style={{ width: '100%', background: 'white', borderRadius: 8, overflow: 'hidden', color: 'black' }}>
            <thead style={{ background: 'var(--color-marron-oscuro)', color: 'white' }}>
              <tr>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Servicios</th>
                <th>Propina</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {facturasHoy.map(f => (
                <tr key={f.id}>
                  <td>{f.cliente}</td>
                  <td>{f.productos.map(p => p.nombre).join(', ')}</td>
                  <td>{f.servicios.map(s => `${s.barbero} ($${s.costo})`).join(', ')}</td>
                  <td>{f.servicios.reduce((acc, s) => acc + (s.propina || 0), 0)}</td>
                  <td>${(f.productos.reduce((acc, p) => acc + (p.precioSalida * (p.cantidad || 1)), 0) + f.servicios.reduce((acc, s) => acc + s.costo + (s.propina || 0), 0))}</td>
                  <td>{f.abierta ? 'Abierta' : 'Cerrada'}</td>
                  <td>{new Date(f.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 