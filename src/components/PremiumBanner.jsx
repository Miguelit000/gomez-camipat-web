import { useState } from 'react';
import api from '../api/axiosConfig';

export default function PremiumBanner({ title, description }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await api.post('/checkout/create-session');
      window.location.href = response.data.url;
    } catch (error) {
      alert("Error al conectar con la pasarela de pago segura.");
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '60px 30px', textAlign: 'center', maxWidth: '550px', 
      margin: '60px auto', background: 'white', borderRadius: '12px', 
      border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' 
    }}>
      <div style={{ fontSize: '3.5em', marginBottom: '20px' }}>🔒</div>
      <h2 style={{ color: '#0f172a', margin: '0 0 15px 0', fontSize: '1.8em' }}>{title}</h2>
      <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1.05em', marginBottom: '35px' }}>
        {description}
      </p>
      
      <button 
        onClick={handleUpgrade}
        disabled={loading}
        style={{ 
          padding: '14px 35px', background: '#0f172a', color: 'white', 
          border: 'none', borderRadius: '6px', fontWeight: 'bold', 
          fontSize: '1em', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'transform 0.2s', width: '100%'
        }}>
        {loading ? 'Generando pasarela segura...' : 'Mejorar a PRO'}
      </button>
    </div>
  );
}