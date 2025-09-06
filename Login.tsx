import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuarioService } from '../services/supabaseService';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await usuarioService.login(usuario, clave);
      if (user) {
        login(user.usuario, user.rol);
        if (user.rol === 'admin') navigate('/perfil-admin');
        else if (user.rol === 'asistente') navigate('/dashboard');
        else if (user.rol === 'barbero') navigate('/perfil-barbero');
      } else {
        setError('Usuario o clave incorrectos');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
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
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: 10, 
            background: loading ? '#ccc' : 'var(--color-marron-oscuro)', 
            color: 'white', 
            border: 'none', 
            borderRadius: 6, 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Conectando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
} 