import React, { useState } from 'react';
import { AlertOctagon, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

export default function ThreatLogsView({ threats, onQuarantineThreat }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState(null);

  const filteredThreats = threats.filter((threat) => {
    const matchesSearch = 
      threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.sourceIP.includes(searchTerm);
    const matchesSeverity = severityFilter === 'All' || threat.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={24} color="#f43f5e" /> Security Threat Event Logs
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time audit log of all security events detected by CyberGuard AI.
          </p>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Export Logs (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Severity:</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className="btn"
              style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                background: severityFilter === sev ? 'var(--primary)' : 'var(--bg-dark)',
                color: severityFilter === sev ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-color)'
              }}
            >
              {sev}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by IP or Threat Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table & Detail Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedThreat ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Event ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source IP</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Severity</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Confidence</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreats.length > 0 ? (
                filteredThreats.map((t) => (
                  <tr 
                    key={t.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                      background: selectedThreat?.id === t.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      #{t.id.toString().slice(-4)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {t.type}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>
                      {t.sourceIP}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${t.severity.toLowerCase()}`}>
                        {t.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#38bdf8' }}>
                      {t.confidence}%
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: t.status === 'Active' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                        fontWeight: 500
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setSelectedThreat(t)}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} /> Details
                      </button>
                      {t.status === 'Active' && (
                        <button 
                          onClick={() => onQuarantineThreat(t.id)}
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Block IP
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No threat log events matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Threat Details Drawer */}
        {selectedThreat && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Event Inspector</h3>
              <button onClick={() => setSelectedThreat(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Event ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{selectedThreat.id}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Threat Classification</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedThreat.type}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Source IP Address</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>{selectedThreat.sourceIP}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Timestamp</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedThreat.timestamp}</div>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>AI Model Diagnosis:</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Anomaly score exceeds risk threshold. Automated security rules have flagged this session.
              </div>
            </div>

            {selectedThreat.status === 'Active' && (
              <button 
                onClick={() => {
                  onQuarantineThreat(selectedThreat.id);
                  setSelectedThreat(prev => prev ? { ...prev, status: 'Quarantined' } : null);
                }}
                className="btn btn-primary" 
                style={{ width: '100%' }}
              >
                Quarantine & Block Origin IP
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
