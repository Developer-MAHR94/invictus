import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Usuario {
  usuario: string;
  rol: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: string, rol: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = (usuario: string, rol: string) => setUsuario({ usuario, rol });
  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 