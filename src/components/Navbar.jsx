import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { accountId } = useContext(AuthContext);
  const location = useLocation();

  // Si no hay cuenta logueada (ej. estamos en el Login), no dibujamos el menú
  if (!accountId) return null; 

  // Función para saber qué pestaña está activa y pintarla de azul
  const getNavStyle = (path) => ({
    padding: '15px 20px',
    textDecoration: 'none',
    color: location.pathname === path ? '#3b82f6' : '#64748b',
    fontWeight: 'bold',
    borderBottom: location.pathname === path ? '3px solid #3b82f6' : '3px solid transparent',
    transition: 'all 0.3s'
  });

  return (
    <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <h2 style={{ margin: 0, color: '#0f172a', letterSpacing: '-1px', padding: '15px 0' }}>
          Gomez Capital<span style={{ color: '#3b82f6' }}>.</span>
        </h2>
        
        <nav style={{ display: 'flex', height: '100%' }}>
          <Link to="/dashboard" style={getNavStyle('/dashboard')}>📊 Dashboard</Link>
          <Link to="/estrategias" style={getNavStyle('/estrategias')}>🧠 Estrategias & Playbooks</Link>
        </nav>
      </div>

      <div style={{ color: '#94a3b8', fontSize: '0.9em', fontWeight: 'bold' }}>
        ID de Bóveda: {accountId.split('-')[0]}...
      </div>
    </div>
  );
}