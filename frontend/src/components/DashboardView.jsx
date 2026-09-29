import React from 'react';
import { ShieldAlert, Cpu, Activity, Lock, ArrowUpRight, Zap, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DashboardView({ threats, onNavigateToScanner, onQuarantineThreat }) {
  const criticalCount = threats.filter(t => t.severity === 'Critical').length;
  const highCount = threats.filter(t => t.severity === 'High').length;
  const resolvedCount = threats.filter(t => t.status === 'Resolved' || t.status === 'Quarantined').length;

  const metrics = [
    {
      title: 'Threat Risk Score',
      value: '24 / 100',
      subtitle: 'Low Threat Level',
      change: '-12% this hour',
      color: '#10b981',
      icon: ShieldAlert
    },
    {
      title: 'Blocked Threats',
      value: `${threats.length * 142}`,
      subtitle: `${criticalCount} Critical prevented`,
      change: '+18 today',
      color: '#3b82f6',
      icon: Zap
    },
    {
      title: 'Active AI Models',
      value: '4 / 4',
      subtitle: 'Anomaly & Malware Models',
      change: '100% Operational',
      color: '#8b5cf6',
      icon: Cpu
    },
    {
      title: 'Mitigation Rate',
      value: '99.4%',
      subtitle: `${resolvedCount} threats auto-handled`,
      change: '+0.4% efficiency',
      color: '#06b6d4',
      icon: Activity
    }
  ];

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
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Updated 2 mins ago</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>
            Real-Time AI Security Sentinel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            CyberGuard AI is actively inspecting network logs, API payloads, and payload metrics for anomalies.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onNavigateToScanner}>
            <Zap size={16} /> Run AI Threat Audit
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
              <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {m.value}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
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
                {threats.slice(0, 5).map((threat) => (
                  <tr key={threat.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{threat.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{threat.timestamp}</div>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#93c5fd' }}>
                      {threat.sourceIP}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${threat.severity.toLowerCase()}`}>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threat Vector Distribution Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Attack Vector Risk</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>AI Classification Breakdown</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'SQL Injection / XSS', percentage: 42, color: '#f43f5e' },
                { name: 'Brute Force Anomaly', percentage: 28, color: '#f59e0b' },
                { name: 'API Rate Overuse', percentage: 18, color: '#3b82f6' },
                { name: 'Suspicious IP Payload', percentage: 12, color: '#8b5cf6' }
              ].map((vec, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{vec.name}</span>
                    <span style={{ fontWeight: 600, color: vec.color }}>{vec.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${vec.percentage}%`, height: '100%', background: vec.color, borderRadius: '3px' }} />
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
