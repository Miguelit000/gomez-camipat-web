import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StrategiesPage from './pages/StrategiesPage';
import StatisticsPage from './pages/StatisticsPage'; 
import Navbar from './components/Navbar'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/strategies" 
          element={
            <ProtectedRoute>
              <StrategiesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/statistics" 
          element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;