import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Ya no usamos token. Usamos portfolioId como indicador de sesión activa.
  const [portfolioId, setPortfolioId] = useState(localStorage.getItem('portfolioId'));
  const [userRole, setUserRole] = useState('ROLE_FREE');
  
  // 2. Esta es la nueva llave maestra para mostrar el menú
  const isAuthenticated = !!portfolioId;

  const fetchUserRole = useCallback(async () => {
    if (!portfolioId) return; 
    try {
      const response = await api.get('/users/me');
      setUserRole(response.data.role); 
    } catch (error) {
      console.error("Error obteniendo el rol del usuario:", error);
      setUserRole('ROLE_FREE');
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  // 3. El login ya solo recibe el portfolioId
  const login = (newPortfolioId) => {
    setPortfolioId(newPortfolioId);
    localStorage.setItem('portfolioId', newPortfolioId);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // <-- Destruye la cookie en el backend
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      setPortfolioId(null);
      setUserRole('ROLE_FREE');
      localStorage.removeItem('portfolioId');
      window.location.href = '/login'; // Forzamos redirección limpia
    }
  };

  return (
    // 4. Exportamos isAuthenticated para que el Navbar sepa si mostrar los botones
    <AuthContext.Provider value={{ isAuthenticated, portfolioId, userRole, fetchUserRole, setPortfolioId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};