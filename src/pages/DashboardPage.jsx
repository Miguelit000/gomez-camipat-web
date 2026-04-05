import { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import TradeForm from '../components/TradeForm';
import CloseTradeModal from '../components/CloseTradeModal';
import EditTradeModal from '../components/EditTradeModal';
import DashboardMetrics from '../components/DashboardMetrics';
import ImageUploadModal from '../components/ImageUploadModal';
import PerformanceChart from '../components/PerformanceChart';

export default function DashboardPage() {
  const [trades, setTrades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tradeToClose, setTradeToClose] = useState(null);
  const [tradeToEdit, setTradeToEdit] = useState(null);
  const [tradeForImage, setTradeForImage] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0); 
  const [strategyDictionary, setStrategyDictionary] = useState({});

  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ALL'); 
  const [filtroResultado, setFiltroResultado] = useState('ALL'); 

  const navigate = useNavigate();
  
  // <-- CAMBIO: Extraemos portfolioId del Contexto
  const { portfolioId, logout } = useContext(AuthContext);

  const fetchTrades = useCallback(async () => {
    setCargando(true);
    try {
      // <-- CAMBIO: Nuevas rutas REST apuntando a portfolio
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
      // <-- CAMBIO: Nueva ruta de exportación CSV
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>🏦 Centro de Mando</h1>
          {/* Escondemos el ID feo por un alias limpio */}
          <p style={{ margin: 0, color: 'gray' }}>Portafolio Principal</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {!mostrarFormulario && (
            <button onClick={() => setMostrarFormulario(true)} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Nueva Operación
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salir de Bóveda
          </button>
        </div>
      </div>

      <DashboardMetrics refreshTrigger={refreshCount} />
      <PerformanceChart trades={trades} />

      {mostrarFormulario && <TradeForm onCerrar={() => setMostrarFormulario(false)} onGuardado={fetchTrades} />}
      {tradeToClose && <CloseTradeModal trade={tradeToClose} onClose={() => setTradeToClose(null)} onGuardado={fetchTrades} />}
      {tradeToEdit && <EditTradeModal trade={tradeToEdit} onClose={() => setTradeToEdit(null)} onGuardado={fetchTrades} />}
      {tradeForImage && (
        <ImageUploadModal
        tradeId={tradeForImage}
        existingImages={trades.find(t => t.id === tradeForImage)?.images || []}
        onClose={() => setTradeForImage(null)}
        onUploadSuccess={fetchtrades}
        />
      )}

      <div style={{ padding: '25px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Registro de Operaciones (Trades)</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9em', color: '#64748b', fontWeight: 'bold' }}>
              Mostrando {filteredTrades.length} de {trades.length} operaciones
            </span>
            <button onClick={handleExportCSV} style={{ padding: '8px 15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              📥 Exportar CSV
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>🔍 Buscar por Activo</label>
            <input type="text" placeholder="Ej. BTC, AAPL..." value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>📌 Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="ALL">Todas las operaciones</option>
              <option value="OPEN">🟢 Solo Abiertas</option>
              <option value="CLOSED">🔒 Solo Cerradas</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8em', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>💰 Resultado Neto</label>
            <select value={filtroResultado} onChange={(e) => setFiltroResultado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="ALL">Todos los resultados</option>
              <option value="WIN">📈 Solo Ganadoras</option>
              <option value="LOSS">📉 Solo Perdedoras</option>
            </select>
          </div>
          
          {(filtroActivo !== '' || filtroEstado !== 'ALL' || filtroResultado !== 'ALL') && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setFiltroActivo(''); setFiltroEstado('ALL'); setFiltroResultado('ALL'); }} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
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
                  <th style={{ padding: '12px', textAlign: 'center' }}>Galería</th>
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
                    
                    {/* <-- NUEVO: Sistema de Galería Multimedia --> */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {trade.images && trade.images.length > 0 && (
                          <span style={{ fontSize: '0.9em', color: '#64748b', fontWeight: 'bold', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {trade.images.length} 🖼️
                          </span>
                        )}
                        <button onClick={() => setTradeForImage(trade.id)} style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.85em' }} title="Añadir a Galería">
                          + 📷
                        </button>
                      </div>
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