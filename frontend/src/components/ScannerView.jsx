import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Terminal, RefreshCw, FileText, Zap } from 'lucide-react';

export default function ScannerView({ onAddThreat }) {
  const [scanType, setScanType] = useState('payload');
  const [inputText, setInputText] = useState(`SELECT * FROM users WHERE username = 'admin' OR '1'='1' --;`);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const samplePresets = {
    payload: `SELECT * FROM users WHERE username = 'admin' OR '1'='1' --;`,
    ip: `194.26.29.112`,
    url: `http://malicious-login-update.phishing-verify-auth.com/login.php`
  };

  const handleSelectPreset = (type) => {
    setScanType(type);
    setInputText(samplePresets[type]);
    setScanResult(null);
  };

  const handleRunScan = () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      let isThreat = false;
      let severity = 'Low';
      let confidence = 45;
      let threatType = 'Clean / Normal';
      let details = 'No malicious indicators detected in payload analysis.';
      let mitigations = ['Standard request logging', 'Normal rate limits apply'];

      if (inputText.toLowerCase().includes('select') || inputText.includes("'1'='1'") || inputText.includes('--')) {
        isThreat = true;
        severity = 'Critical';
        confidence = 98;
        threatType = 'SQL Injection Vector';
        details = 'Detected unauthorized database query syntax manipulation designed to bypass authentication.';
        mitigations = [
          'Enforce parameterized SQL prepared statements',
          'Block IP at Web Application Firewall (WAF) tier',
          'Sanitize all raw string input parameters'
        ];
      } else if (inputText.toLowerCase().includes('phishing') || inputText.toLowerCase().includes('malicious')) {
        isThreat = true;
        severity = 'High';
        confidence = 91;
        threatType = 'Phishing Domain Indicator';
        details = 'URL pattern matches known credential harvesting domain fingerprints.';
        mitigations = [
          'Block outbound network requests to domain',
          'Add URL to threat intelligence list'
        ];
      } else if (scanType === 'ip') {
        isThreat = true;
        severity = 'Medium';
        confidence = 82;
        threatType = 'Botnet Host IP';
        details = 'IP address flagged in active SSH brute-force botnet campaign.';
        mitigations = [
          'Apply immediate firewall drop rule',
          'Flag session tokens associated with IP'
        ];
      }

      const result = {
        isThreat,
        severity,
        confidence,
        threatType,
        details,
        mitigations,
        timestamp: new Date().toLocaleTimeString()
      };

      setScanResult(result);

      if (isThreat) {
        onAddThreat({
          id: Date.now(),
          type: threatType,
          sourceIP: scanType === 'ip' ? inputText : '192.168.1.105',
          severity: severity,
          confidence: confidence,
          timestamp: new Date().toLocaleTimeString(),
          status: 'Active'
        });
      }
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="#3b82f6" /> AI Threat Scanner & Vulnerability Inspector
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Simulate real-time AI security inspection on HTTP payloads, IP addresses, or suspicious URLs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Input & Scanner Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Select Inspection Target Type:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'payload', label: 'HTTP / SQL Payload' },
                { id: 'ip', label: 'Target IP Address' },
                { id: 'url', label: 'URL / Domain' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPreset(item.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
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
              Raw Data Payload / Target Input:
            </label>
            <textarea
              rows={6}
              className="textarea font-mono"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw request, IP, or payload snippet..."
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
                <RefreshCw size={18} className="animate-spin" /> Analyzing with CyberGuard AI...
              </>
            ) : (
              <>
                <Zap size={18} /> Execute AI Inspection
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>AI Neural Model Analyzing Payload</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Extracting features, AST tokens, and vector embedding pattern matching...</p>
            </div>
          ) : scanResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${scanResult.severity.toLowerCase()}`}>
                  {scanResult.severity} Risk
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {scanResult.timestamp}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: scanResult.isThreat ? '#f43f5e' : '#10b981', marginBottom: '4px' }}>
                  {scanResult.threatType}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {scanResult.details}
                </p>
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Confidence Score</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                  {scanResult.confidence}%
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Recommended Mitigation Steps:
                </h4>
                <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {scanResult.mitigations.map((step, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color="#10b981" /> {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Terminal size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>No Inspection Run Yet</h3>
              <p style={{ fontSize: '0.825rem' }}>Select a preset or enter payload text on the left to trigger the AI analysis engine.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
