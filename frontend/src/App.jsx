import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScannerView from './components/ScannerView';
import ThreatLogsView from './components/ThreatLogsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import { getScanHistory, getAnalytics } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [threats, setThreats] = useState([]);
  const [threatsLoading, setThreatsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchScanData = useCallback(async () => {
    setAnalyticsLoading(true);
    setThreatsLoading(true);
    setAnalyticsError(null);

    try {
      const [historyData, analyticsRes] = await Promise.all([
        getScanHistory(50),
        getAnalytics()
      ]);

      if (Array.isArray(historyData)) {
        const mapped = historyData.map(item => {
          const rawConf = item.confidence ?? 0;
          const confidencePct = Math.round(rawConf <= 1 ? rawConf * 100 : rawConf);
          let displaySeverity = 'Low';
          const risk = (item.risk_level || '').toUpperCase();
          if (risk === 'HIGH') displaySeverity = 'High';
          else if (risk === 'CRITICAL') displaySeverity = 'Critical';
          else if (risk === 'MEDIUM') displaySeverity = 'Medium';

          let displayStatus = 'Active';
          if (item.status === 'clean' || item.status === 'resolved') displayStatus = 'Resolved';
          else if (item.status === 'quarantined') displayStatus = 'Quarantined';

          return {
            id: item.id,
            type: item.detected_indicators && item.detected_indicators.length > 0
              ? item.detected_indicators[0]
              : `${(item.target_type || 'Scan').toUpperCase()} Threat Inspection`,
            sourceIP: item.target || '127.0.0.1',
            severity: displaySeverity,
            confidence: confidencePct,
            timestamp: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now',
            status: displayStatus
          };
        });
        setThreats(mapped);
      }
      setAnalyticsData(analyticsRes);
    } catch (err) {
      console.warn("Failed to fetch scan data from backend API:", err.message);
      setAnalyticsError(err.message || 'Failed to connect to backend API');
    } finally {
      setAnalyticsLoading(false);
      setThreatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScanData();
  }, [fetchScanData]);

  const activeAlertCount = threats.filter(t => t.status === 'Active').length;

  const handleAddThreat = () => {
    fetchScanData();
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
            threatsLoading={threatsLoading}
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            onRefreshAnalytics={fetchScanData}
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

        {activeTab === 'analytics' && (
          <AnalyticsView 
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            onRefreshAnalytics={fetchScanData}
          />
        )}

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
            <span>Mode: FastAPI + SQLite Real Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
