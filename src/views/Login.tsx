import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

function ensureUsuariosBase() {
  const base = [
    { usuario: 'luis.paez', clave: '1234', rol: 'admin', nombre: 'Luis', apellido: 'Paez' },
    { usuario: 'natali.gomez', clave: '1002158638', rol: 'asistente', nombre: 'Nataly', apellido: 'Gomez' },
    { usuario: 'jose.torres', clave: '1044215117', rol: 'barbero', nombre: 'José', apellido: 'Torres' },
    { usuario: 'breiner.ferrer', clave: '1002185092', rol: 'barbero', nombre: 'Breiner', apellido: 'Ferrer' },
    { usuario: 'edinson.vergara', clave: '1001914098', rol: 'barbero', nombre: 'Edinson', apellido: 'Vergara' },
  ];
  let usuarios: Array<{usuario: string; clave: string; rol: string; nombre?: string; apellido?: string}> = [];
  try {
    const data = localStorage.getItem('usuarios');
    usuarios = data ? JSON.parse(data) : [];
  } catch { usuarios = []; }
  let changed = false;
  base.forEach((u: {usuario: string; clave: string; rol: string; nombre: string; apellido: string}) => {
    if (!usuarios.some((us: {usuario: string}) => us.usuario === u.usuario)) {
      usuarios.push(u);
      changed = true;
    }
  });
  if (changed) localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Este useEffect solo debe ejecutarse una vez al montar el componente para inicializar los usuarios base
  React.useEffect(() => { ensureUsuariosBase(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usuarios = loadUsuarios();
    const user = usuarios.find((u: {usuario: string; clave: string; rol: string}) => u.usuario === usuario && u.clave === clave);
    if (user) {
      login(user.usuario, user.rol);
      if (user.rol === 'admin') navigate('/perfil-admin');
      else if (user.rol === 'asistente') navigate('/dashboard');
      else if (user.rol === 'barbero') navigate('/perfil-barbero');
    } else {
      setError('Usuario o clave incorrectos');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <img src="/logo.png" alt="Logo Invictus Barber" style={{ height: 90, marginBottom: 16 }} />
      <form onSubmit={handleSubmit} style={{ background: 'var(--color-gris-claro)', padding: 32, borderRadius: 12, minWidth: 320 }}>
        <h2 style={{ color: 'var(--color-marron-oscuro)', textAlign: 'center' }}>INVICTUS BARBER</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Clave"
            value={clave}
            onChange={e => setClave(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
          Ingresar
        </button>
      </form>
    </div>
  );
} 