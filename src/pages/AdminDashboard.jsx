import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('logs'); // 'logs' o 'blocked'
  const [metrics, setMetrics] = useState({ totalUsers: 0, proUsers: 0, freeUsers: 0 });
  const [logs, setLogs] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escudo visual: Expulsar a cualquiera que no sea ADMIN
  useEffect(() => {
    if (userRole && userRole !== 'ROLE_ADMIN') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, logsRes, blockedRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/security/logs'),
        api.get('/admin/security/blocked-ips')
      ]);
      setMetrics(metricsRes.data);
      setLogs(logsRes.data);
      setBlockedIps(blockedRes.data);
    } catch (error) {
      console.error("Error al cargar datos del SOC:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'ROLE_ADMIN') {
      fetchData();
    }
  }, [userRole]);

  const handleBlockIp = async (ipAddress) => {
    if (!window.confirm(`¿Estás seguro de que deseas BLOQUEAR la IP ${ipAddress}? Perderán el acceso inmediatamente.`)) return;
    try {
      await api.post('/admin/security/block-ip', { ipAddress, reason: 'Bloqueo manual por administrador' });
      fetchData(); 
    } catch (error) {
      alert('Error al bloquear la IP');
    }
  };

  const handleUnblockIp = async (ipAddress) => {
    if (!window.confirm(`¿Deseas DESBLOQUEAR la IP ${ipAddress}?`)) return;
    try {
      await api.delete(`/admin/security/unblock-ip/${ipAddress}`);
      fetchData(); 
    } catch (error) {
      alert('Error al desbloquear la IP');
    }
  };

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'CRITICAL': return { background: '#ef4444', color: 'white' }; 
      case 'WARNING': return { background: '#f59e0b', color: 'white' }; 
      default: return { background: '#3b82f6', color: 'white' }; 
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh' }}>Iniciando conexión segura con el SOC...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px 20px', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Cabecera */}
        <div style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛡️ AstroTrade SOC <span style={{ fontSize: '0.4em', background: '#22c55e', padding: '4px 8px', borderRadius: '4px' }}>ONLINE</span>
            </h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Centro de Operaciones de Seguridad y Métricas</p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Volver al Dashboard
          </button>
        </div>

        {/* Tarjetas de KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.9em' }}>USUARIOS TOTALES</h3>
            <p style={{ margin: 0, fontSize: '2.5em', fontWeight: 'bold' }}>{metrics.totalUsers}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.9em' }}>SUSCRIPCIONES PRO</h3>
            <p style={{ margin: 0, fontSize: '2.5em', fontWeight: 'bold' }}>{metrics.proUsers}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.9em' }}>CUENTAS FREE</h3>
            <p style={{ margin: 0, fontSize: '2.5em', fontWeight: 'bold' }}>{metrics.freeUsers}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.9em' }}>AMENAZAS MITIGADAS</h3>
            <p style={{ margin: 0, fontSize: '2.5em', fontWeight: 'bold' }}>{blockedIps.length}</p>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{ padding: '10px 20px', background: activeTab === 'logs' ? '#3b82f6' : '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            📡 Monitor de Eventos
          </button>
          <button 
            onClick={() => setActiveTab('blocked')}
            style={{ padding: '10px 20px', background: activeTab === 'blocked' ? '#ef4444' : '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            🚫 Lista Negra ({blockedIps.length})
          </button>
        </div>

        {/* Tabla de Datos */}
        <div style={{ background: '#1e293b', borderRadius: '8px', overflowX: 'auto', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '15px', color: '#94a3b8' }}>{activeTab === 'logs' ? 'Fecha' : 'Fecha de Bloqueo'}</th>
                <th style={{ padding: '15px', color: '#94a3b8' }}>Dirección IP</th>
                <th style={{ padding: '15px', color: '#94a3b8' }}>{activeTab === 'logs' ? 'Evento' : 'Motivo'}</th>
                {activeTab === 'logs' && <th style={{ padding: '15px', color: '#94a3b8' }}>Usuario Afectado</th>}
                <th style={{ padding: '15px', color: '#94a3b8', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'logs' ? (
                logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '15px', fontSize: '0.9em' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{log.ipAddress}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ ...getSeverityStyle(log.severity), padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#94a3b8', fontSize: '0.9em' }}>{log.userEmail || '-'}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button onClick={() => handleBlockIp(log.ipAddress)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>
                        Bloquear IP
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                blockedIps.map(ip => (
                  <tr key={ip.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '15px', fontSize: '0.9em' }}>{new Date(ip.blockedAt).toLocaleString()}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#ef4444' }}>{ip.ipAddress}</td>
                    <td style={{ padding: '15px', color: '#cbd5e1' }}>{ip.reason}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button onClick={() => handleUnblockIp(ip.ipAddress)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>
                        Desbloquear
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {(activeTab === 'logs' ? logs : blockedIps).length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No hay registros para mostrar en esta sección.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}