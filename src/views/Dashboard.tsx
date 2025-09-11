import { useEffect, useState } from 'react';
import { usuarioService } from '../services/supabaseService';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; nombre?: string; apellido?: string}>>([]);
  const { facturas } = useAppData();
  const { usuario } = useAuth();
  
  // Cargar usuarios desde Supabase
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const usuariosData = await usuarioService.getUsuarios();
        const usuariosMapeados = usuariosData.map(u => ({
          usuario: u.usuario,
          nombre: u.nombre || undefined,
          apellido: u.apellido || undefined
        }));
        setUsuarios(usuariosMapeados);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };
    
    loadUsuarios();
  }, []);

  // Calcular totales del día
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  const facturasHoy = facturas.filter(f => !f.abierta && f.fecha.slice(0, 10) === hoy);
  const totalEfectivoHoy = facturasHoy.reduce((acc, f) => acc + f.efectivo, 0);
  const totalTransferenciaHoy = facturasHoy.reduce((acc, f) => acc + f.transferencia, 0);
  const totalGeneralHoy = totalEfectivoHoy + totalTransferenciaHoy;
  const totalFacturasHoy = facturasHoy.length;

  const user = usuarios.find(u => u.usuario === 'natali.gomez');
  const nombreCompleto = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Asistente';
  
  return (
    <div style={{ padding: 32 }}>
      <h2>Dashboard</h2>
      <h3 style={{ color: '#4C2E00', marginTop: 0 }}>{nombreCompleto}</h3>
      <p>Desde aquí puedes acceder a las funciones principales del sistema.</p>
      
      {/* Totales del día */}
      <div style={{ background: 'var(--color-gris-claro)', padding: 24, borderRadius: 10, marginTop: 24, color: 'black' }}>
        <h3 style={{ color: '#4C2E00', marginTop: 0 }}>Resumen del día</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, textAlign: 'center', border: '2px solid #4C2E00' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4C2E00' }}>Efectivo</h4>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#2E7D32' }}>${totalEfectivoHoy.toLocaleString()}</p>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, textAlign: 'center', border: '2px solid #4C2E00' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4C2E00' }}>Transferencia</h4>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#1976D2' }}>${totalTransferenciaHoy.toLocaleString()}</p>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, textAlign: 'center', border: '2px solid #4C2E00' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4C2E00' }}>Total General</h4>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#4C2E00' }}>${totalGeneralHoy.toLocaleString()}</p>
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, textAlign: 'center', border: '2px solid #4C2E00' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4C2E00' }}>Facturas</h4>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#FF6F00' }}>{totalFacturasHoy}</p>
          </div>
        </div>
        <p style={{ margin: '16px 0 0 0', fontSize: 14, color: '#666', textAlign: 'center' }}>
          Última actualización: {new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
        </p>
      </div>
    </div>
  );
} 