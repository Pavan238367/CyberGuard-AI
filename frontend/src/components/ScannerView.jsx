import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Terminal, RefreshCw, Zap } from 'lucide-react';
import { analyzeThreat } from '../api';

export default function ScannerView({ onAddThreat }) {
  const [scanType, setScanType] = useState('payload');
  const [inputText, setInputText] = useState(`SELECT * FROM users WHERE username = 'admin' OR '1'='1' --;`);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const samplePresets = {
    payload: `SELECT * FROM users WHERE username = 'admin' OR '1'='1' --;`,
    ip: `194.26.29.112`,
    domain: `malicious-phishing-site.com`,
    url: `http://malicious-login-update.phishing-verify-auth.com/login.php`,
    hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  };

  const handleSelectPreset = (type) => {
    setScanType(type);
    setInputText(samplePresets[type] || '');
    setScanResult(null);
    setErrorMessage(null);
  };

  const handleRunScan = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    try {
      const data = await analyzeThreat(inputText.trim(), scanType);
      
      const rawConf = data.confidence ?? 0;
      const confidencePct = Math.round(rawConf <= 1 ? rawConf * 100 : rawConf);
      const isThreat = data.status === 'suspicious' || data.risk_level === 'HIGH' || data.risk_level === 'MEDIUM';

      const result = {
        target: data.target,
        targetType: data.target_type,
        riskLevel: data.risk_level,
        confidence: confidencePct,
        status: data.status,
        message: data.message,
        detectedIndicators: data.detected_indicators || [],
        isThreat: isThreat,
        timestamp: new Date().toLocaleTimeString()
      };

      setScanResult(result);

      if (isThreat && onAddThreat) {
        onAddThreat({
          id: Date.now(),
          type: `${data.target_type.toUpperCase()} Threat Indicator`,
          sourceIP: scanType === 'ip' ? data.target : '192.168.1.105',
          severity: data.risk_level === 'HIGH' ? 'High' : data.risk_level === 'MEDIUM' ? 'Medium' : 'Low',
          confidence: confidencePct,
          timestamp: new Date().toLocaleTimeString(),
          status: 'Active'
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to FastAPI threat detection backend.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="#3b82f6" /> AI Threat Scanner & Vulnerability Inspector
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Rule-based threat pattern inspection connected to CyberGuard FastAPI backend. Inspect IP addresses, domains, URLs, file hashes, and payloads.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Input & Scanner Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Select Target Type:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'payload', label: 'HTTP / Payload' },
                { id: 'ip', label: 'IP Address' },
                { id: 'domain', label: 'Domain' },
                { id: 'url', label: 'URL' },
                { id: 'hash', label: 'File Hash' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPreset(item.id)}
                  style={{
                    flex: '1 1 calc(33.3% - 8px)',
                    minWidth: '100px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    background: scanType === item.id ? 'var(--primary)' : 'var(--bg-dark)',
                    color: scanType === item.id ? 'white' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Inspection Target / Input String:
            </label>
            <textarea
              rows={6}
              className="textarea font-mono"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter IP address, domain, URL, file hash, or HTTP payload..."
            />
          </div>

          <button
            onClick={handleRunScan}
            disabled={isScanning || !inputText.trim()}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Analyzing with FastAPI Backend...
              </>
            ) : (
              <>
                <Zap size={18} /> Execute Threat Inspection
              </>
            )}
          </button>
        </div>

        {/* Scan Results Output Container */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                <Cpu size={36} color="#3b82f6" className="animate-pulse" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>FastAPI Backend Analysis in Progress</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sending request to POST http://127.0.0.1:8000/api/analyze...</p>
            </div>
          ) : errorMessage ? (
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem' }}>
                <AlertTriangle size={20} /> Backend Connection Error
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {errorMessage}
              </p>
            </div>
          ) : scanResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${scanResult.riskLevel === 'HIGH' ? 'badge-critical' : scanResult.riskLevel === 'MEDIUM' ? 'badge-high' : 'badge-low'}`}>
                  Risk Level: {scanResult.riskLevel}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {scanResult.timestamp}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                  Status: <span style={{ color: scanResult.status === 'suspicious' ? '#f43f5e' : '#10b981', fontWeight: 700 }}>{scanResult.status.toUpperCase()}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: scanResult.isThreat ? '#f43f5e' : '#10b981', marginBottom: '8px' }}>
                  {scanResult.message}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-dark)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', wordBreak: 'break-all' }}>
                  Target ({scanResult.targetType}): {scanResult.target}
                </div>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Backend Confidence Score</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                  {scanResult.confidence}%
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Detected Threat Signals & Indicators:
                </h4>
                <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {scanResult.detectedIndicators.length > 0 ? (
                    scanResult.detectedIndicators.map((ind, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={14} color="#f43f5e" /> <span style={{ color: '#fda4af' }}>{ind}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color="#10b981" /> No malicious patterns or attack vectors found
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Terminal size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>No Inspection Run Yet</h3>
              <p style={{ fontSize: '0.825rem' }}>Select a target type or enter an IP, domain, URL, file hash, or payload to analyze via FastAPI backend.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
