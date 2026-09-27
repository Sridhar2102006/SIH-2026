import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  signInWithCredentials,
  signInWithGoogle
} from '../../services/authService';

export const LoginView = () => {
  const { navigateTo, handleLoginSuccess, isOnline } = useAppState();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field Touched / Dirty State (avoid aggressive validation before user interaction)
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Error States
  const [authError, setAuthError] = useState(null); // { message: string, type: string, action?: string }
  const [resendStatus, setResendStatus] = useState(null);

  // Computed Field Errors
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  // Primary action button disabled state: required fields clearly missing or submitting
  const isFormIncomplete = !email.trim() || !password.trim();
  const isButtonDisabled = isFormIncomplete || isSubmitting || isGoogleSubmitting;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isGoogleSubmitting) return;

    // Mark fields as touched
    setTouched({ email: true, password: true });

    // Validate fields before submitting
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr || pErr) {
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);

    try {
      const result = await signInWithCredentials({
        email,
        password,
        isOnline
      });

      if (result.success) {
        handleLoginSuccess(result.session);
      } else {
        setAuthError({
          type: result.errorType,
          message: result.message
        });
      }
    } catch (err) {
      setAuthError({
        type: 'UNEXPECTED',
        message: "Couldn't sign in right now. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    if (isSubmitting || isGoogleSubmitting) return;

    setAuthError(null);
    setIsGoogleSubmitting(true);

    try {
      const result = await signInWithGoogle({ isOnline });

      if (result.success) {
        handleLoginSuccess(result.session);
      } else {
        setAuthError({
          type: result.errorType,
          message: result.message
        });
      }
    } catch (err) {
      setAuthError({
        type: 'UNEXPECTED',
        message: "Google sign in was interrupted. Please try again."
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleResendVerification = () => {
    setResendStatus('Verification link sent. Check your inbox.');
    setTimeout(() => {
      setResendStatus(null);
    }, 4500);
  };

  return (
    <div className="login-screen" role="region" aria-label="HoneyChain Sign in">
      {/* Top Bar: Small, clear back navigation to Welcome */}
      <div className="login-top-bar">
        <button
          type="button"
          className="login-back-btn"
          onClick={() => navigateTo('welcome')}
          aria-label="Back to welcome screen"
          disabled={isSubmitting || isGoogleSubmitting}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>

      <main className="login-container">
        {/* Subtle Brandmark Identity */}
        <div className="login-brand-header">
          <div className="login-brandmark-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
              <path
                d="M32 5.5L54 18.2V43.8L32 56.5L10 43.8V18.2L32 5.5Z"
                stroke="var(--color-primary-honey)"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path
                d="M32 17C32 17 43 31.5 43 38C43 44.075 38.075 49 32 49C25.925 49 21 44.075 21 38C21 31.5 32 17 32 17Z"
                fill="var(--color-primary-honey)"
              />
            </svg>
          </div>
          <h1 className="login-heading" id="login-title">Welcome back</h1>
          <p className="login-subtitle">
            Sign in to continue managing your hives and honey.
          </p>
        </div>

        {/* Human-Readable Authentication Error Alert Banner */}
        {authError && (
          <div
            className={`auth-alert-banner ${authError.type === 'OFFLINE' ? 'offline' : ''}`}
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={18} className="alert-icon" aria-hidden="true" />
            <div className="alert-body">
              {authError.type === 'OFFLINE' && (
                <strong className="alert-title">You're offline</strong>
              )}
              <p className="alert-message">{authError.message}</p>

              {/* Action for Offline state */}
              {authError.type === 'OFFLINE' && (
                <button
                  type="button"
                  className="alert-action-btn"
                  onClick={handleCredentialsSubmit}
                >
                  Try again
                </button>
              )}

              {/* Action for unverified account */}
              {authError.type === 'UNVERIFIED' && (
                <button
                  type="button"
                  className="alert-action-btn"
                  onClick={handleResendVerification}
                >
                  Resend verification link
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resend status confirmation */}
        {resendStatus && (
          <div className="auth-alert-banner success" role="status">
            <CheckCircle2 size={16} color="var(--color-healthy)" aria-hidden="true" />
            <p className="alert-message">{resendStatus}</p>
          </div>
        )}

        {/* Main Authentication Form */}
        <form
          onSubmit={handleCredentialsSubmit}
          className="login-form card"
          noValidate
          aria-labelledby="login-title"
        >
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className={`form-input ${emailError ? 'has-error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) setAuthError(null);
              }}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              inputMode="email"
              spellCheck="false"
              autoCapitalize="none"
              aria-required="true"
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              disabled={isSubmitting || isGoogleSubmitting}
            />
            {emailError && (
              <p className="field-error-msg" id="login-email-error" role="alert">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input password-input ${passwordError ? 'has-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError(null);
                }}
                onBlur={() => handleBlur('password')}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={passwordError ? 'true' : 'false'}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
                disabled={isSubmitting || isGoogleSubmitting}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                tabIndex={0}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && (
              <p className="field-error-msg" id="login-password-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password-row">
            <button
              type="button"
              className="btn-forgot-password"
              onClick={() => navigateTo('forgot-password')}
              aria-label="Forgot password? Request password reset"
              disabled={isSubmitting || isGoogleSubmitting}
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Action Button: Sign in */}
          <button
            type="submit"
            className="btn-primary-signin"
            disabled={isButtonDisabled}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading-content">
                <RefreshCw size={17} className="btn-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </span>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Divider: ──────── or ──────── */}
        <div className="auth-divider" aria-hidden="true">
          <span className="divider-line" />
          <span className="divider-text">or</span>
          <span className="divider-line" />
        </div>

        {/* Google Authentication (Secondary Option) */}
        <button
          type="button"
          className="btn-google-signin"
          onClick={handleGoogleSubmit}
          disabled={isSubmitting || isGoogleSubmitting}
          aria-label="Continue with Google"
        >
          {isGoogleSubmitting ? (
            <span className="btn-loading-content">
              <RefreshCw size={17} className="btn-spinner" aria-hidden="true" />
              <span>Connecting...</span>
            </span>
          ) : (
            <>
              {/* Official 4-color Google G mark */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
                className="google-icon"
                aria-hidden="true"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Register Navigation: Don't have an account? Create an account */}
        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <button
              type="button"
              className="btn-create-account"
              onClick={() => navigateTo('register')}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              Create an account
            </button>
          </p>
        </div>
      </main>

      <style>{`
        .login-screen {
          width: 100%;
          height: 100%;
          min-height: 100%;
          background-color: var(--color-warm-cream);
          display: flex;
          flex-direction: column;
          padding-top: calc(var(--safe-top) + 8px);
          padding-bottom: calc(var(--safe-bottom) + 20px);
          padding-left: var(--mobile-pad);
          padding-right: var(--mobile-pad);
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* Top Bar */
        .login-top-bar {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 8px;
          flex-shrink: 0;
        }

        .login-back-btn {
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
          transition: color 0.15s ease, opacity 0.15s ease;
          min-height: 40px;
        }

        .login-back-btn:hover {
          color: var(--color-deep-cocoa);
        }

        .login-back-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Centered form container */
        .login-container {
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          justify-content: center;
        }

        /* Subtle Brand Header */
        .login-brand-header {
          text-align: left;
          margin-bottom: 2px;
        }

        .login-brandmark-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .login-heading {
          font-family: var(--font-family);
          font-size: 27px;
          font-weight: 700;
          line-height: 1.25;
          color: var(--color-deep-cocoa);
          letter-spacing: -0.015em;
          margin: 0 0 6px 0;
        }

        .login-subtitle {
          font-family: var(--font-family);
          font-size: 14.5px;
          line-height: 1.5;
          color: var(--color-warm-gray);
          margin: 0;
        }

        /* Alert Banners */
        .auth-alert-banner {
          background-color: #FDF4F3;
          border: 1px solid rgba(184, 84, 80, 0.25);
          border-radius: var(--radius-button);
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: var(--color-critical);
          box-sizing: border-box;
          animation: alertSlideDown 0.2s ease-out;
        }

        .auth-alert-banner.offline {
          background-color: #FFF6EC;
          border-color: rgba(217, 130, 43, 0.3);
          color: var(--color-deep-cocoa);
        }

        .auth-alert-banner.success {
          background-color: #F3F7F3;
          border-color: rgba(79, 122, 82, 0.25);
          color: var(--color-healthy);
          align-items: center;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .alert-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .alert-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .alert-message {
          font-size: 13px;
          line-height: 1.45;
          margin: 0;
        }

        .alert-action-btn {
          align-self: flex-start;
          margin-top: 4px;
          background: none;
          border: none;
          color: var(--color-primary-honey);
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
        }

        .alert-action-btn:hover {
          color: var(--color-deep-honey);
        }

        /* Form Card */
        .login-form {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-card);
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--shadow-card);
          box-sizing: border-box;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-family: var(--font-family);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
          letter-spacing: -0.005em;
        }

        .form-input {
          width: 100%;
          height: 48px;
          font-family: var(--font-family);
          font-size: 15px;
          padding: 10px 14px;
          border-radius: var(--radius-button);
          border: 1px solid var(--color-card-border);
          background-color: #FFFFFF;
          color: var(--color-deep-cocoa);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-input::placeholder {
          color: #A3978A;
        }

        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover, 
        .form-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
          -webkit-text-fill-color: var(--color-deep-cocoa) !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .form-input:focus {
          border-color: var(--color-primary-honey);
          box-shadow: 0 0 0 3px rgba(217, 154, 36, 0.18);
        }

        .form-input.has-error {
          border-color: var(--color-critical);
          background-color: #FFFDFD;
        }

        .form-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(184, 84, 80, 0.15);
        }

        .password-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .password-input {
          padding-right: 64px;
        }

        .btn-toggle-password {
          position: absolute;
          right: 8px;
          height: 34px;
          padding: 0 10px;
          background: none;
          border: none;
          color: var(--color-warm-gray);
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .btn-toggle-password:hover {
          color: var(--color-deep-cocoa);
          background-color: rgba(52, 38, 27, 0.05);
        }

        .field-error-msg {
          font-family: var(--font-family);
          font-size: 12.5px;
          color: var(--color-critical);
          margin: 0;
          line-height: 1.35;
        }

        /* Forgot password link */
        .forgot-password-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -2px;
          margin-bottom: 2px;
        }

        .btn-forgot-password {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-warm-gray);
          cursor: pointer;
          padding: 4px 2px;
          transition: color 0.15s ease;
        }

        .btn-forgot-password:hover {
          color: var(--color-deep-honey);
        }

        /* Primary Sign In Button */
        .btn-primary-signin {
          width: 100%;
          height: 54px;
          background-color: var(--color-primary-honey);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-button);
          font-family: var(--font-family);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 8px rgba(184, 115, 22, 0.22);
          margin-top: 4px;
          box-sizing: border-box;
        }

        .btn-primary-signin:hover:not(:disabled) {
          background-color: var(--color-deep-honey);
          box-shadow: 0 4px 12px rgba(184, 115, 22, 0.3);
        }

        .btn-primary-signin:active:not(:disabled) {
          transform: scale(0.985);
        }

        .btn-primary-signin:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading-content {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-spinner {
          animation: spin 1s linear infinite;
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 12px;
          margin: 4px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background-color: var(--color-divider);
        }

        .divider-text {
          font-family: var(--font-family);
          font-size: 13px;
          color: var(--color-warm-gray);
          text-transform: lowercase;
        }

        /* Google Sign In (Secondary Action) */
        .btn-google-signin {
          width: 100%;
          height: 52px;
          background-color: #FFFFFF;
          color: var(--color-deep-cocoa);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
          font-family: var(--font-family);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }

        .btn-google-signin:hover:not(:disabled) {
          background-color: #FAF6EE;
          border-color: #D6C7B2;
        }

        .btn-google-signin:active:not(:disabled) {
          transform: scale(0.985);
        }

        .btn-google-signin:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          flex-shrink: 0;
        }

        /* Register Footer */
        .login-footer {
          margin-top: 6px;
          text-align: center;
        }

        .login-footer-text {
          font-family: var(--font-family);
          font-size: 14px;
          color: var(--color-warm-gray);
          margin: 0;
        }

        .btn-create-account {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary-honey);
          cursor: pointer;
          padding: 0;
          transition: color 0.15s ease;
          text-decoration: underline;
        }

        .btn-create-account:hover {
          color: var(--color-deep-honey);
        }

        @keyframes alertSlideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        /* Small screen adjustments */
        @media (max-height: 680px) {
          .login-container {
            gap: 10px;
          }

          .login-heading {
            font-size: 24px;
          }

          .login-form {
            padding: 16px 14px;
            gap: 10px;
          }

          .btn-primary-signin {
            height: 48px;
            font-size: 15px;
          }

          .btn-google-signin {
            height: 46px;
            font-size: 14px;
          }
        }

        /* Accessibility reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .auth-alert-banner {
            animation: none !important;
          }
          .btn-spinner {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
