import { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { usuarioService, barberoService, propinaService } from '../services/supabaseService';

export default function PerfilAdmin() {
  const { facturas } = useAppData();
  const [barberos, setBarberos] = useState<string[]>([]);
  const [nuevoBarbero, setNuevoBarbero] = useState('');
  const [claveBarbero, setClaveBarbero] = useState('');
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; clave: string; rol: string; nombre?: string; apellido?: string}>>([]);
  const [propinasPendientes, setPropinasPendientes] = useState<{[barbero: string]: number}>({});
  const [historialPropinas, setHistorialPropinas] = useState<Array<{barbero: string; monto: number; fecha: string}>>([]);
  const [montoEntrega, setMontoEntrega] = useState<{ [barbero: string]: string }>({});
  const [nombreBarbero, setNombreBarbero] = useState('');
  const [apellidoBarbero, setApellidoBarbero] = useState('');
  
  // Estados para cambio de contraseña
  const [mostrarCambioClave, setMostrarCambioClave] = useState(false);
  const [claveActual, setClaveActual] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [mensajeClave, setMensajeClave] = useState('');

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usuariosData, barberosData, propinasData] = await Promise.all([
          usuarioService.getUsuarios(),
          barberoService.getBarberos(),
          propinaService.getPropinas()
        ]);
        
        // Mapear usuarios de Supabase al formato de la app
        const usuariosMapeados = usuariosData.map(u => ({
          usuario: u.usuario,
          clave: u.clave,
          rol: u.rol,
          nombre: u.nombre || undefined,
          apellido: u.apellido || undefined
        }));
        
        setUsuarios(usuariosMapeados);
        setBarberos(barberosData.map(b => b.usuario));
        
        // Calcular propinas pendientes
        const propinasPendientesCalc: {[barbero: string]: number} = {};
        const historial: Array<{barbero: string; monto: number; fecha: string}> = [];
        
        propinasData.forEach(propina => {
          if (!propina.entregada) {
            propinasPendientesCalc[propina.barbero] = (propinasPendientesCalc[propina.barbero] || 0) + propina.monto;
          } else {
            historial.push({
              barbero: propina.barbero,
              monto: propina.monto,
              fecha: propina.fecha
            });
          }
        });
        
        setPropinasPendientes(propinasPendientesCalc);
        setHistorialPropinas(historial);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    
    loadData();
  }, []);
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
  const handleAgregarBarbero = async () => {
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
    
    try {
      // Crear usuario en Supabase
      const nuevoUsuario = await usuarioService.crearUsuario({
        usuario: nuevoBarbero,
        clave: claveBarbero,
        rol: 'barbero',
        nombre: nombreBarbero,
        apellido: apellidoBarbero
      });
      
      // Crear barbero en Supabase
      const nuevoBarberoData = await barberoService.crearBarbero({
        usuario: nuevoBarbero,
        nombre: nombreBarbero,
        apellido: apellidoBarbero
      });
      
      if (nuevoUsuario && nuevoBarberoData) {
        setBarberos(prev => [...prev, nuevoBarbero]);
        setUsuarios(prev => [...prev, { 
          usuario: nuevoBarbero, 
          clave: claveBarbero, 
          rol: 'barbero', 
          nombre: nombreBarbero, 
          apellido: apellidoBarbero 
        }]);
        setNuevoBarbero('');
        setClaveBarbero('');
        setNombreBarbero('');
        setApellidoBarbero('');
        setError('');
      } else {
        setError('Error al crear el barbero');
      }
    } catch (error) {
      console.error('Error agregando barbero:', error);
      setError('Error de conexión. Intenta de nuevo.');
    }
  };

  // Eliminar barbero (solo si no tiene cortes activos)
  const handleEliminarBarbero = async (b: string) => {
    const tieneCortes = facturasCerradas.some(f => f.servicios.some(s => s.barbero === b));
    if (tieneCortes) {
      setError('No se puede eliminar un barbero con servicios registrados');
      return;
    }
    
    try {
      // Obtener el ID del barbero para eliminarlo
      const barberosData = await barberoService.getBarberos();
      const barberoAEliminar = barberosData.find(barbero => barbero.usuario === b);
      
      if (barberoAEliminar) {
        const eliminado = await barberoService.eliminarBarbero(barberoAEliminar.id);
        if (eliminado) {
          setBarberos(prev => prev.filter(barb => barb !== b));
          setUsuarios(prev => prev.filter(u => u.usuario !== b));
          setError('');
        } else {
          setError('Error al eliminar el barbero');
        }
      } else {
        setError('Barbero no encontrado');
      }
    } catch (error) {
      console.error('Error eliminando barbero:', error);
      setError('Error de conexión. Intenta de nuevo.');
    }
  };

  // Edición de nombre y apellido
  const handleEditarNombreApellido = (usuario: string, nombre: string, apellido: string) => {
    setUsuarios(prev => prev.map(u => u.usuario === usuario ? { ...u, nombre, apellido } : u));
  };

  const handleEntregarPropina = async (barbero: string) => {
    const monto = parseInt(montoEntrega[barbero] || '0', 10);
    if (isNaN(monto) || monto <= 0) {
      setError('Monto inválido');
      return;
    }
    if (monto > (propinasPendientes[barbero] || 0)) {
      setError('No puedes entregar más de lo pendiente');
      return;
    }
    
    try {
      // Crear propina entregada en Supabase
      const nuevaPropina = await propinaService.crearPropina({
        barbero: barbero,
        monto: monto,
        fecha: new Date().toISOString().split('T')[0], // Solo la fecha
        entregada: true
      });
      
      if (nuevaPropina) {
        setHistorialPropinas(prev => [...prev, { barbero, monto, fecha: new Date().toISOString() }]);
        setMontoEntrega(prev => ({ ...prev, [barbero]: '' }));
        setError('');
      } else {
        setError('Error al registrar la entrega de propina');
      }
    } catch (error) {
      console.error('Error entregando propina:', error);
      setError('Error de conexión. Intenta de nuevo.');
    }
  };

  // Función para cambiar contraseña del administrador
  const handleCambiarClave = async () => {
    if (!nuevaClave || !confirmarClave || !claveActual) {
      setMensajeClave('Todos los campos son obligatorios');
      return;
    }
    
    if (nuevaClave !== confirmarClave) {
      setMensajeClave('Las contraseñas no coinciden');
      return;
    }
    
    if (nuevaClave.length < 4) {
      setMensajeClave('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    try {
      // Verificar que la contraseña actual es correcta
      const adminUser = await usuarioService.login('luis.paez', claveActual);
      if (!adminUser) {
        setMensajeClave('La contraseña actual es incorrecta');
        return;
      }
      
      // Actualizar la contraseña en Supabase
      const actualizado = await usuarioService.actualizarUsuario(adminUser.id, {
        clave: nuevaClave
      });
      
      if (actualizado) {
        setMensajeClave('Contraseña actualizada correctamente');
        setClaveActual('');
        setNuevaClave('');
        setConfirmarClave('');
        setMostrarCambioClave(false);
        
        // Actualizar el estado local
        setUsuarios(prev => prev.map(u => 
          u.usuario === 'luis.paez' ? { ...u, clave: nuevaClave } : u
        ));
      } else {
        setMensajeClave('Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setMensajeClave('Error de conexión. Intenta de nuevo.');
    }
  };

  // Obtener datos del admin
  const adminUser = usuarios.find(u => u.usuario === 'luis.paez');
  const nombreAdmin = adminUser ? `${adminUser.nombre || ''} ${adminUser.apellido || ''}`.trim() : 'Administrador';

  return (
    <div style={{ padding: 32 }}>
      <h2>Perfil del Administrador</h2>
      <h3 style={{ color: '#4C2E00', marginTop: 0 }}>{nombreAdmin}</h3>
      
      {/* Sección de cambio de contraseña */}
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 24, color: 'black' }}>
        <h3>Cambiar Contraseña</h3>
        {!mostrarCambioClave ? (
          <button 
            onClick={() => setMostrarCambioClave(true)}
            style={{ 
              background: 'var(--color-marron-oscuro)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 6, 
              padding: '10px 20px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cambiar mi contraseña
          </button>
        ) : (
          <div style={{ maxWidth: 400 }}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={claveActual}
                onChange={e => setClaveActual(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaClave}
                onChange={e => setNuevaClave(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmarClave}
                onChange={e => setConfirmarClave(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            {mensajeClave && (
              <div style={{ 
                color: mensajeClave.includes('correctamente') ? 'green' : 'red', 
                marginBottom: 12,
                fontWeight: 'bold'
              }}>
                {mensajeClave}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={handleCambiarClave}
                style={{ 
                  background: 'var(--color-marron-oscuro)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Actualizar contraseña
              </button>
              <button 
                onClick={() => {
                  setMostrarCambioClave(false);
                  setClaveActual('');
                  setNuevaClave('');
                  setConfirmarClave('');
                  setMensajeClave('');
                }}
                style={{ 
                  background: '#666', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      

      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32, color: 'black' }}>
        <h3>Estadísticas generales</h3>
        <p><b>Total ventas:</b> ${totalVentas}</p>
        <p><b>Total servicios:</b> {totalServicios}</p>
        <p><b>Ganancia por productos:</b> ${totalGananciaProductos}</p>
        <p><b>Ganancia propia (50% de servicios + ganancia productos):</b> ${totalGananciaAdmin}</p>
      </div>
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginBottom: 32, color: 'black' }}>
        <h3>Gestión de barberos</h3>
        {error && (
          <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 12 }}>
            {error}
          </div>
        )}
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