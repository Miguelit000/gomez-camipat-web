import { useState } from 'react';
import api from '../api/axiosConfig';

export default function ImageUploadModal({ tradeId, existingImages = [], onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor selecciona una imagen primero.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');

    try {
      await api.post(`/trades/${tradeId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null); // Limpiamos el input
      onUploadSuccess(); // Esto recargará los trades y actualizará la galería mágicamente
    } catch (err) {
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4em' }}>🖼️ Galería Multimedia de la Operación</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#64748b', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
        </div>

        {/* SECCIÓN 1: La Cuadrícula de Imágenes Guardadas */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Capturas Guardadas ({existingImages.length})</h4>
          
          {existingImages.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9em', fontStyle: 'italic', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              No hay imágenes guardadas para esta operación.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {existingImages.map((imgName, index) => (
                <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <a href={`http://localhost:8080/api/v1/trades/images/${imgName}`} target="_blank" rel="noreferrer">
                    <img 
                      src={`http://localhost:8080/api/v1/trades/images/${imgName}`} 
                      alt={`Captura ${index + 1}`} 
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} 
                    />
                  </a>
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.8em', color: '#3b82f6', fontWeight: 'bold', background: 'white' }}>
                    Ampliar ↗
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 2: El Formulario de Subida */}
        <form onSubmit={handleUpload} style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px dashed #22c55e' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>➕ Añadir Nueva Captura</h4>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleFileChange}
              style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #bbf7d0', borderRadius: '6px' }}
            />
            <button type="submit" disabled={uploading || !file} style={{ padding: '10px 20px', background: file ? '#22c55e' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '6px', cursor: file ? 'pointer' : 'not-allowed', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {uploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85em', margin: '10px 0 0 0', fontWeight: 'bold' }}>❌ {error}</p>}
        </form>

      </div>
    </div>
  );
}