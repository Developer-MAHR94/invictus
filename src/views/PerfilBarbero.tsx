import { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { usuarioService, propinaService } from '../services/supabaseService';

export default function PerfilBarbero() {
  const { facturas, cierres } = useAppData();
  const { usuario } = useAuth();
  const [propinasPendientes, setPropinasPendientes] = useState<{[barbero: string]: number}>({});
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; nombre?: string; apellido?: string}>>([]);

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usuariosData, propinasData] = await Promise.all([
          usuarioService.getUsuarios(),
          propinaService.getPropinas()
        ]);
        
        // Mapear usuarios
        const usuariosMapeados = usuariosData.map(u => ({
          usuario: u.usuario,
          nombre: u.nombre || undefined,
          apellido: u.apellido || undefined
        }));
        setUsuarios(usuariosMapeados);
        
        // Calcular propinas pendientes
        const propinasPendientesCalc: {[barbero: string]: number} = {};
        propinasData.forEach(propina => {
          if (!propina.entregada) {
            propinasPendientesCalc[propina.barbero] = (propinasPendientesCalc[propina.barbero] || 0) + propina.monto;
          }
        });
        setPropinasPendientes(propinasPendientesCalc);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    
    loadData();
  }, []);

  if (!usuario) return null;

  const userData = usuarios.find((u: {usuario: string; nombre?: string; apellido?: string}) => u.usuario === usuario.usuario);
  const nombreCompleto = userData ? `${userData.nombre || ''} ${userData.apellido || ''}`.trim() : usuario.usuario;

  // Fecha del último cierre semanal
  const ultimoCierreSemanal = [...(cierres || [])].reverse().find(c => c.tipo === 'semanal');
  const fechaInicio = ultimoCierreSemanal ? ultimoCierreSemanal.fecha : '1970-01-01';

  // Servicios del barbero actual en facturas cerradas de hoy
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const serviciosHoy = facturas
    .filter(f => !f.abierta && f.fecha.slice(0, 10) === hoy)
    .flatMap(f => f.servicios.filter(s => s.barbero === usuario.usuario));

  // Servicios del barbero actual desde el último cierre semanal
  const serviciosAcumulados = facturas
    .filter(f => !f.abierta && f.fecha.slice(0, 10) >= fechaInicio)
    .flatMap(f => f.servicios.filter(s => s.barbero === usuario.usuario));

  // Ganancias y propinas del día
  const totalGanadoDia = serviciosHoy.reduce((acc, s) => acc + (s.costo * 0.5), 0);
  const totalPropinasDia = serviciosHoy.reduce((acc, s) => acc + (s.propina || 0), 0);
  const totalCortesDia = serviciosHoy.length;
  const totalGeneralDia = totalGanadoDia + totalPropinasDia;

  // Ganancias y propinas acumuladas desde el último cierre semanal
  const totalGanadoAcumulado = serviciosAcumulados.reduce((acc, s) => acc + (s.costo * 0.5), 0);
  // El saldo de propinas pendientes ya descuenta entregas
  const propinasAcumuladas = propinasPendientes[usuario.usuario] || 0;
  const totalCortesAcumulado = serviciosAcumulados.length;
  const totalGeneralAcumulado = totalGanadoAcumulado + propinasAcumuladas;

  return (
    <div style={{ padding: 32 }}>
      <h2>Perfil del Barbero</h2>
      <h3 style={{ color: '#4C2E00', marginTop: 0 }}>{nombreCompleto}</h3>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, minWidth: 280, color: 'black', flex: 1 }}>
          <h3 style={{ color: '#4C2E00' }}>Ganancias y propinas del día</h3>
          <p><b>Ganancia por cortes hoy (50%):</b> ${totalGanadoDia}</p>
          <p><b>Propinas generadas hoy:</b> ${totalPropinasDia}</p>
          <p><b>Total de cortes hoy:</b> {totalCortesDia}</p>
          <p><b>Total general hoy (cortes + propinas):</b> ${totalGeneralDia}</p>
          <small>Las propinas son 100% para el barbero.</small>
        </div>
        <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, minWidth: 280, color: 'black', flex: 1 }}>
          <h3 style={{ color: '#4C2E00' }}>Ganancias y propinas acumuladas</h3>
          <p><b>Ganancia por cortes acumulada (50%):</b> ${totalGanadoAcumulado}</p>
          <p><b>Propinas pendientes por entregar:</b> ${propinasAcumuladas}</p>
          <p><b>Total de cortes acumulados:</b> {totalCortesAcumulado}</p>
          <p><b>Total general acumulado (cortes + propinas):</b> ${totalGeneralAcumulado}</p>
          <small>Este saldo se actualiza cuando el administrador entrega propinas o se cierra la semana.</small>
        </div>
      </div>
    </div>
  );
} 