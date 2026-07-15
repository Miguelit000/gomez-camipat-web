import { useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import BlockEditor from './BlockEditor'; // <-- NUEVA IMPORTACIÓN

export default function TradeForm({ onCerrar, onGuardado }) {
  const { portfolioId } = useContext(AuthContext);

  const [strategies, setStrategies] = useState([]);
  const [useCalculator, setUseCalculator] = useState(false);
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(1.0);

  const [formData, setFormData] = useState({
    asset: '',
    direction: 'LONG',
    strategyId: '',
    entryPrice: '',
    positionSize: '',
    takeProfit: '',
    stopLoss: '',
    notes: ''
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

  useEffect(() => {
    if (useCalculator && formData.entryPrice && formData.stopLoss) {
      const entry = parseFloat(formData.entryPrice);
      const sl = parseFloat(formData.stopLoss);
      
      if (!isNaN(entry) && !isNaN(sl) && entry > 0 && sl > 0 && entry !== sl) {
        const riskAmountInDollars = accountBalance * (riskPercentage / 100);
        const riskPerUnit = Math.abs(entry - sl);
        const calculatedSize = riskAmountInDollars / riskPerUnit;
        setFormData(prev => ({ ...prev, positionSize: calculatedSize.toFixed(4) }));
      }
    }
  }, [useCalculator, formData.entryPrice, formData.stopLoss, riskPercentage, accountBalance]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (['entryPrice', 'positionSize', 'takeProfit', 'stopLoss'].includes(name)) {
      value = value.replace(',', '.');
      value = value.replace(/[^0-9.]/g, ''); 
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestData = {
        portfolioId: portfolioId, 
        strategyId: formData.strategyId ? formData.strategyId : null, 
        asset: formData.asset.toUpperCase(),
        direction: formData.direction,
        entryPrice: parseFloat(formData.entryPrice),
        positionSize: parseFloat(formData.positionSize),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        notes: formData.notes
      };

      await api.post('/trades', requestData);
      onGuardado(); 
      onCerrar();   
    } catch (err) {
      if (err.response && err.response.data) {
        const mensajesError = err.response.data.details || [err.response.data.message];
        setError(mensajesError.join(', '));
      } else {
        setError('Error al guardar la operación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '15px', overflowY: 'auto' }}>
      
      {/* Redujimos el padding a 20px para que ocupe menos espacio inútil en celular */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '800px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2em' }}>⚡ Registrar Operación</h3>
          <button onClick={onCerrar} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#64748b', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
        </div>

        {/* Cambiamos a auto-fit minmax(250px) para que colapse a 1 columna automáticamente */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Activo (Ticker)</label>
            <input type="text" name="asset" value={formData.asset} onChange={handleChange} required placeholder="Ej. XAUUSD" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Dirección</label>
            <select name="direction" value={formData.direction} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="LONG">LONG (Compra)</option>
              <option value="SHORT">SHORT (Venta)</option>
            </select>
          </div>

          {/* Cambiamos "span 2" por "1 / -1" para que ocupe todo el ancho de forma segura */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>🧠 Playbook / Estrategia</label>
            <select name="strategyId" value={formData.strategyId} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #bfdbfe', background: '#eff6ff', boxSizing: 'border-box', fontWeight: 'bold', color: '#1e293b' }}>
              <option value="">-- Operación Libre --</option>
              {strategies.map(strat => (
                <option key={strat.id} value={strat.id}>{strat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9em' }}>
              <input type="checkbox" checked={useCalculator} onChange={(e) => setUseCalculator(e.target.checked)} />
              🧮 Calculadora de Riesgo Automática
            </label>
            {useCalculator && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginTop: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: '#166534', marginBottom: '5px' }}>Capital ($)</label>
                  <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bbf7d0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: '#166534', marginBottom: '5px' }}>Riesgo (%)</label>
                  <input type="number" step="0.1" value={riskPercentage} onChange={(e) => setRiskPercentage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bbf7d0', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Precio de Entrada</label>
            <input type="text" inputMode="decimal" name="entryPrice" value={formData.entryPrice} onChange={handleChange} required placeholder="Ej. 2045,50" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              Tamaño (Lotes) {useCalculator && <span style={{ color: '#166534', fontSize: '0.8em' }}>(Auto)</span>}
            </label>
            <input type="text" inputMode="decimal" name="positionSize" value={formData.positionSize} onChange={handleChange} required readOnly={useCalculator} style={{ width: '100%', padding: '10px', borderRadius: '6px', boxSizing: 'border-box', border: useCalculator ? '2px solid #22c55e' : '1px solid #ccc', background: useCalculator ? '#f0fdf4' : 'white', fontWeight: useCalculator ? 'bold' : 'normal' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Stop Loss (Opcional)</label>
            <input type="text" inputMode="decimal" name="stopLoss" value={formData.stopLoss} onChange={handleChange} required={useCalculator} placeholder="Ej. 2040,00" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Take Profit (Opcional)</label>
            <input type="text" inputMode="decimal" name="takeProfit" value={formData.takeProfit} onChange={handleChange} placeholder="Ej. 2060,00" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '1em', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>📝 Bitácora del Trade</label>
            <BlockEditor 
              initialContent={formData.notes} 
              onChange={(content) => setFormData({ ...formData, notes: content })} 
            />
          </div>

          {/* Botones flex-wrap para que se estiren bien en celular */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
            <button type="button" onClick={onCerrar} style={{ flex: '1 1 auto', padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: '1 1 auto', padding: '12px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}>
              {loading ? 'Guardando...' : 'Confirmar Operación'}
            </button>
          </div>

          {error && <div style={{ gridColumn: '1 / -1', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9em' }}>❌ {error}</div>}
        </form>
      </div>
    </div>
  );
}