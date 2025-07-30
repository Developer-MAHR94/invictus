import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Producto } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

function generarId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function Inventario() {
  const { productos, agregarProducto, editarProducto, eliminarProducto } = useAppData();
  const { usuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [precioEntrada, setPrecioEntrada] = useState(0);
  const [precioSalida, setPrecioSalida] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [error, setError] = useState('');

  // Eliminar la validación de nombre único:
  // const existeNombre = (nombre: string) => {
  //   return productos.some(p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
  // };

  // Agregar producto
  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre es obligatorio');
      return;
    }
    if (precioEntrada <= 0 || precioSalida <= 0) {
      setError('Precios deben ser mayores a 0');
      return;
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    // Eliminar la validación de duplicado:
    // if (existeNombre(nombre)) {
    //   setError('Ya existe un producto con ese nombre');
    //   return;
    // }
    agregarProducto({
      id: generarId(),
      nombre,
      precioEntrada,
      precioSalida,
      cantidad,
      fechaIngreso: new Date().toISOString(),
    });
    setNombre('');
    setPrecioEntrada(0);
    setPrecioSalida(0);
    setCantidad(0);
    setError('');
  };

  // Editar producto
  const handleEditar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    if (!nombre) {
      setError('El nombre es obligatorio');
      return;
    }
    if (precioEntrada <= 0 || precioSalida <= 0) {
      setError('Precios deben ser mayores a 0');
      return;
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    editarProducto({
      ...editando,
      nombre,
      precioEntrada,
      precioSalida,
      cantidad,
    });
    setEditando(null);
    setNombre('');
    setPrecioEntrada(0);
    setPrecioSalida(0);
    setCantidad(0);
    setError('');
  };

  // Iniciar edición
  const iniciarEdicion = (p: Producto) => {
    setEditando(p);
    setNombre(p.nombre);
    setPrecioEntrada(p.precioEntrada);
    setPrecioSalida(p.precioSalida);
    setCantidad(p.cantidad);
    setError('');
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditando(null);
    setNombre('');
    setPrecioEntrada(0);
    setPrecioSalida(0);
    setCantidad(0);
    setError('');
  };

  // Eliminar producto
  const handleEliminar = (id: string) => {
    eliminarProducto(id);
  };

  // La auxiliar ahora tiene acceso completo al inventario

  return (
    <div style={{ padding: 32 }}>
      <h2>Inventario</h2>
      {(usuario?.rol === 'admin' || usuario?.rol === 'asistente') && (
        <form onSubmit={editando ? handleEditar : handleAgregar} style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32 }}>
          <h3>{editando ? 'Editar producto' : 'Agregar producto'}</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={{ marginBottom: 4, fontWeight: 'bold' }}>Nombre</label>
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                disabled={!!editando}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
              <label style={{ marginBottom: 4, fontWeight: 'bold' }}>Precio de entrada</label>
              <input
                type="number"
                placeholder="Precio de entrada"
                value={precioEntrada}
                onChange={e => setPrecioEntrada(Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                disabled={usuario?.rol !== 'admin'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
              <label style={{ marginBottom: 4, fontWeight: 'bold' }}>Precio de salida</label>
              <input
                type="number"
                placeholder="Precio de salida"
                value={precioSalida}
                onChange={e => setPrecioSalida(Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: 100 }}>
              <label style={{ marginBottom: 4, fontWeight: 'bold' }}>Cantidad</label>
              <input
                type="number"
                placeholder="Cantidad"
                value={cantidad === 0 ? '' : cantidad}
                min={1}
                onChange={e => setCantidad(Number(e.target.value) || 0)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            <button
              type="submit"
              style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, height: 40, alignSelf: 'flex-end' }}
            >
              {editando ? 'Guardar cambios' : 'Agregar'}
            </button>
            {editando && <button type="button" onClick={cancelarEdicion} style={{ background: '#888', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, height: 40, alignSelf: 'flex-end' }}>Cancelar</button>}
          </div>
          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        </form>
      )}
      <h3>Lista de productos</h3>
      <table style={{ width: '100%', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
        <thead style={{ background: 'var(--color-marron-oscuro)', color: 'white' }}>
          <tr>
            <th>Nombre</th>
            <th>Precio entrada</th>
            <th>Precio salida</th>
            <th>Cantidad</th>
            <th>Fecha ingreso</th>
            <th>Ganancia</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} style={{ color: 'black' }}>
              <td style={{ color: 'black' }}>{p.nombre}</td>
              <td style={{ color: 'black' }}>${p.precioEntrada}</td>
              <td style={{ color: 'black' }}>${p.precioSalida}</td>
              <td style={{ color: 'black' }}>{p.cantidad}</td>
              <td style={{ color: 'black' }}>{new Date(p.fechaIngreso).toLocaleDateString()}</td>
              <td style={{ color: 'black' }}>${p.precioSalida - p.precioEntrada}</td>
                             <td>
                 {usuario?.rol === 'admin' && (
                   <>
                     <button onClick={() => iniciarEdicion(p)} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', marginRight: 8 }}>Editar</button>
                     <button onClick={() => handleEliminar(p.id)} style={{ background: '#b00', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Eliminar</button>
                   </>
                 )}
                 {usuario?.rol === 'asistente' && (
                   <button onClick={() => iniciarEdicion(p)} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Editar</button>
                 )}
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 