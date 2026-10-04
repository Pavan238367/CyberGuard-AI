import React from 'react';
import { ShieldAlert, Cpu, Activity, Lock, Zap, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DashboardView({ 
  threats = [], 
  threatsLoading = false,
  analyticsData = null, 
  analyticsLoading = false, 
  analyticsError = null, 
  onRefreshAnalytics,
  onNavigateToScanner, 
  onQuarantineThreat 
}) {
  const totalScans = analyticsData ? analyticsData.total_scans : threats.length;
  const activeCount = analyticsData ? analyticsData.active_count : threats.filter(t => t.status === 'Active').length;
  const resolvedCount = analyticsData ? analyticsData.resolved_count : threats.filter(t => t.status === 'Resolved' || t.status === 'Quarantined').length;
  
  const avgConf = analyticsData 
    ? Math.round(analyticsData.average_confidence <= 1 ? analyticsData.average_confidence * 100 : analyticsData.average_confidence)
    : 0;

  const metrics = [
    {
      title: 'Threat Risk Score',
      value: totalScans > 0 && analyticsData ? `${analyticsData.threat_risk_score ?? 0}/100` : 'N/A',
      subtitle: totalScans > 0 && analyticsData
        ? (analyticsData.threat_risk_score > 60 ? 'High Risk Assessment' : analyticsData.threat_risk_score > 30 ? 'Moderate Risk' : 'Low Composite Risk')
        : 'No Scan History',
      change: totalScans > 0 ? 'SQLite Computed' : 'No Data',
      color: analyticsData && analyticsData.threat_risk_score > 60 ? '#f43f5e' : analyticsData && analyticsData.threat_risk_score > 30 ? '#f59e0b' : '#10b981',
      icon: ShieldAlert
    },
    {
      title: 'Blocked Threats',
      value: analyticsData ? `${analyticsData.blocked_threats ?? 0}` : `${resolvedCount}`,
      subtitle: analyticsData ? `${analyticsData.resolved_count} Clean/Resolved` : 'Auto-Mitigated',
      change: 'Auto-Protection',
      color: '#10b981',
      icon: Lock
    },
    {
      title: 'Active AI Models',
      value: analyticsData ? `${analyticsData.active_models_count ?? 4} Active` : '4 Active',
      subtitle: 'SQLi, XSS & Keyword Engines',
      change: '100% Operational',
      color: '#8b5cf6',
      icon: Cpu
    },
    {
      title: 'Mitigation Rate',
      value: totalScans > 0 && analyticsData ? `${analyticsData.mitigation_rate ?? 0}%` : 'N/A',
      subtitle: totalScans > 0 ? `${resolvedCount} of ${activeCount + resolvedCount} Mitigated` : 'No Threat Data',
      change: totalScans > 0 && analyticsData && analyticsData.mitigation_rate >= 80 ? 'Optimal' : 'Active Monitoring',
      color: '#06b6d4',
      icon: Zap
    },
    {
      title: 'Total Scans Analyzed',
      value: `${totalScans}`,
      subtitle: analyticsData ? `${analyticsData.recent_scan_count} in last 24h` : 'SQLite DB Connected',
      change: 'SQLite History',
      color: '#3b82f6',
      icon: Activity
    },
    {
      title: 'Avg AI Confidence',
      value: totalScans > 0 ? `${avgConf}%` : 'N/A',
      subtitle: 'Classifier Score',
      change: 'FastAPI Model',
      color: '#ec4899',
      icon: CheckCircle2
    }
  ];

  const sevDist = analyticsData?.severity_distribution || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const calcPct = (cnt) => totalScans > 0 ? Math.round((cnt / totalScans) * 100) : 0;

  const vectorBreakdown = [
    { name: 'Critical Risk Payload', percentage: calcPct(sevDist.CRITICAL), count: sevDist.CRITICAL, color: '#f43f5e' },
    { name: 'High Risk Threat', percentage: calcPct(sevDist.HIGH), count: sevDist.HIGH, color: '#f97316' },
    { name: 'Medium Risk Suspicious', percentage: calcPct(sevDist.MEDIUM), count: sevDist.MEDIUM, color: '#f59e0b' },
    { name: 'Low Risk / Clean Target', percentage: calcPct(sevDist.LOW), count: sevDist.LOW, color: '#10b981' }
  ];

  const isDataLoading = analyticsLoading || threatsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Quick Action */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-low">Live Defense Active</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>SQLite Analytics Sync</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>
            Real-Time AI Security Sentinel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            CyberGuard AI is actively inspecting network logs, API payloads, and payload metrics for anomalies.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onRefreshAnalytics && (
            <button 
              className="btn btn-outline" 
              onClick={onRefreshAnalytics}
              disabled={isDataLoading}
              title="Refresh Analytics from API"
            >
              <RefreshCw size={16} className={isDataLoading ? "spin" : ""} /> Sync API
            </button>
          )}
          <button className="btn btn-primary" onClick={onNavigateToScanner}>
            <Zap size={16} /> Run AI Threat Audit
          </button>
        </div>
      </div>

      {/* API Error State Banner */}
      {analyticsError && (
        <div className="card" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Backend API Error: {analyticsError}</span>
          </div>
          {onRefreshAnalytics && (
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={onRefreshAnalytics}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty Database State Banner */}
      {analyticsData && analyticsData.total_scans === 0 && !analyticsError && (
        <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa' }}>
            <ShieldAlert size={20} />
            <div>
              <div style={{ fontWeight: 600 }}>SQLite Database Empty</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No scan history records found in SQLite. Run a new scan in the Scanner tab to populate live analytics telemetry.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {m.title}
                </span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: `${m.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.color
                }}>
                  <Icon size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {isDataLoading && !analyticsData ? '...' : m.value}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{m.subtitle}</span>
                <span style={{ color: m.color, fontWeight: 600 }}>{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Threat Stream & Threat Vector Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Live Threat Stream Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Threat Detections</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest flagged events analyzed by CyberGuard AI</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Total: {threats.length} Events
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Threat Event</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Source IP</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Severity</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Confidence</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isDataLoading && threats.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading recent threat detections from SQLite...
                    </td>
                  </tr>
                ) : threats.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No threats recorded yet. Run a scan from the AI Threat Scanner.
                    </td>
                  </tr>
                ) : (
                  threats.slice(0, 5).map((threat) => (
                    <tr key={threat.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{threat.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{threat.timestamp}</div>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#93c5fd' }}>
                        {threat.sourceIP}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge badge-${(threat.severity || 'low').toLowerCase()}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        <span style={{ color: threat.confidence > 90 ? '#34d399' : '#fde68a' }}>
                          {threat.confidence}%
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {threat.status === 'Active' ? (
                          <button 
                            onClick={() => onQuarantineThreat(threat.id)}
                            className="btn btn-outline" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Quarantine
                          </button>
                        ) : (
                          <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> {threat.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threat Vector Distribution Card (Powered by GET /api/analytics) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Attack Vector Risk</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              SQLite DB Severity Breakdown ({totalScans} Scans)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vectorBreakdown.map((vec, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{vec.name}</span>
                    <span style={{ fontWeight: 600, color: vec.color }}>{vec.count} ({vec.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${vec.percentage}%`, height: '100%', background: vec.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lock size={20} color="#60a5fa" />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Auto-Quarantine is enabled for threats with confidence &gt; 85%.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
