import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { portfolioId, setPortfolioId, token, logout } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPortData, setNewPortData] = useState({ name: '', balance: 10000 });
  const navigate = useNavigate();
  const location = useLocation(); // <-- NUEVO: Detector de ubicación

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await api.get('/portfolios/me');
        setPortfolios(res.data);
      } catch (error) {
        console.error('Error cargando portafolios', error);
      }
    };
    // Solo busca si hay token Y no estamos en el login
    if (token && location.pathname !== '/') fetchPortfolios();
  }, [token, location.pathname]);

  const handleSwitchPortfolio = (e) => {
    const newId = e.target.value;
    setPortfolioId(newId);
    localStorage.setItem('portfolioId', newId);
    navigate('/dashboard');
    window.location.reload(); 
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/portfolios', { 
        name: newPortData.name, 
        initialBalance: parseFloat(newPortData.balance), 
        currency: 'USD' 
      });
      
      // Validamos que Java sí haya respondido con éxito
      if (res.data && res.data.id) {
        setPortfolioId(res.data.id);
        localStorage.setItem('portfolioId', res.data.id);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear el portafolio. Revisa la consola (F12).");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 🛡️ DOBLE PROTECCIÓN: Si no hay token o la ruta es "/", desaparece mágicamente
  if (!token || location.pathname === '/') return null;

  return (
    <nav style={{ background: '#0f172a', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', borderBottom: '4px solid #3b82f6' }}>
       
       <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
         <h2 style={{ margin: 0, color: 'white', letterSpacing: '-1px' }}>Gomez Capital<span style={{ color: '#3b82f6' }}>.</span></h2>
         <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
            <Link to="/estrategias" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold' }}>Mis Estrategias</Link>
         </div>
       </div>

       <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select value={portfolioId || ''} onChange={handleSwitchPortfolio} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#1e293b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
             {portfolios.map(p => (
                <option key={p.id} value={p.id}>💼 {p.name} (${p.initialBalance})</option>
             ))}
          </select>
          
          <button onClick={() => setShowModal(true)} style={{ background: '#10b981', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Nueva Cuenta
          </button>

          <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>
            Salir
          </button>
       </div>

       {showModal && (
         <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={handleCreatePortfolio} style={{ background: 'white', color: '#0f172a', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '350px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
               <h3 style={{ margin: '0 0 20px 0' }}>🏦 Abrir Nuevo Portafolio</h3>
               
               <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Nombre de la Cuenta</label>
               <input type="text" placeholder="Ej. Reto FTMO 100k" required onChange={e => setNewPortData({...newPortData, name: e.target.value})} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
               
               <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Capital Inicial (Balance)</label>
               <input type="number" placeholder="10000" required onChange={e => setNewPortData({...newPortData, balance: e.target.value})} style={{ width: '100%', marginBottom: '25px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
               
               <div style={{ display:'flex', gap: '10px', justifyContent: 'flex-end' }}>
                 <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                 <button type="submit" style={{ padding: '10px 15px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Bóveda</button>
               </div>
            </form>
         </div>
       )}
    </nav>
  );
}