import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldCheck, Server, Cpu, RefreshCw, AlertTriangle, Activity, Database, Calendar } from 'lucide-react';
import { getAnalytics } from '../api';

export default function AnalyticsView({ 
  analyticsData: propAnalyticsData, 
  analyticsLoading: propAnalyticsLoading, 
  analyticsError: propAnalyticsError, 
  onRefreshAnalytics: propOnRefreshAnalytics 
}) {
  const [internalData, setInternalData] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const fetchInternalAnalytics = async () => {
    setInternalLoading(true);
    setInternalError(null);
    try {
      const data = await getAnalytics();
      setInternalData(data);
    } catch (err) {
      setInternalError(err.message || 'Failed to fetch analytics');
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!propAnalyticsData && !propAnalyticsLoading && !propAnalyticsError) {
      fetchInternalAnalytics();
    }
  }, [propAnalyticsData, propAnalyticsLoading, propAnalyticsError]);

  const data = propAnalyticsData || internalData;
  const loading = propAnalyticsLoading ?? internalLoading;
  const error = propAnalyticsError || internalError;
  const handleRefresh = propOnRefreshAnalytics || fetchInternalAnalytics;

  const totalScans = data?.total_scans || 0;
  const criticalCount = data?.critical_count || 0;
  const highCount = data?.high_count || 0;
  const mediumCount = data?.medium_count || 0;
  const lowCount = data?.low_count || 0;
  const activeCount = data?.active_count || 0;
  const resolvedCount = data?.resolved_count || 0;
  const avgConf = data ? (data.average_confidence <= 1 ? data.average_confidence * 100 : data.average_confidence).toFixed(1) : '0.0';
  const recentCount = data?.recent_scan_count || 0;
  const scanTrend = data?.scan_trend || [];
  const sevDist = data?.severity_distribution || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  const maxTrendCount = scanTrend.length > 0 ? Math.max(...scanTrend.map(t => t.count), 1) : 1;

  const calcPct = (cnt) => totalScans > 0 ? Math.round((cnt / totalScans) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Sync Action */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#8b5cf6" /> Security Telemetry & Analytics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Dynamic analytics computed directly from SQLite database scan history.
          </p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={handleRefresh} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? 'Fetching...' : 'Sync Telemetry'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e' }}>
            <AlertTriangle size={20} />
            <div>
              <div style={{ fontWeight: 600 }}>Analytics API Error</div>
              <div style={{ fontSize: '0.85rem' }}>{error}</div>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: '#3b82f6' }} />
          Loading analytics from SQLite database...
        </div>
      )}

      {/* Empty Database State */}
      {data && totalScans === 0 && !loading && (
        <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1.5rem', textAlign: 'center' }}>
          <Database size={36} color="#60a5fa" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#93c5fd', marginBottom: '0.5rem' }}>
            SQLite Scan Database is Empty
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            No security scans have been recorded in the database history yet. Perform a threat analysis in the AI Threat Scanner to populate telemetry.
          </p>
        </div>
      )}

      {/* Main Analytics Content */}
      {data && (
        <>
          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Total DB Scans</span>
                <Database size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalScans}</div>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>Recorded in SQLite</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>High / Critical Threats</span>
                <AlertTriangle size={18} color="#f43f5e" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: criticalCount + highCount > 0 ? '#f43f5e' : 'var(--text-main)' }}>
                {criticalCount + highCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Critical: {criticalCount} | High: {highCount}
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Avg Threat Confidence</span>
                <Cpu size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>
                {avgConf}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Pattern Detection Score</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>24h Scan Volume</span>
                <Calendar size={18} color="#06b6d4" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{recentCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px' }}>Scans in last 24h</div>
            </div>
          </div>

          {/* Charts Section: Scan Trend & Severity Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Scan Trend Date-Based Chart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#06b6d4" /> Scan Trend Over Time
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    GET /api/analytics
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Daily historical scan volume calculated from database timestamps.
                </p>

                {scanTrend.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No scan trend data recorded yet.
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    gap: '12px', 
                    height: '160px', 
                    paddingBottom: '10px', 
                    borderBottom: '1px solid var(--border-color)' 
                  }}>
                    {scanTrend.map((item, idx) => {
                      const heightPct = Math.max(Math.round((item.count / maxTrendCount) * 100), 12);
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>
                            {item.count}
                          </span>
                          <div 
                            style={{ 
                              width: '100%', 
                              maxWidth: '48px',
                              height: `${heightPct}%`, 
                              background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', 
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.4s ease',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                            }} 
                            title={`Date: ${item.date} | Scans: ${item.count}`}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                            {item.date ? item.date.slice(5) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Severity Risk Level Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" /> Severity Risk Level Distribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Distribution of risk levels across all {totalScans} SQLite database records.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { label: 'CRITICAL', count: sevDist.CRITICAL || 0, color: '#f43f5e' },
                  { label: 'HIGH', count: sevDist.HIGH || 0, color: '#f97316' },
                  { label: 'MEDIUM', count: sevDist.MEDIUM || 0, color: '#f59e0b' },
                  { label: 'LOW', count: sevDist.LOW || 0, color: '#10b981' },
                ].map((item, i) => {
                  const pct = calcPct(item.count);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: item.color }}>{item.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          <strong>{item.count}</strong> scan{item.count !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Active Threat Status: <strong style={{ color: '#f43f5e' }}>{activeCount}</strong></span>
                <span>Resolved Status: <strong style={{ color: '#34d399' }}>{resolvedCount}</strong></span>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
