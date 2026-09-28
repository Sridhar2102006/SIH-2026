import React, { useState } from 'react';
import { 
  Globe, 
  Bell, 
  Eye, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Check, 
  Sliders,
  Download,
  Info
} from 'lucide-react';

export const SharedAccountSettings = ({
  session,
  onUpdateIdentity,
  showToast
}) => {
  const [language, setLanguage] = useState(session?.language || 'en');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onUpdateIdentity) {
      onUpdateIdentity({
        language,
        preferences: {
          emailAlerts,
          smsAlerts,
          pushAlerts,
          highContrast,
          analyticsOptIn
        }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleExportData = () => {
    if (showToast) showToast('Exporting encrypted account ledger archive...');
  };

  return (
    <div className="shared-account-settings" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Language & Regional Format */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Globe size={18} color="var(--color-primary-honey)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Language & Regional Display</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Interface Language
            </label>
            <select
              className="input-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="en">English (Universal)</option>
              <option value="ta">தமிழ் (Tamil - தமிழ் நாடு & ஈழம்)</option>
              <option value="hi">हिन्दी (Hindi - National)</option>
              <option value="kn">ಕನ್ನಡ (Kannada - Karnataka)</option>
              <option value="te">తెలుగు (Telugu - Andhra & Telangana)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Timezone & Date Standard
            </label>
            <input
              type="text"
              readOnly
              value="Asia/Kolkata (IST • UTC+05:30) • DD/MM/YYYY"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-surface-hover)', color: 'var(--theme-text-secondary)', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Notification Channels */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Bell size={18} color="var(--color-primary-honey)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>System Notification Channels</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Mobile Push Notifications</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Instant alerts on batch approvals, lab results & harvest submissions</div>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-honey)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>SMS Urgent Dispatch & Field Alerts</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Critical delivery confirmations and tamper seal exceptions via SMS</div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-honey)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Email Weekly Digest & Audit Summaries</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Weekly regulatory ledger and compliance summaries sent to your email</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-honey)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Accessibility & Privacy */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Eye size={18} color="var(--color-primary-honey)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Accessibility & Privacy Governance</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>High-Contrast Display</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Enhance borders & contrast in bright outdoor sunlight</div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-honey)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Anonymized Telemetry Sharing</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Contribute bee health data to regional biodiversity research</div>
            </div>
            <input
              type="checkbox"
              checked={analyticsOptIn}
              onChange={(e) => setAnalyticsOptIn(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-honey)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export Account Data Archive
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            Save Account Preferences
          </button>
        </div>
      </div>

      {/* 4. About & Legal Info */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: 'var(--theme-surface-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Info size={16} color="var(--theme-text-secondary)" />
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>HoneyChain Platform Information</h4>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)', lineHeight: '1.6' }}>
          Version 2.4.0 • Enterprise Apiculture & Honey Traceability Architecture • Node: IN-WESTERN-GHATS-01<br />
          Compliant with Codex Alimentarius Stan 12-1981, FSSAI Honey Standards (2020), & ISO/IEC 17025:2017.
        </div>
      </div>
    </div>
  );
};
