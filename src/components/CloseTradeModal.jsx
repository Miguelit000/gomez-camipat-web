import { useState } from 'react';
import api from '../api/axiosConfig';

export default function CloseTradeModal({ trade, onClose, onGuardado }) {
  const [formData, setFormData] = useState({
    exitPrice: '',
    pnlNet: '' // <-- NUEVO: Campo para la ganancia/pérdida
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // <-- El famoso interceptor de comas adaptado -->
  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (['exitPrice', 'pnlNet'].includes(name)) {
      value = value.replace(',', '.');
      // Permitimos números, puntos y el signo menos (para registrar pérdidas)
      value = value.replace(/[^0-9.-]/g, ''); 
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.patch(`/trades/${trade.id}/close`, {
        exitPrice: parseFloat(formData.exitPrice),
        exitDate: new Date().toISOString(),
        pnlNet: parseFloat(formData.pnlNet) // Enviamos el dinero real
      });
      onGuardado();
      onClose();
    } catch (err) {
      setError('Error al cerrar la operación. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      padding: '20px'
    }}>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4em' }}>🔒 Cerrar Operación</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#64748b', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9em' }}>Activo: <strong style={{ color: '#0f172a' }}>{trade.asset}</strong></p>
          <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9em' }}>Dirección: <strong style={{ color: trade.direction === 'LONG' ? '#10b981' : '#ef4444' }}>{trade.direction}</strong></p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em' }}>Precio Entrada: <strong style={{ color: '#0f172a' }}>{trade.entryPrice}</strong></p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Precio de Salida Exacto</label>
            <input 
              type="text" 
              inputMode="decimal"
              name="exitPrice" 
              value={formData.exitPrice} 
              onChange={handleChange} 
              required 
              placeholder="Ej. 64500,50"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1.05em' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Ganancia / Pérdida Neta (USD)</label>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8em', color: '#94a3b8' }}>Ingresa el resultado final incluyendo swaps y comisiones. Usa el signo menos (-) para pérdidas.</p>
            <input 
              type="text" 
              inputMode="decimal"
              name="pnlNet" 
              value={formData.pnlNet} 
              onChange={handleChange} 
              required 
              placeholder="Ej. 150,00 o -45,50"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1.05em', fontWeight: 'bold', color: formData.pnlNet.startsWith('-') ? '#ef4444' : '#10b981' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 20px', background: '#f87171', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Procesando...' : 'Finalizar Trade'}
            </button>
          </div>

          {error && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9em', marginTop: '10px' }}>❌ {error}</div>}
        </form>
      </div>
    </div>
  );
}