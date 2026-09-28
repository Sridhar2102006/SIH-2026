import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Laptop, 
  LogOut, 
  Check, 
  AlertCircle, 
  Lock, 
  History,
  Trash2
} from 'lucide-react';

export const SharedSecuritySection = ({
  session,
  onLogout,
  showToast
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    session?.twoFactorEnabled ?? true
  );

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-current',
      device: 'Chrome on Windows 11',
      location: 'Coimbatore, India',
      ip: '157.48.12.194',
      lastActive: 'Just now (Current Session)',
      isCurrent: true
    },
    {
      id: 'sess-mobile',
      device: 'HoneyChain Companion App on iPhone 15',
      location: 'Coimbatore, India',
      ip: '157.48.12.195',
      lastActive: '4 hours ago',
      isCurrent: false
    }
  ]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus({ type: 'success', message: 'Password successfully updated across HoneyChain.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordStatus(null);
      setIsChangingPassword(false);
    }, 2500);
  };

  const handleRevokeOtherSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.isCurrent));
    if (showToast) showToast('All other device sessions have been revoked.');
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    if (showToast) {
      showToast(!twoFactorEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled');
    }
  };

  return (
    <div className="shared-security-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Account Password Management */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--color-primary-honey)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Login Security & Password</h3>
          </div>
          {!isChangingPassword && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {passwordStatus && (
              <div 
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: passwordStatus.type === 'error' ? '#FEE2E2' : '#F0FDF4',
                  color: passwordStatus.type === 'error' ? '#B91C1C' : '#15803D',
                  border: `1px solid ${passwordStatus.type === 'error' ? '#FECACA' : '#BBF7D0'}`
                }}
              >
                {passwordStatus.message}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Current Password
              </label>
              <input 
                type="password"
                className="input-select"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  New Password
                </label>
                <input 
                  type="password"
                  className="input-select"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  className="input-select"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordStatus(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
              >
                Save New Password
              </button>
            </div>
          </form>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--theme-text-secondary)' }}>
            Password last changed 45 days ago • Strong cryptographic password policy active
          </div>
        )}
      </div>

      {/* 2. Two-Factor Authentication (2FA) */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: twoFactorEnabled ? '#EBF7EE' : '#F3F4F6',
                color: twoFactorEnabled ? '#15803D' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                {twoFactorEnabled
                  ? 'Authenticator App (TOTP) is active for high-security actions'
                  : 'Add an extra layer of protection to your HoneyChain workspace'}
              </div>
            </div>
          </div>

          <button 
            className={`btn ${twoFactorEnabled ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={handleToggle2FA}
          >
            {twoFactorEnabled ? 'Enabled (Turn Off)' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* 3. Session Management & Active Devices */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Laptop size={18} color="var(--color-primary-honey)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Active Logged-in Sessions</h3>
          </div>
          {activeSessions.length > 1 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRevokeOtherSessions}
              style={{ color: '#B91C1C', borderColor: '#FECACA' }}
            >
              Revoke Other Sessions
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeSessions.map((sess) => (
            <div 
              key={sess.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'var(--theme-surface-hover)',
                borderRadius: '8px',
                border: sess.isCurrent ? '1px solid #BBF7D0' : '1px solid var(--theme-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Laptop size={16} color={sess.isCurrent ? '#15803D' : '#6B7280'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {sess.device} {sess.isCurrent && <span style={{ color: '#15803D', fontSize: '11px' }}>(This device)</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
                    {sess.location} • IP: {sess.ip} • {sess.lastActive}
                  </div>
                </div>
              </div>

              {sess.isCurrent ? (
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                  ● Active
                </span>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveSessions(prev => prev.filter(s => s.id !== sess.id))}
                  style={{ padding: '2px 8px', fontSize: '11px', color: '#B91C1C' }}
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Security & Login Audit Activity */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <History size={18} color="var(--color-primary-honey)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Recent Account Security Activity</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '6px' }}>
            <div>
              <strong>Login Successful (Password + 2FA)</strong>
              <div style={{ color: 'var(--theme-text-secondary)' }}>Chrome on Windows • IP 157.48.12.194</div>
            </div>
            <span style={{ color: 'var(--theme-text-secondary)' }}>Today, 09:30 AM</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '6px' }}>
            <div>
              <strong>Workspace Switched to Beekeeper</strong>
              <div style={{ color: 'var(--theme-text-secondary)' }}>Session context updated cleanly</div>
            </div>
            <span style={{ color: 'var(--theme-text-secondary)' }}>Yesterday, 04:15 PM</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Mobile Token Refreshed</strong>
              <div style={{ color: 'var(--theme-text-secondary)' }}>HoneyChain iOS Companion App</div>
            </div>
            <span style={{ color: 'var(--theme-text-secondary)' }}>2 days ago</span>
          </div>
        </div>
      </div>

      {/* 5. Account Sign Out */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#991B1B' }}>
              Sign Out of HoneyChain
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#B91C1C' }}>
              Securely terminates the active session and locks all workspace access keys on this device.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={onLogout}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#FCA5A5',
              color: '#B91C1C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
            id="account-signout-btn"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
