import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  // Extraemos directamente el 'token' de nuestro cerebro central
  const { token } = useContext(AuthContext);

  // Si NO hay token (es decir, es nulo o no está autenticado), lo mandamos al Login
  if (!token) {
    // "replace" borra el historial para que el usuario no pueda volver atrás
    return <Navigate to="/login" replace />;
  }

  // Si hay token, todo está en orden, renderiza la pantalla que quería ver
  return children;
}