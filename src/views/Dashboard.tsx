import { useEffect, useState } from 'react';

function loadUsuarios() {
  try {
    const data = localStorage.getItem('usuarios');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState<Array<{usuario: string; nombre?: string; apellido?: string}>>(() => loadUsuarios());
  // Este useEffect solo debe ejecutarse una vez al montar el componente para cargar los usuarios
  useEffect(() => { setUsuarios(loadUsuarios()); }, []);
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