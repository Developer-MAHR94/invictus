import { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

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
function saveBarberos(barberos: string[]) {
  localStorage.setItem(BARBEROS_KEY, JSON.stringify(barberos));
}

function loadUsuarios() {
  try {
    const data = localStorage.getItem('usuarios');
    return data ? JSON.parse(data) : [
      { usuario: 'luis.paez', clave: '1234', rol: 'admin' },
      { usuario: 'natali.gomez', clave: '1002158638', rol: 'asistente' },
      { usuario: 'jose.torres', clave: '1044215117', rol: 'barbero' },
      { usuario: 'breiner.ferrer', clave: '1002185092', rol: 'barbero' },
      { usuario: 'edinson.vergara', clave: '1001914098', rol: 'barbero' },
    ];
  } catch {
    return [];
  }
}
function saveUsuarios(usuarios: Array<{usuario: string; clave: string; rol: string; nombre?: string; apellido?: string}>) {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function loadPropinasPendientes() {
  try {
    const data = localStorage.getItem('propinasPendientes');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
function savePropinasPendientes(obj: {[barbero: string]: number}) {
  localStorage.setItem('propinasPendientes', JSON.stringify(obj));
}
function loadHistorialPropinas() {
  try {
    const data = localStorage.getItem('historialPropinas');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveHistorialPropinas(arr: Array<{barbero: string; monto: number; fecha: string}>) {
  localStorage.setItem('historialPropinas', JSON.stringify(arr));
}

export default function PerfilAdmin() {
  const { facturas } = useAppData();
  const [barberos, setBarberos] = useState<string[]>(() => loadBarberos());
  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [claveBarbero, setClaveBarbero] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; clave: string; rol: string; nombre?: string; apellido?: string}>>(() => loadUsuarios());
  const [propinasPendientes, setPropinasPendientes] = useState<{[barbero: string]: number}>(() => loadPropinasPendientes());
  const [historialPropinas, setHistorialPropinas] = useState<Array<{barbero: string; monto: number; fecha: string}>>(() => loadHistorialPropinas());
  const [montoEntrega, setMontoEntrega] = useState<{ [barbero: string]: string }>({});
  const [nombreBarbero, setNombreBarbero] = useState('');
  const [apellidoBarbero, setApellidoBarbero] = useState('');

  useEffect(() => { saveBarberos(barberos); }, [barberos]);
  useEffect(() => { saveUsuarios(usuarios); }, [usuarios]);
  useEffect(() => { savePropinasPendientes(propinasPendientes); }, [propinasPendientes]);
  useEffect(() => { saveHistorialPropinas(historialPropinas); }, [historialPropinas]);
  useEffect(() => {
    // Asegura que admin y asistente tengan nombre y apellido correctos
    setUsuarios(prev => {
      let changed = false;
      const actualizados = prev.map(u => {
        if (u.usuario === 'luis.paez') {
          changed = true;
          return { ...u, nombre: 'Luis', apellido: 'Paez', rol: 'admin', clave: '1234' };
        }
        if (u.usuario === 'natali.gomez') {
          changed = true;
          return { ...u, nombre: 'Nataly', apellido: 'Gomez', rol: 'asistente', clave: '1002158638' };
        }
        return u;
      });
      // Si no existen, agrégalos
      const existeAdmin = actualizados.some(u => u.usuario === 'luis.paez');
      const existeAux = actualizados.some(u => u.usuario === 'natali.gomez');
      const nuevos = [...actualizados];
      if (!existeAdmin) {
        nuevos.push({ usuario: 'luis.paez', nombre: 'Luis', apellido: 'Paez', rol: 'admin', clave: '1234' });
        changed = true;
      }
      if (!existeAux) {
        nuevos.push({ usuario: 'natali.gomez', nombre: 'Nataly', apellido: 'Gomez', rol: 'asistente', clave: '1002158638' });
        changed = true;
      }
      return changed ? nuevos : prev;
    });
  }, []);

  // Estadísticas
  const facturasCerradas = facturas.filter(f => !f.abierta);
  const totalVentas = facturasCerradas.reduce((acc, f) => acc + f.efectivo + f.transferencia, 0);
  const totalServicios = facturasCerradas.reduce((acc, f) => acc + f.servicios.length, 0);
  const totalGananciaProductos = facturasCerradas.reduce((acc, f) => acc + f.productos.reduce((a, p) => a + (p.precioSalida - p.precioEntrada), 0), 0);
  const totalGananciaAdmin = facturasCerradas.reduce((acc, f) => acc + f.servicios.reduce((a, s) => a + s.costo * 0.5, 0), 0) + totalGananciaProductos;

  // Ganancias individuales por barbero
  const gananciasBarberos = barberos.map(b => {
    const servicios = facturasCerradas.flatMap(f => f.servicios.filter(s => s.barbero === b));
    const cortes = servicios.length;
    const ganado = servicios.reduce((acc, s) => acc + s.costo * 0.5, 0);
    const propinas = servicios.reduce((acc, s) => acc + (s.propina || 0), 0);
    return { barbero: b, cortes, ganado, propinas };
  });

  // Acumular propinas pendientes al cerrar facturas (solo para facturas cerradas nuevas)
  useEffect(() => {
    // Recalcular propinas pendientes desde cero
    const pendientes: {[barbero: string]: number} = {};
    barberos.forEach(b => { pendientes[b] = 0; });
    facturasCerradas.forEach(f => {
      f.servicios.forEach(s => {
        if (s.barbero && s.propina) {
          pendientes[s.barbero] = (pendientes[s.barbero] || 0) + s.propina;
        }
      });
    });
    // Restar entregas del historial
    historialPropinas.forEach(e => {
      if (pendientes[e.barbero] !== undefined) {
        pendientes[e.barbero] -= e.monto;
      }
    });
    const iguales = JSON.stringify(pendientes) === JSON.stringify(propinasPendientes);
    if (!iguales) setPropinasPendientes(pendientes);
  }, [facturasCerradas, barberos, historialPropinas, propinasPendientes]);

  // Agregar barbero
  const handleAgregarBarbero = () => {
    if (!nombreBarbero || !apellidoBarbero || !nuevoBarbero || !claveBarbero) {
      setError('Debes ingresar nombre, apellido, usuario y clave del barbero');
      return;
    }
    if (barberos.includes(nuevoBarbero)) {
      setError('Ese barbero ya existe');
      return;
    }
    if (usuarios.some(u => u.usuario === nuevoBarbero)) {
      setError('Ese usuario ya existe');
      return;
    }
    setBarberos(prev => [...prev, nuevoBarbero]);
    setUsuarios(prev => [...prev, { usuario: nuevoBarbero, clave: claveBarbero, rol: 'barbero', nombre: nombreBarbero, apellido: apellidoBarbero }]);
    setNuevoBarbero('');
    setClaveBarbero('');
    setNombreBarbero('');
    setApellidoBarbero('');
    setError('');
  };

  // Eliminar barbero (solo si no tiene cortes activos)
  const handleEliminarBarbero = (b: string) => {
    const tieneCortes = facturasCerradas.some(f => f.servicios.some(s => s.barbero === b));
    if (tieneCortes) {
      setError('No se puede eliminar un barbero con servicios registrados');
      return;
    }
    setBarberos(prev => prev.filter(barb => barb !== b));
    setUsuarios(prev => prev.filter(u => u.usuario !== b));
    setError('');
  };

  // Edición de nombre y apellido
  const handleEditarNombreApellido = (usuario: string, nombre: string, apellido: string) => {
    setUsuarios(prev => prev.map(u => u.usuario === usuario ? { ...u, nombre, apellido } : u));
  };

  const handleEntregarPropina = (barbero: string) => {
    const monto = parseInt(montoEntrega[barbero] || '0', 10);
    if (isNaN(monto) || monto <= 0) {
      setError('Monto inválido');
      return;
    }
    if (monto > (propinasPendientes[barbero] || 0)) {
      setError('No puedes entregar más de lo pendiente');
      return;
    }
    setHistorialPropinas(prev => [...prev, { barbero, monto, fecha: new Date().toISOString() }]);
    setMontoEntrega(prev => ({ ...prev, [barbero]: '' }));
    setError('');
  };

  // Obtener datos del admin
  const adminUser = usuarios.find(u => u.usuario === 'luis.paez');
  const nombreAdmin = adminUser ? `${adminUser.nombre || ''} ${adminUser.apellido || ''}`.trim() : 'Administrador';

  return (
    <div style={{ padding: 32 }}>
      <h2>Perfil del Administrador</h2>
      <h3 style={{ color: '#4C2E00', marginTop: 0 }}>{nombreAdmin}</h3>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#b00', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', marginBottom: 24 }}>Borrar todo (pruebas)</button>
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32, color: 'black' }}>
        <h3>Estadísticas generales</h3>
        <p><b>Total ventas:</b> ${totalVentas}</p>
        <p><b>Total servicios:</b> {totalServicios}</p>
        <p><b>Ganancia por productos:</b> ${totalGananciaProductos}</p>
        <p><b>Ganancia propia (50% de servicios + ganancia productos):</b> ${totalGananciaAdmin}</p>
      </div>
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32, color: 'black' }}>
        <h3>Gestión de barberos</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Nombre" value={nombreBarbero} onChange={e => setNombreBarbero(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }} />
          <input type="text" placeholder="Apellido" value={apellidoBarbero} onChange={e => setApellidoBarbero(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }} />
          <input type="text" placeholder="Usuario barbero" value={nuevoBarbero} onChange={e => setNuevoBarbero(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }} />
          <input type="password" placeholder="Clave" value={claveBarbero} onChange={e => setClaveBarbero(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }} />
          <button onClick={handleAgregarBarbero} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold' }}>Agregar</button>
        </div>
        {/* Advertencia de propinas negativas */}
        {Object.values(propinasPendientes).some(v => (v as number) < 0) && (
          <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 12 }}>
            ¡Atención! Hay propinas pendientes negativas. Revisa el historial de entregas y las facturas cerradas.
          </div>
        )}
        <ul>
          {barberos.map((b: string) => {
            const user = usuarios.find(u => u.usuario === b);
            const saldo = propinasPendientes[b] || 0;
            return (
              <li key={b} style={{ marginBottom: 12 }}>
                <b>{user ? `${user.nombre} ${user.apellido}` : b}</b>
                <span style={{ marginLeft: 12 }}>Propinas pendientes: <b>${saldo}</b></span>
                <input type="number" min={1} max={saldo > 0 ? saldo : 0} placeholder="Monto a entregar" value={montoEntrega[b] || ''} onChange={e => setMontoEntrega(prev => ({ ...prev, [b]: e.target.value }))} style={{ marginLeft: 12, width: 100, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
                <button onClick={() => handleEntregarPropina(b)} style={{ marginLeft: 8, background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 'bold' }} disabled={saldo <= 0}>Entregar</button>
                <button onClick={() => handleEliminarBarbero(b)} style={{ marginLeft: 12, background: '#b00', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 'bold' }}>Eliminar</button>
                {/* Edición de nombre y apellido */}
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" value={user?.nombre || ''} onChange={e => handleEditarNombreApellido(b, e.target.value, user?.apellido || '')} placeholder="Nombre" style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                  <input type="text" value={user?.apellido || ''} onChange={e => handleEditarNombreApellido(b, user?.nombre || '', e.target.value)} placeholder="Apellido" style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', minWidth: 90 }} />
                </div>
              </li>
            );
          })}
        </ul>
        <div style={{ marginTop: 24 }}>
          <h4>Historial de entregas de propinas</h4>
          <table style={{ width: '100%', background: 'white', borderRadius: 8, overflow: 'hidden', fontSize: 13 }}>
            <thead style={{ background: 'var(--color-marron-oscuro)', color: 'white' }}>
              <tr>
                <th>Fecha</th>
                <th>Barbero</th>
                <th>Monto entregado</th>
              </tr>
            </thead>
            <tbody>
              {historialPropinas.map((e, idx) => (
                <tr key={idx}>
                  <td>{new Date(e.fecha).toLocaleString()}</td>
                  <td>{e.barbero}</td>
                  <td>${e.monto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, color: 'black' }}>
        <h3>Ganancias individuales</h3>
        <table style={{ width: '100%', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <thead style={{ background: 'var(--color-marron-oscuro)', color: 'white' }}>
            <tr>
              <th>Barbero</th>
              <th>Cortes</th>
              <th>Ganado (50%)</th>
              <th>Propinas</th>
            </tr>
          </thead>
          <tbody>
            {gananciasBarberos.map(g => (
              <tr key={g.barbero}>
                <td>{g.barbero}</td>
                <td>{g.cortes}</td>
                <td>${g.ganado}</td>
                <td>${g.propinas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 