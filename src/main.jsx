import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // <-- Importamos el Proveedor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos la App para que el estado global funcione en todas partes */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)