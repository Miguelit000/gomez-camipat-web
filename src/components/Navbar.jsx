import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  // 1. Cambiamos 'token' por 'isAuthenticated'
  const { portfolioId, setPortfolioId, isAuthenticated, userRole } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [newPortData, setNewPortData] = useState({ 
    name: '', 
    initialBalance: 10000, 
    targetBalance: 20000, 
    currency: 'USD' 
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await api.get('/portfolios');
        setPortfolios(res.data);
        
        if (res.data.length > 0 && !portfolioId) {
          setPortfolioId(res.data[0].id);
          localStorage.setItem('portfolioId', res.data[0].id);
        }
      } catch (error) {
        console.error('Error cargando portafolios', error);
      }
    };
    
    // 2. Evaluamos la nueva variable aquí
    if (isAuthenticated && location.pathname !== '/') fetchPortfolios();
  }, [isAuthenticated, location.pathname, portfolioId, setPortfolioId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPortfolio = (newId) => {
    setDropdownOpen(false);
    
    if (newId === "NEW") {
        if (userRole !== 'ROLE_PRO' && userRole !== 'ROLE_ADMIN' && portfolios.length >= 1) {
            alert("Límite alcanzado: Las cuentas gratuitas solo pueden tener 1 portafolio. ¡Mejora a PRO para crear cuentas ilimitadas!");
            return; 
        }
        
        setShowModal(true);
        return;
    }
    
    setPortfolioId(newId);
    localStorage.setItem('portfolioId', newId);
    navigate('/dashboard');
    window.location.reload(); 
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/portfolios', newPortData);
      setPortfolios([...portfolios, res.data]);
      setPortfolioId(res.data.id);
      localStorage.setItem('portfolioId', res.data.id);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error al crear portafolio", error);
      alert("Error al crear la cuenta. Revisa tu conexión.");
    }
  };

  const handleDeletePortfolio = async () => {
    if (!portfolioId) return;
    try {
      await api.delete(`/portfolios/${portfolioId}`);
      setShowDeleteModal(false);
      
      // 1. Buscamos cualquier otro portafolio que el usuario tenga (ej. el Portafolio Principal)
      const portafolioRestante = portfolios.find(p => p.id !== portfolioId);
      
      // 2. Si tiene otro, lo seleccionamos automáticamente para no cerrar la sesión
      if (portafolioRestante) {
        setPortfolioId(portafolioRestante.id);
        localStorage.setItem('portfolioId', portafolioRestante.id);
      } else {
        // (Esto es por pura precaución, aunque el backend ya impide borrar el principal)
        setPortfolioId(null);
        localStorage.removeItem('portfolioId');
      }
      
      // 3. Recargamos el dashboard con el nuevo portafolio seleccionado
      window.location.href = '/dashboard'; 
    } catch (error) {
      console.error("Error al eliminar portafolio", error);
      alert("Error al eliminar la cuenta. Verifica que no tenga operaciones activas.");
    }
  };

  // 3. ¡EL CAUSANTE DEL ERROR! Ahora usamos isAuthenticated para decidir si ocultar el Navbar
  if (!isAuthenticated || location.pathname === '/') return null;

  const currentPortfolio = portfolios.find(p => p.id === portfolioId);

  return (
    <nav style={{ background: '#0f172a', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      
      {/* SECCIÓN IZQUIERDA: Logo y Selector de Cuenta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px', flex: '1 1 auto' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2em', fontWeight: 'bold', minWidth: 'max-content' }}>
          ⚡ AstroTrade
        </Link>
        
        <div ref={dropdownRef} style={{ position: 'relative', background: '#1e293b', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', maxWidth: 'fit-content' }}>
          <span style={{ fontSize: '0.8em', color: '#94a3b8', fontWeight: 'bold' }}>CUENTA:</span>
          
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95em', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span style={{ maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPortfolio ? currentPortfolio.name : 'Cargando...'}
            </span>
            <span style={{ fontSize: '0.8em' }}>▼</span>
          </div>

          {/* 🟢 BOTÓN DE ELIMINAR CUENTA */}
          {portfolioId && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setShowDeleteModal(true);
              }}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1em', padding: '0 0 0 5px', display: 'flex', alignItems: 'center' }}
              title="Eliminar Bóveda Actual"
            >
              🗑️
            </button>
          )}

          {dropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden', minWidth: '220px', zIndex: 4000 }}>
              {portfolios.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectPortfolio(p.id)}
                  style={{ padding: '12px 15px', color: '#0f172a', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: p.id === portfolioId ? 'bold' : 'normal', background: p.id === portfolioId ? '#f8fafc' : 'white' }}
                >
                  {p.name} {p.id === portfolioId && '✓'}
                </div>
              ))}
              <div 
                onClick={() => handleSelectPortfolio('NEW')}
                style={{ padding: '12px 15px', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', background: '#eff6ff' }}
              >
                + Crear Nueva Cuenta
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* SECCIÓN DERECHA: Enlaces tipo Pestaña */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
        
        {/* BOTÓN SECRETO DE ADMINISTRADOR */}
        {userRole === 'ROLE_ADMIN' && (
            <button 
              onClick={() => navigate('/admin')} 
              style={{ padding: '8px 15px', background: '#0f172a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🛡️ Modo Admin
            </button>
        )}

        <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? '#ffffff' : '#94a3b8', background: location.pathname === '/dashboard' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Dashboard
        </Link>
        <Link to="/strategies" style={{ color: location.pathname === '/strategies' ? '#ffffff' : '#94a3b8', background: location.pathname === '/strategies' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Estrategias
        </Link>
        <Link to="/statistics" style={{ color: location.pathname === '/statistics' ? '#ffffff' : '#94a3b8', background: location.pathname === '/statistics' ? '#1e293b' : 'transparent', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9em', transition: 'background 0.2s' }}>
          Estadísticas
        </Link>
      </div>

      {/* MODAL DE CREACIÓN DE CUENTA */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#0f172a', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0 }}>Crear Nueva Cuenta</h3>
            <form onSubmit={handleCreatePortfolio}>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Nombre de la Cuenta</label>
              <input type="text" placeholder="Ej. Reto FTMO 100k" required onChange={e => setNewPortData({...newPortData, name: e.target.value})} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Capital Inicial (Balance)</label>
              <input type="number" placeholder="10000" required onChange={e => setNewPortData({...newPortData, initialBalance: parseFloat(e.target.value)})} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Objetivo Financiero (Meta)</label>
              <input type="number" placeholder="20000" required onChange={e => setNewPortData({...newPortData, targetBalance: parseFloat(e.target.value)})} style={{ width: '100%', marginBottom: '25px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />

              <div style={{ display:'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 15px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 MODAL DE ELIMINACIÓN DE PORTAFOLIO */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#0f172a', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ marginTop: 0, color: '#ef4444' }}>⚠️ Eliminar Bóveda</h3>
            <p style={{ color: '#475569', lineHeight: '1.5', marginBottom: '25px' }}>
              ¿Estás seguro de que deseas destruir el portafolio <strong>{currentPortfolio?.name}</strong> y todo su historial de operaciones? <strong>Esta acción es irreversible y eliminará los datos de la base de datos permanentemente.</strong>
            </p>
            <div style={{ display:'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 15px', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button type="button" onClick={handleDeletePortfolio} style={{ padding: '10px 15px', border: 'none', background: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sí, Eliminar Todo</button>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}