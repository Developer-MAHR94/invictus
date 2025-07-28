import { useEffect, useState } from 'react';
import { usuarioService } from '../services/supabaseService';

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; nombre?: string; apellido?: string}>>([]);
  
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
  const user = usuarios.find(u => u.usuario === 'natali.gomez');
  const nombreCompleto = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Asistente';
  return (
    <div style={{ padding: 32 }}>
      <h2>Perfil de la Asistente</h2>
      <h3 style={{ color: '#4C2E00', marginTop: 0 }}>{nombreCompleto}</h3>
      <p>Desde aquí puedes acceder a las funciones principales del sistema.</p>
    </div>
  );
} 