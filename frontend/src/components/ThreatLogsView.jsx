import React, { useState, useEffect } from 'react';
import { AlertOctagon, Search, ShieldCheck, CheckCircle2, AlertTriangle, Eye, RefreshCw, Database, Download } from 'lucide-react';
import { getScanHistory } from '../api';

export default function ThreatLogsView({ threats: propThreats, onQuarantineThreat }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState(null);

  const normalizeLog = (item) => {
    const rawConf = item.confidence ?? 0;
    const confidencePct = Math.round(rawConf <= 1 ? rawConf * 100 : rawConf);
    
    let formattedTime = item.timestamp;
    try {
      if (item.timestamp) {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      }
    } catch (_) {}

    let displaySeverity = 'Low';
    const risk = (item.risk_level || item.severity || '').toUpperCase();
    if (risk === 'CRITICAL' || risk === 'CRITICAL THREAT') displaySeverity = 'Critical';
    else if (risk === 'HIGH') displaySeverity = 'High';
    else if (risk === 'MEDIUM') displaySeverity = 'Medium';
    else if (risk === 'LOW') displaySeverity = 'Low';
    else if (item.severity) displaySeverity = item.severity;

    let displayStatus = item.status || 'Active';
    if (item.status === 'suspicious') displayStatus = 'Active';
    else if (item.status === 'clean') displayStatus = 'Resolved';
    else if (item.status === 'quarantined') displayStatus = 'Quarantined';

    let displayType = item.type;
    if (!displayType) {
      if (item.detected_indicators && item.detected_indicators.length > 0) {
        displayType = item.detected_indicators[0];
      } else {
        const typeStr = (item.target_type || 'SCAN').toUpperCase();
        displayType = `${typeStr} Inspection`;
      }
    }

    return {
      id: item.id || Date.now(),
      target: item.target || item.sourceIP || 'N/A',
      sourceIP: item.target || item.sourceIP || 'N/A',
      targetType: item.target_type || 'payload',
      type: displayType,
      severity: displaySeverity,
      confidence: confidencePct,
      status: displayStatus,
      message: item.message || 'Inspection logged',
      detectedIndicators: item.detected_indicators || [],
      timestamp: formattedTime || 'Just now'
    };
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getScanHistory(100);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeLog);
        setLogs(normalized);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
      setError(err.message || 'Failed to connect to SQLite scan history API endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLocalQuarantine = (threatId) => {
    setLogs(prev => prev.map(t => 
      t.id === threatId ? { ...t, status: 'Quarantined' } : t
    ));
    if (selectedThreat && selectedThreat.id === threatId) {
      setSelectedThreat(prev => prev ? { ...prev, status: 'Quarantined' } : null);
    }
    if (onQuarantineThreat) {
      onQuarantineThreat(threatId);
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Event ID', 'Type', 'Target/Source IP', 'Severity', 'Confidence (%)', 'Status', 'Timestamp'];
    const rows = logs.map(l => [
      l.id,
      `"${(l.type || '').replace(/"/g, '""')}"`,
      `"${(l.sourceIP || '').replace(/"/g, '""')}"`,
      l.severity,
      l.confidence,
      l.status,
      `"${l.timestamp}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cyberguard_scan_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredThreats = logs.filter((threat) => {
    const matchesSearch = 
      threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.sourceIP.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || threat.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={24} color="#f43f5e" /> SQLite Security Threat Event Logs
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time scan history retrieved directly from CyberGuard SQLite database via <code style={{ background: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '4px', color: '#60a5fa' }}>GET /api/history</code>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchLogs} disabled={isLoading} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
          <button onClick={exportCSV} disabled={logs.length === 0} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
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
            placeholder="Search by IP, target or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area: Loading / Error / Table & Detail Pane */}
      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <RefreshCw size={36} color="#3b82f6" className="animate-spin" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Fetching SQLite Scan History...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Querying GET http://127.0.0.1:8000/api/history</p>
        </div>
      ) : error ? (
        <div className="card" style={{
          padding: '1.5rem',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <AlertTriangle size={36} color="#f43f5e" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e', marginBottom: '4px' }}>Unable to Load Scan History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto' }}>{error}</p>
          </div>
          <button onClick={fetchLogs} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Retry API Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedThreat ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Event ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Target / Source IP</th>
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
                        #{t.id.toString().padStart(4, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {t.type}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#93c5fd', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.sourceIP}>
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
                          color: t.status === 'Active' ? 'var(--accent-amber)' : t.status === 'Quarantined' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
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
                            onClick={() => handleLocalQuarantine(t.id)}
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Block / Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Database size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {logs.length === 0 ? 'No Scan History Records Found' : 'No Matching Events'}
                      </div>
                      <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>
                        {logs.length === 0 
                          ? 'SQLite database has no scan history. Execute an AI inspection in Threat Scanner to record scan events.' 
                          : 'No threat log events matched your search or severity filter.'}
                      </p>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>SQLite Event ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>#{selectedThreat.id.toString().padStart(4, '0')}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Threat Classification</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedThreat.type}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Target / Source IP</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa', wordBreak: 'break-all', fontSize: '0.85rem' }}>{selectedThreat.sourceIP}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Timestamp</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedThreat.timestamp}</div>
              </div>

              <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>AI Model Diagnosis:</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {selectedThreat.message || 'Anomaly score analyzed against security rules.'}
                </div>
              </div>

              {selectedThreat.detectedIndicators && selectedThreat.detectedIndicators.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Detected Indicators:</div>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: '#fda4af' }}>
                    {selectedThreat.detectedIndicators.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedThreat.status === 'Active' && (
                <button 
                  onClick={() => handleLocalQuarantine(selectedThreat.id)}
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  Quarantine & Block Origin IP
                </button>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

