import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicPortal } from './components/PublicPortal';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route Utama: Internal Pemerintah Desa (Single-Scroll Golden Path) */}
        <Route path="/" element={<AdminDashboard />} />

        {/* Route Mandiri: Portal Transparansi Publik Warga */}
        <Route path="/public/:village_id" element={<PublicPortal />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
