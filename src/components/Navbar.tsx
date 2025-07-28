import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '/logo.png';

interface NavbarProps {
  rol: string;
  onLogout: () => void;
}

const menuPorRol: Record<string, { label: string; path: string }[]> = {
  admin: [
    { label: 'Inicio', path: '/perfil-admin' },
    { label: 'Facturación', path: '/facturacion' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Cierres de Caja', path: '/cierres-caja' },
  ],
  asistente: [
    { label: 'Inicio', path: '/dashboard' },
    { label: 'Facturación', path: '/facturacion' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Cierres de Caja', path: '/cierres-caja' },
  ],
  barbero: [
    { label: 'Mi Perfil', path: '/perfil-barbero' },
  ],
};

export default function Navbar({ rol, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const menu = menuPorRol[rol] || [];
  const [open, setOpen] = useState(false);

  // Cierra el menú al navegar
  const handleLinkClick = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--color-negro)', color: 'var(--color-blanco)', padding: '0 24px', height: 64,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
        <span style={{ fontWeight: 'bold', fontSize: 22, color: 'var(--color-marron-oscuro)' }}>INVICTUS BARBER</span>
      </div>
      {/* Menú desktop */}
      <div className="navbar-menu-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="navbar-links" style={{ display: 'flex', gap: 24 }}>
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: location.pathname === item.path ? 'var(--color-marron-oscuro)' : 'var(--color-blanco)',
                textDecoration: 'none', fontWeight: 'bold', fontSize: 16
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button onClick={onLogout} style={{ marginLeft: 16, background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
      {/* Menú móvil (hamburguesa) */}
      <div className="navbar-hamburger" style={{ display: 'none', alignItems: 'center' }}>
        <button aria-label="Abrir menú" onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--color-blanco)', fontSize: 28, cursor: 'pointer' }}>
          ☰
        </button>
      </div>
      {/* Menú desplegable móvil */}
      {open && (
        <div className="navbar-mobile-menu" style={{
          position: 'fixed', top: 64, right: 0, left: 0, background: 'var(--color-negro)', color: 'var(--color-blanco)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24, zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}>
          {menu.map(item => (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              style={{ background: 'none', border: 'none', color: location.pathname === item.path ? 'var(--color-marron-oscuro)' : 'var(--color-blanco)', fontWeight: 'bold', fontSize: 18, padding: 8, width: '100%' }}
            >
              {item.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ background: 'var(--color-marron-oscuro)', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', width: '100%' }}>
            Cerrar sesión
          </button>
        </div>
      )}
      <style>{`
        @media (max-width: 800px) {
          .navbar-menu-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (min-width: 801px) {
          .navbar-menu-desktop { display: flex !important; }
          .navbar-hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
} 