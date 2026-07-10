import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfile } from '../types/app';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 10 hours in milliseconds
const SESSION_DURATION_MS = 10 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
  }, []);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    const storedExpiresAt = localStorage.getItem('auth_expires_at');

    if (storedUser && storedToken && storedExpiresAt) {
      if (new Date().getTime() < parseInt(storedExpiresAt, 10)) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          // Si hay error parseando, cerramos sesión
          logout();
        }
      } else {
        // La sesión ha expirado
        logout();
      }
    } else if (storedUser || storedToken) {
      // Si hay datos incompletos o falta la fecha de expiración, limpiamos por seguridad
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  // Verificar la expiración periódicamente (cada minuto)
  useEffect(() => {
    if (!user || !token) return;

    const interval = setInterval(() => {
      const storedExpiresAt = localStorage.getItem('auth_expires_at');
      if (storedExpiresAt && new Date().getTime() > parseInt(storedExpiresAt, 10)) {
        logout();
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [user, token, logout]);

  const login = (newUser: UserProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    const expiresAt = new Date().getTime() + SESSION_DURATION_MS;
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_expires_at', expiresAt.toString());
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-emerald-500">Cargando plataforma...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
