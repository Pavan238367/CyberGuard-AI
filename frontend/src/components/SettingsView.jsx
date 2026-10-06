import React, { useState } from 'react';
import { Settings, Shield, Sliders, Bell, Lock, Save, Check } from 'lucide-react';

export default function SettingsView() {
  const [sensitivity, setSensitivity] = useState(85);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [logRetentionDays, setLogRetentionDays] = useState('30');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* Header */}
      <div className="card">
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="#3b82f6" /> CyberGuard AI Configuration
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Adjust threat confidence thresholds, response policies, and log settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Sensitivity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} color="#3b82f6" /> Threat Detection Confidence Threshold
            </label>
            <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{sensitivity}%</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Flag targets as malicious when detection confidence equals or exceeds this percentage.
          </p>
          <input
            type="range"
            min="50"
            max="99"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>

        <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

        {/* Toggle Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="#10b981" /> Threat Quarantine Policy
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Enable quarantine option for high-risk threat detections.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoQuarantine}
              onChange={(e) => setAutoQuarantine(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#f59e0b" /> Security Alert Notifications
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Send instant notification digest on High/Critical incidents.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

        </div>

        <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

        {/* Log Retention Select */}
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            Audit Log Retention Duration
          </label>
          <select
            className="select"
            value={logRetentionDays}
            onChange={(e) => setLogRetentionDays(e.target.value)}
          >
            <option value="7">7 Days Retention</option>
            <option value="30">30 Days Retention</option>
            <option value="90">90 Days Retention</option>
            <option value="365">1 Year Retention</option>
          </select>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            {isSaved ? (
              <>
                <Check size={16} /> Saved Configuration
              </>
            ) : (
              <>
                <Save size={16} /> Save Security Preferences
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
