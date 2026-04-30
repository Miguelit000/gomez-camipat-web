import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [portfolioId, setPortfolioId] = useState(localStorage.getItem('portfolioId'));
  
  // <-- NUEVO: Estado global para el rol real de la base de datos -->
  const [userRole, setUserRole] = useState('ROLE_FREE');

  // <-- NUEVA FUNCIÓN: Consulta a Java el rol actual -->
  const fetchUserRole = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/users/me');
      setUserRole(response.data.role); // Se actualiza globalmente en React
    } catch (error) {
      console.error("Error obteniendo el rol del usuario:", error);
      setUserRole('ROLE_FREE');
    }
  }, [token]);

  // Cada vez que inicias sesión o recargas, busca el rol actual
  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const login = (newToken, newPortfolioId) => {
    setToken(newToken);
    setPortfolioId(newPortfolioId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('portfolioId', newPortfolioId);
  };

  const logout = () => {
    setToken(null);
    setPortfolioId(null);
    setUserRole('ROLE_FREE');
    localStorage.removeItem('token');
    localStorage.removeItem('portfolioId');
  };

  return (
    // <-- Exportamos userRole y fetchUserRole para que el Dashboard los use
    <AuthContext.Provider value={{ token, portfolioId, userRole, fetchUserRole, setPortfolioId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};