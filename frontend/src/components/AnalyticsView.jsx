import React from 'react';
import { BarChart3, ShieldCheck, Server, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

export default function AnalyticsView() {
  const nodeStats = [
    { name: 'Gateway Edge Node Alpha', cpu: '24%', memory: '1.2 GB / 4 GB', load: 'Low', status: 'Online' },
    { name: 'API Threat Inspection Node Beta', cpu: '58%', memory: '2.8 GB / 4 GB', load: 'Medium', status: 'Online' },
    { name: 'AI Anomaly Inference Node 01', cpu: '34%', memory: '4.1 GB / 8 GB', load: 'Normal', status: 'Online' },
    { name: 'Log Ingestion Stream Node 02', cpu: '12%', memory: '0.9 GB / 4 GB', load: 'Idle', status: 'Online' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#8b5cf6" /> System Analytics & Telemetry
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Infrastructure performance, AI inference latency, and network traffic volume statistics.
        </p>
      </div>

      {/* Grid Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Node Health Status */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#3b82f6" /> Monitored Node Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {nodeStats.map((node, i) => (
              <div key={i} style={{
                background: 'var(--bg-dark)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{node.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span>CPU: {node.cpu}</span>
                    <span>RAM: {node.memory}</span>
                  </div>
                </div>
                <span className="badge badge-low">{node.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Chart Simulation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={18} color="#06b6d4" /> Live Traffic Volume (Req/Sec)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Average request latency: <span style={{ color: '#34d399', fontWeight: 600 }}>4.2 ms</span>
            </p>

            {/* Visual Simulated Bar Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              {[45, 60, 30, 80, 95, 40, 55, 70, 85, 50, 65, 90, 35, 75, 60, 40].map((val, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    flex: 1, 
                    height: `${val}%`, 
                    background: val > 80 ? 'linear-gradient(180deg, #f43f5e 0%, #fb7185 100%)' : 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)', 
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.3s ease'
                  }} 
                  title={`Time slice ${idx}: ${val * 12} req/s`}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>15m ago</span>
            <span>10m ago</span>
            <span>5m ago</span>
            <span>Now</span>
          </div>
        </div>

      </div>
    </div>
  );
}
