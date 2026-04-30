import { useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import BlockEditor from './BlockEditor';

export default function EditTradeModal({ trade, onClose, onGuardado }) {
  const { portfolioId } = useContext(AuthContext);
  const [strategies, setStrategies] = useState([]);
  
  const [formData, setFormData] = useState({
    asset: trade.asset || '',
    direction: trade.direction || 'LONG',
    strategyId: trade.strategyId || '',
    entryPrice: trade.entryPrice || '',
    positionSize: trade.positionSize || '',
    takeProfit: trade.takeProfit || '',
    stopLoss: trade.stopLoss || '',
    exitPrice: trade.exitPrice || '',
    pnlNet: trade.pnlNet !== null ? trade.pnlNet : '',
    maePrice: trade.maePrice || '', // <-- NUEVO ESTADO
    mfePrice: trade.mfePrice || '', // <-- NUEVO ESTADO
    notes: trade.notes || ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await api.get(`/strategies/portfolio/${portfolioId}`);
        setStrategies(response.data);
      } catch (err) {
        console.error("Error al cargar estrategias", err);
      }
    };
    if (portfolioId) fetchStrategies();
  }, [portfolioId]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Agregamos maePrice y mfePrice a los campos que aceptan decimales
    if (['entryPrice', 'positionSize', 'takeProfit', 'stopLoss', 'exitPrice', 'pnlNet', 'maePrice', 'mfePrice'].includes(name)) {
      value = value.replace(',', '.');
      value = value.replace(/[^0-9.-]/g, ''); 
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestData = {
        strategyId: formData.strategyId ? formData.strategyId : null, 
        asset: formData.asset.toUpperCase(),
        direction: formData.direction,
        entryPrice: parseFloat(formData.entryPrice),
        positionSize: parseFloat(formData.positionSize),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
        pnlNet: formData.pnlNet !== '' ? parseFloat(formData.pnlNet) : null,
        maePrice: formData.maePrice ? parseFloat(formData.maePrice) : null, // <-- ENVIAMOS A JAVA
        mfePrice: formData.mfePrice ? parseFloat(formData.mfePrice) : null, // <-- ENVIAMOS A JAVA
        notes: formData.notes
      };

      await api.put(`/trades/${trade.id}`, requestData);
      onGuardado(); 
      onClose();   
    } catch (err) {
      setError('Error al actualizar la operación. Revisa los datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '800px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4em' }}>✏️ Editar Operación</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#64748b', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Activo (Ticker)</label>
            <input type="text" name="asset" value={formData.asset} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Dirección</label>
            <select name="direction" value={formData.direction} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="LONG">LONG (Compra)</option>
              <option value="SHORT">SHORT (Venta)</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>🧠 Playbook / Estrategia</label>
            <select name="strategyId" value={formData.strategyId} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #bfdbfe', background: '#eff6ff', boxSizing: 'border-box', fontWeight: 'bold', color: '#1e293b' }}>
              <option value="">-- Operación Libre --</option>
              {strategies.map(strat => (
                <option key={strat.id} value={strat.id}>{strat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Precio de Entrada</label>
            <input type="text" inputMode="decimal" name="entryPrice" value={formData.entryPrice} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Tamaño (Lotes)</label>
            <input type="text" inputMode="decimal" name="positionSize" value={formData.positionSize} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Stop Loss (Opcional)</label>
            <input type="text" inputMode="decimal" name="stopLoss" value={formData.stopLoss} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Take Profit (Opcional)</label>
            <input type="text" inputMode="decimal" name="takeProfit" value={formData.takeProfit} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          {/* <-- BLOQUE DE EXCURSIONES (MAE / MFE) --> */}
          <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '15px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#9f1239', marginBottom: '5px' }}>🔻 Precio MAE (Pico Negativo)</label>
              <input type="text" inputMode="decimal" name="maePrice" placeholder="Ej. 4705.000" value={formData.maePrice} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fecaca', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#166534', marginBottom: '5px' }}>🔺 Precio MFE (Pico Positivo)</label>
              <input type="text" inputMode="decimal" name="mfePrice" placeholder="Ej. 4690.000" value={formData.mfePrice} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bbf7d0', boxSizing: 'border-box' }} />
            </div>
          </div>

          {trade.status === 'CLOSED' && (
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>🔒 Precio Salida Exacto</label>
                <input type="text" inputMode="decimal" name="exitPrice" value={formData.exitPrice} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>💰 Ganancia / Pérdida (USD)</label>
                <input type="text" inputMode="decimal" name="pnlNet" value={formData.pnlNet} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontWeight: 'bold', color: formData.pnlNet && formData.pnlNet.toString().startsWith('-') ? '#ef4444' : '#10b981' }} />
              </div>
            </div>
          )}

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '1em', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>📝 Bitácora del Trade</label>
            <BlockEditor 
              initialContent={formData.notes} 
              onChange={(content) => setFormData({ ...formData, notes: content })} 
            />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Guardando...' : 'Actualizar Operación'}
            </button>
          </div>

          {error && <div style={{ gridColumn: 'span 2', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9em' }}>❌ {error}</div>}
        </form>
      </div>
    </div>
  );
}