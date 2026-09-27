import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ArrowLeft, ArrowRight, ShieldCheck, Mail, Lock, User } from 'lucide-react';

export const RegisterView = () => {
  const { navigateTo, handleRegisterAccount, session } = useAppState();
  const [fullName, setFullName] = useState(session?.operator || '');
  const [email, setEmail] = useState(session?.email || session?.pendingEmail || '');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    handleRegisterAccount({ fullName: fullName.trim() || 'New Apiarist', email: email.trim() });
  };

  return (
    <div className="auth-screen">
      <div className="auth-header">
        <button
          className="auth-back-btn"
          onClick={() => navigateTo('welcome')}
          aria-label="Back to welcome screen"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <div className="auth-content">
        <div className="auth-title-block">
          <span className="micro-text" style={{ color: 'var(--color-primary-honey)' }}>
            Join HoneyChain
          </span>
          <h1 className="auth-title">Create your account</h1>
          <p className="supporting-text" style={{ fontSize: '14px', marginTop: '6px' }}>
            Set up your apiarist or farm profile to begin logging field observations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form card">
          <div className="form-field">
            <label className="field-label" htmlFor="register-name">Full Name</label>
            <div className="field-input-wrap">
              <User size={16} className="field-icon" />
              <input
                id="register-name"
                type="text"
                className="field-input"
                placeholder="e.g. Sarah Lindqvist"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="register-email">Email Address</label>
            <div className="field-input-wrap">
              <Mail size={16} className="field-icon" />
              <input
                id="register-email"
                type="email"
                className="field-input"
                placeholder="sarah@meadowbrook.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="register-password">Password</label>
            <div className="field-input-wrap">
              <Lock size={16} className="field-icon" />
              <input
                id="register-password"
                type="password"
                className="field-input"
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ height: '52px', marginTop: '10px' }}>
            <span>Create Account & Continue</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-footer-note">
          <p className="supporting-text" style={{ textAlign: 'center', fontSize: '13px' }}>
            Already have an account?{' '}
            <button
              className="text-link-btn"
              onClick={() => navigateTo('login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-screen {
          width: 100%;
          height: 100%;
          min-height: 100%;
          overflow-y: auto;
          background-color: var(--color-warm-cream);
          display: flex;
          flex-direction: column;
          padding: calc(var(--safe-top) + 16px) var(--mobile-pad) calc(var(--safe-bottom) + 24px);
          box-sizing: border-box;
        }

        .auth-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .auth-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-warm-gray);
          cursor: pointer;
          padding: 8px 4px;
          border-radius: 8px;
          transition: color 0.15s ease;
        }

        .auth-back-btn:hover {
          color: var(--color-deep-cocoa);
        }

        .auth-content {
          max-width: 400px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-title-block {
          text-align: left;
        }

        .auth-title {
          font-family: var(--font-family);
          font-size: 26px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          line-height: 1.25;
          letter-spacing: -0.015em;
          margin: 4px 0 0;
        }

        .auth-form {
          background-color: var(--color-soft-ivory);
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid var(--color-card-border);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: var(--color-warm-gray);
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          font-family: var(--font-family);
          font-size: 14.5px;
          padding: 11px 12px 11px 36px;
          border-radius: var(--radius-button);
          border: 1px solid var(--color-card-border);
          background-color: #FFFDF9;
          color: var(--color-deep-cocoa);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .field-input:focus {
          border-color: var(--color-primary-honey);
        }

        .text-link-btn {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-weight: 600;
          color: var(--color-primary-honey);
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
