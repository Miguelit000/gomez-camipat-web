import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // 1. Si la app apenas se está abriendo, esperamos a que el cerebro revise la caja fuerte
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <h2>⏳ Comprobando seguridad...</h2>
      </div>
    );
  }

  // 2. Si terminó de cargar y NO está autenticado, lo mandamos al inicio (Login)
  if (!isAuthenticated) {
    // "replace" borra el historial para que el usuario no pueda volver atrás con el botón del navegador
    return <Navigate to="/" replace />;
  }

  // 3. Si todo está en orden, renderiza la pantalla que el usuario quería ver (children)
  return children;
}