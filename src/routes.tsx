import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Facturacion from './views/Facturacion';
import Inventario from './views/Inventario';
import PerfilBarbero from './views/PerfilBarbero';
import PerfilAdmin from './views/PerfilAdmin';
import CierresCaja from './views/CierresCaja';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, roles }: { children: React.ReactElement, roles?: string[] }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" />;
  return children;
}

export default function AppRoutes() {
  const { usuario, logout } = useAuth();
  return (
    <BrowserRouter>
      {usuario && <Navbar rol={usuario.rol} onLogout={logout} />}
      <Routes>
        <Route path="/" element={usuario ? <Navigate to={usuario.rol === 'admin' ? '/perfil-admin' : usuario.rol === 'asistente' ? '/dashboard' : '/perfil-barbero'} /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={["asistente"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/facturacion" element={<ProtectedRoute roles={["admin","asistente"]}><Facturacion /></ProtectedRoute>} />
        <Route path="/inventario" element={<ProtectedRoute roles={["admin","asistente"]}><Inventario /></ProtectedRoute>} />
        <Route path="/perfil-barbero" element={<ProtectedRoute roles={["barbero"]}><PerfilBarbero /></ProtectedRoute>} />
        <Route path="/perfil-admin" element={<ProtectedRoute roles={["admin"]}><PerfilAdmin /></ProtectedRoute>} />
        <Route path="/cierres-caja" element={<ProtectedRoute roles={["admin","asistente"]}><CierresCaja /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
} 