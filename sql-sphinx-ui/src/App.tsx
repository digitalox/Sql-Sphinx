import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Sidebar from './components/Sidebar';
import ComparePage from './pages/ComparePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<ComparePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}
