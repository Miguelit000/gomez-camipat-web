import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // <-- CAMBIO CLAVE: Ahora guardamos el portfolioId
  const [portfolioId, setPortfolioId] = useState(localStorage.getItem('portfolioId'));

  const login = (newToken, newPortfolioId) => {
    setToken(newToken);
    setPortfolioId(newPortfolioId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('portfolioId', newPortfolioId);
  };

  const logout = () => {
    setToken(null);
    setPortfolioId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('portfolioId');
  };

  return (
    <AuthContext.Provider value={{ token, portfolioId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};