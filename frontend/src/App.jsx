import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScannerView from './components/ScannerView';
import ThreatLogsView from './components/ThreatLogsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';

const INITIAL_THREATS = [
  {
    id: 1001,
    type: 'SQL Injection Injection Attempt',
    sourceIP: '185.220.101.4',
    severity: 'Critical',
    confidence: 96,
    timestamp: '23:04:12',
    status: 'Active'
  },
  {
    id: 1002,
    type: 'Brute Force Authentication Burst',
    sourceIP: '45.142.120.10',
    severity: 'High',
    confidence: 88,
    timestamp: '22:58:05',
    status: 'Active'
  },
  {
    id: 1003,
    type: 'Cross-Site Scripting (XSS) Vector',
    sourceIP: '194.26.29.112',
    severity: 'Medium',
    confidence: 79,
    timestamp: '22:41:19',
    status: 'Resolved'
  },
  {
    id: 1004,
    type: 'Unusual API Rate Spike',
    sourceIP: '103.15.244.8',
    severity: 'Low',
    confidence: 62,
    timestamp: '21:15:40',
    status: 'Resolved'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [threats, setThreats] = useState(INITIAL_THREATS);

  const activeAlertCount = threats.filter(t => t.status === 'Active').length;

  const handleAddThreat = (newThreat) => {
    setThreats(prev => [newThreat, ...prev]);
  };

  const handleQuarantineThreat = (threatId) => {
    setThreats(prev => prev.map(t => 
      t.id === threatId ? { ...t, status: 'Quarantined' } : t
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={activeAlertCount} 
      />

      <main style={{
        flex: 1,
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {activeTab === 'dashboard' && (
          <DashboardView 
            threats={threats} 
            onNavigateToScanner={() => setActiveTab('scanner')} 
            onQuarantineThreat={handleQuarantineThreat}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView onAddThreat={handleAddThreat} />
        )}

        {activeTab === 'logs' && (
          <ThreatLogsView 
            threats={threats} 
            onQuarantineThreat={handleQuarantineThreat} 
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-dark)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            CyberGuard AI Platform &copy; {new Date().getFullYear()} — Intelligent Security Operations Center
          </div>
          <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
            <span>Status: <span style={{ color: '#34d399' }}>Protected</span></span>
            <span>Mode: Standalone Frontend Shell</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
