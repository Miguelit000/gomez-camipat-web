import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
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
    // <-- CAMBIO: Añadimos setPortfolioId para que los demás componentes puedan cambiar la cuenta activa
    <AuthContext.Provider value={{ token, portfolioId, setPortfolioId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};