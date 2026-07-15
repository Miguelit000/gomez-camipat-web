import { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import TradeForm from '../components/TradeForm';
import CloseTradeModal from '../components/CloseTradeModal';
import EditTradeModal from '../components/EditTradeModal';
import DashboardMetrics from '../components/DashboardMetrics';
import PerformanceChart from '../components/PerformanceChart';
import CalendarWidget from '../components/CalendarWidget';

export default function DashboardPage() {
  const [trades, setTrades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tradeToClose, setTradeToClose] = useState(null);
  const [tradeToEdit, setTradeToEdit] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0); 
  const [strategyDictionary, setStrategyDictionary] = useState({});

  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL'); 
  const [filtroResultado, setFiltroResultado] = useState('ALL'); 

  // ESTADO PARA IMPORTACIÓN
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // ESTADOS PARA STRIPE
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMessage, setPaymentMessage] = useState(null);

  const navigate = useNavigate();
  
  // <-- EXTRAEMOS EL ROL REAL Y LA FUNCIÓN DE ACTUALIZACIÓN DEL CONTEXTO -->
  const { portfolioId, userRole, fetchUserRole, logout } = useContext(AuthContext);

  // <-- EFECTO PARA DETECTAR CUANDO REGRESAN DE PAGO EN STRIPE -->
  useEffect(() => {
    if (searchParams.get('session_id')) {
      setPaymentMessage({ type: 'success', text: '¡Suscripción PRO activada con éxito! Disfruta de tu Trading Journal sin límites.' });
      setSearchParams({}); 
      
      // ¡AQUÍ ESTÁ LA MAGIA! Le decimos a Java que revise si ya somos PRO
      fetchUserRole(); 
    }
    if (searchParams.get('payment') === 'cancelled') {
      setPaymentMessage({ type: 'error', text: 'El proceso de pago fue cancelado.' });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, fetchUserRole]);

  const fetchTrades = useCallback(async () => {
    setCargando(true);
    try {
      const [tradesResponse, strategiesResponse] = await Promise.all([
        api.get(`/trades/portfolio/${portfolioId}`),
        api.get(`/strategies/portfolio/${portfolioId}`)
      ]);

      const dictionary = {};
      strategiesResponse.data.forEach(strat => {
        dictionary[strat.id] = strat.name;
      });
      setStrategyDictionary(dictionary);

      const sortedTrades = tradesResponse.data.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
      setTrades(sortedTrades);
      setError('');
      setRefreshCount(prev => prev + 1); 
    } catch (err) {
      setError('Error al sincronizar con la base de datos.');
    } finally {
      setCargando(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    if (portfolioId) fetchTrades();
  }, [portfolioId, fetchTrades]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/trades/portfolio/${portfolioId}/export/csv`, {
        responseType: 'blob', 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Portfolio_Historial_${portfolioId.substring(0,6)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error al exportar los datos. Verifica tu conexión.');
      console.error(err);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/trades/portfolio/${portfolioId}/import/csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message); 
      fetchTrades(); 
    } catch (err) {
      alert(err.response?.data?.error || 'Error al importar el archivo CSV.');
      console.error(err);
    } finally {
      setIsImporting(false);
      event.target.value = null; 
    }
  };

  const handleUpgradePro = async () => {
    try {
      const response = await api.post('/checkout/create-session');
      window.location.href = response.data.url; 
    } catch (error) {
      console.error("Error al iniciar el pago", error);
      alert("Hubo un error al conectar con el servidor de pagos.");
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/checkout/portal');
      window.location.href = response.data.url; 
    } catch (error) {
      console.error("Error al abrir el portal", error);
      alert("Hubo un error al intentar abrir tu configuración de facturación.");
    }
  };

  const filteredTrades = trades.filter(trade => {
    const coincideActivo = trade.asset.toLowerCase().includes(filtroActivo.toLowerCase());
    const coincideEstado = filtroEstado === 'ALL' || trade.status === filtroEstado;
    let coincideResultado = true;
    if (filtroResultado === 'WIN') coincideResultado = trade.pnlNet > 0;
    if (filtroResultado === 'LOSS') coincideResultado = trade.pnlNet < 0;
    return coincideActivo && coincideEstado && coincideResultado;
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* <-- ALERTA DE PAGO STRIPE --> */}
      {paymentMessage && (
        <div style={{ 
          padding: '15px', marginBottom: '20px', borderRadius: '8px', fontWeight: 'bold',
          backgroundColor: paymentMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: paymentMessage.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${paymentMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {paymentMessage.type === 'success' ? '🎉 ' : '❌ '} {paymentMessage.text}
          <button onClick={() => setPaymentMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✖</button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>🏦 Centro de Mando</h1>
          <p style={{ margin: 0, color: 'gray' }}>Portafolio Principal</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* <-- LA MAGIA VISUAL EMPIEZA AQUÍ --> */}
          
          {/* SI EL USUARIO ES FREE, MOSTRAMOS EL BOTÓN DORADO */}
          {userRole !== 'ROLE_PRO' && (
            <button 
              onClick={handleUpgradePro}
              style={{ 
                padding: '10px 20px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
                color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', 
                cursor: 'pointer', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'
              }}>
              ⭐ Mejorar a PRO
            </button>
          )}

          {/* SI EL USUARIO ES PRO, MOSTRAMOS LA INSIGNIA VERDE Y EL PORTAL */}
          {userRole === 'ROLE_PRO' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '8px 12px', background: '#dcfce7', color: '#166534', 
                borderRadius: '20px', fontWeight: 'bold', fontSize: '13px',
                border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                ✅ PRO
              </span>
              
              <button 
                onClick={handleManageSubscription}
                style={{ 
                  padding: '10px 20px', background: '#e2e8f0', 
                  color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', 
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                ⚙️ Gestionar Suscripción
              </button>
            </div>
          )}
          {/* <-- FIN DE LA MAGIA VISUAL --> */}

          {/* BOTÓN NUEVA OPERACIÓN CON LÍMITE */}
          {!mostrarFormulario && (
            userRole !== 'ROLE_PRO' && trades.length >= 50 ? (
              <button onClick={handleUpgradePro} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>
                🔒 Límite Alcanzado (50/50)
              </button>
            ) : (
              <button onClick={() => setMostrarFormulario(true)} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                + Nueva Operación
              </button>
            )
          )}
        </div>
      </div>

      <DashboardMetrics refreshTrigger={refreshCount} />
      <CalendarWidget refreshTrigger={refreshCount} />

      <div style={{ marginBottom: '30px' }}>
        <PerformanceChart trades={trades} />
      </div>

      {mostrarFormulario && <TradeForm onCerrar={() => setMostrarFormulario(false)} onGuardado={fetchTrades} />}
      {tradeToClose && <CloseTradeModal trade={tradeToClose} onClose={() => setTradeToClose(null)} onGuardado={fetchTrades} />}
      {tradeToEdit && <EditTradeModal trade={tradeToEdit} onClose={() => setTradeToEdit(null)} onGuardado={fetchTrades} />}

      <div style={{ padding: '25px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* CABECERA RESPONSIVA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Registro de Operaciones</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9em', color: '#64748b', fontWeight: 'bold' }}>
              {filteredTrades.length} de {trades.length}
            </span>
            
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
            />

            {/* BOTÓN IMPORTAR MT5 CON BLOQUEO */}
            {userRole === 'ROLE_PRO' ? (
              <button 
                onClick={() => fileInputRef.current.click()} 
                disabled={isImporting}
                style={{ padding: '8px 15px', background: isImporting ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: isImporting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isImporting ? '⏳ Importando...' : '⬆️ Importar MT5'}
              </button>
            ) : (
              <button 
                onClick={handleUpgradePro} 
                style={{ padding: '8px 15px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)' }}>
                🔒 Importar MT5
              </button>
            )}
          </div>
        </div>

        {/* FILTROS RESPONSIVOS (con base base min-width) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>🔍 Activo</label>
            <input type="text" placeholder="Ej. BTC, AAPL..." value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>📌 Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="ALL">Todas</option>
              <option value="OPEN">🟢 Abiertas</option>
              <option value="CLOSED">🔒 Cerradas</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>💰 Resultado</label>
            <select value={filtroResultado} onChange={(e) => setFiltroResultado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="ALL">Todos</option>
              <option value="WIN">📈 Ganadoras</option>
              <option value="LOSS">📉 Perdedoras</option>
            </select>
          </div>
          
          {(filtroActivo !== '' || filtroEstado !== 'ALL' || filtroResultado !== 'ALL') && (
            <div style={{ display: 'flex', alignItems: 'flex-end', flex: '1 1 100px' }}>
              <button onClick={() => { setFiltroActivo(''); setFiltroEstado('ALL'); setFiltroResultado('ALL'); }} style={{ width: '100%', padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>
                ✖ Limpiar
              </button>
            </div>
          )}
        </div>

        {cargando && <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Sincronizando Bóveda...</p>}
        {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}

        {!cargando && !error && filteredTrades.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ color: '#64748b', fontSize: '1.1em' }}>No se encontraron operaciones en este portafolio.</p>
          </div>
        )}

        {!cargando && !error && filteredTrades.length > 0 && (
          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
            {/* Agregamos minWidth a la tabla para forzar el scroll en móviles */}
            <table style={{ width: '100%', minWidth: '850px', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.9em' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Activo</th>
                  <th style={{ padding: '12px' }}>Estrategia</th>
                  <th style={{ padding: '12px' }}>Dirección</th>
                  <th style={{ padding: '12px' }}>Entrada</th>
                  <th style={{ padding: '12px' }}>Lotes</th>
                  <th style={{ padding: '12px' }}>Estado</th>
                  <th style={{ padding: '12px' }}>PnL Neto</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th> 
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '0.9em', color: '#64748b' }}>{new Date(trade.entryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{trade.asset}</td>
                    <td style={{ padding: '12px', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9em' }}>
                      {trade.strategyId && strategyDictionary[trade.strategyId] ? strategyDictionary[trade.strategyId] : '-'}
                    </td>
                    <td style={{ padding: '12px', color: trade.direction === 'LONG' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{trade.direction}</td>
                    <td style={{ padding: '12px' }}>${trade.entryPrice}</td>
                    <td style={{ padding: '12px' }}>{trade.positionSize}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold', background: trade.status === 'OPEN' ? '#dcfce7' : '#f1f5f9', color: trade.status === 'OPEN' ? '#166534' : '#475569' }}>
                        {trade.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: trade.pnlNet > 0 ? '#10b981' : (trade.pnlNet < 0 ? '#ef4444' : 'inherit') }}>
                      ${trade.pnlNet !== null ? trade.pnlNet : '0.00'}
                    </td>
                    
                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => setTradeToEdit(trade)} style={{ padding: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }} title="Editar Operación">
                        ✏️
                      </button>
                      {trade.status === 'OPEN' ? (
                        <button onClick={() => setTradeToClose(trade)} style={{ padding: '6px 12px', background: '#f87171', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>Cerrar</button>
                      ) : (
                        <span title="Operación Finalizada" style={{ color: '#cbd5e1', fontSize: '1.2em' }}>🔒</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}