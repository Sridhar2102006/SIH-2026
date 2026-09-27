import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getOtpConfiguration,
  verifyEmailOtp,
  resendVerificationOtp,
  maskEmail
} from '../../services/authService';

export const EmailVerificationView = () => {
  const {
    session,
    navigateTo,
    handleVerificationSuccess,
    isOnline
  } = useAppState();

  const otpConfig = getOtpConfiguration();
  const otpLength = otpConfig?.length || 6;

  // Retrieve actual account email from registration state or session (never invented)
  const accountEmail = session?.pendingEmail || session?.email || '';
  const [isMasked, setIsMasked] = useState(false);

  // OTP Digits State
  const [digits, setDigits] = useState(Array(otpLength).fill(''));
  const inputRefs = useRef([]);

  // Resend Timer State
  const [countdown, setCountdown] = useState(otpConfig?.resendCooldownSeconds || 30);
  const [canResend, setCanResend] = useState(false);
  const [resendNotification, setResendNotification] = useState(null);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorType, setErrorType] = useState(null);

  // Accessibility Announcement
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Auto-submit guard to prevent repeated/duplicate verification requests
  const hasAutoSubmittedRef = useRef(false);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const otpString = digits.join('');
  const isOtpComplete = otpString.length === otpLength;

  // Reset auto-submit guard when digits change or are incomplete
  useEffect(() => {
    if (!isOtpComplete) {
      hasAutoSubmittedRef.current = false;
    }
  }, [isOtpComplete]);

  // Handle single digit input
  const handleChange = (index, value) => {
    hasAutoSubmittedRef.current = false;

    // Only accept numeric input
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Take the last character if multiple entered
    const singleDigit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    if (errorMessage) {
      setErrorMessage(null);
      setErrorType(null);
    }

    // Auto-advance to next input cell
    if (index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
      setLiveAnnouncement(`Digit ${index + 2} of ${otpLength}`);
    }
  };

  // Handle KeyDown (Backspace & Arrows)
  const handleKeyDown = (index, e) => {
    hasAutoSubmittedRef.current = false;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back to previous input and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setLiveAnnouncement(`Digit ${index} of ${otpLength}`);
      } else {
        // Clear current cell
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setLiveAnnouncement(`Digit ${index} of ${otpLength}`);
    } else if (e.key === 'ArrowRight' && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
      setLiveAnnouncement(`Digit ${index + 2} of ${otpLength}`);
    }
  };

  // Handle Paste: Distribute digits across inputs starting from cell 0
  const handlePaste = (e) => {
    e.preventDefault();
    hasAutoSubmittedRef.current = false;

    const pasteData = e.clipboardData?.getData('text') || '';
    const cleaned = pasteData.replace(/\D/g, '').slice(0, otpLength);
    if (!cleaned) return;

    const newDigits = Array(otpLength).fill('');
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);

    if (errorMessage) {
      setErrorMessage(null);
      setErrorType(null);
    }

    // Focus last filled index or next available
    const targetIndex = Math.min(cleaned.length - 1, otpLength - 1);
    if (targetIndex >= 0 && inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
    }
    setLiveAnnouncement(`Pasted ${cleaned.length} digits. Total entered: ${cleaned.length} of ${otpLength}`);
  };

  // Focus tracking for accessibility
  const handleFocus = (index) => {
    setLiveAnnouncement(`Digit ${index + 1} of ${otpLength}${digits[index] ? `, current value ${digits[index]}` : ', empty'}`);
  };

  // Submit OTP Verification
  const executeVerification = async (codeToVerify) => {
    if (isSubmitting || isSuccess) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorType(null);

    try {
      const result = await verifyEmailOtp({
        email: accountEmail,
        otp: codeToVerify,
        isOnline
      });

      if (result.success) {
        setIsSuccess(true);
        // Dismiss keyboard focus
        inputRefs.current.forEach((ref) => ref?.blur());
        // Calm automatic transition to Onboarding (or Home if setup already complete)
        setTimeout(() => {
          handleVerificationSuccess(result.session);
        }, 1100);
      } else {
        setErrorType(result.errorType);
        setErrorMessage(result.message);
        // Focus first cell or cell with issue
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      setErrorType('UNEXPECTED');
      setErrorMessage("Couldn't verify the code. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Primary submit handler (e.g. button click or form submit)
  const handleVerify = (e) => {
    if (e) e.preventDefault();
    if (!isOtpComplete || isSubmitting || isSuccess) return;
    executeVerification(otpString);
  };

  // Automatic verification when all digits are entered
  useEffect(() => {
    if (isOtpComplete && !isSubmitting && !isSuccess && !hasAutoSubmittedRef.current && !errorMessage) {
      hasAutoSubmittedRef.current = true;
      const timer = setTimeout(() => {
        executeVerification(otpString);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOtpComplete, otpString, errorMessage, isSubmitting, isSuccess]);

  // Resend OTP Code
  const handleResend = async () => {
    if (!canResend || isSubmitting) return;

    setResendNotification(null);
    setErrorMessage(null);
    setErrorType(null);
    hasAutoSubmittedRef.current = false;

    try {
      const result = await resendVerificationOtp({
        email: accountEmail,
        isOnline
      });

      if (result.success) {
        setCountdown(result.cooldownSeconds || 30);
        setResendNotification(result.message || 'New code sent.');
        // Reset input fields
        setDigits(Array(otpLength).fill(''));
        inputRefs.current[0]?.focus();

        setTimeout(() => {
          setResendNotification(null);
        }, 4000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Couldn't send a new code. Check your connection and try again.");
    }
  };

  return (
    <div className="verify-screen" role="region" aria-label="Email Verification">
      {/* Accessible live status for screen reader position announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Top Bar: Back navigation */}
      <div className="verify-top-bar">
        <button
          type="button"
          className="verify-back-btn"
          onClick={() => navigateTo('register')}
          aria-label="Back to registration"
          disabled={isSubmitting || isSuccess}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>

      <main className="verify-container">
        {/* Verification Illustration: Small envelope + suspended honey drop */}
        <div
          className="verify-visual-wrap"
          role="img"
          aria-label="Illustration of a verification envelope with a honey drop seal"
        >
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
            {/* Soft Warm Sun Aura */}
            <circle cx="34" cy="34" r="30" fill="#FAF0DE" />
            <circle cx="34" cy="34" r="22" fill="#F6E6CC" opacity="0.8" />

            {/* Subtle Envelope Body */}
            <rect
              x="16"
              y="23"
              width="36"
              height="25"
              rx="4"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.75"
            />
            {/* Envelope Flap Lines */}
            <path
              d="M17 25L34 38L51 25"
              stroke="#EDE2D1"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Small Luminous Honey Drop Seal */}
            <path
              d="M34 16C34 16 38.5 22.5 38.5 25.5C38.5 28 36.5 30 34 30C31.5 30 29.5 28 29.5 25.5C29.5 22.5 34 16 34 16Z"
              fill="#D99A24"
            />
            {/* Subtle Reflection */}
            <circle cx="33" cy="24.5" r="1" fill="#FFFDF8" />
          </svg>
        </div>

        {/* Narrative Block */}
        <div className="verify-header-block">
          <h1 className="verify-heading" id="verify-title">
            Verify your email
          </h1>
          <p className="verify-supporting">
            We sent a verification code to
          </p>
          {accountEmail ? (
            <div className="verify-email-badge">
              <span className="verify-email-text">
                {isMasked ? maskEmail(accountEmail) : accountEmail}
              </span>
              <button
                type="button"
                className="btn-mask-toggle"
                onClick={() => setIsMasked(!isMasked)}
                aria-label={isMasked ? "Reveal full email address" : "Mask email address for privacy"}
              >
                {isMasked ? "Show" : "Hide"}
              </button>
            </div>
          ) : (
            <div className="verify-email-badge">
              <span className="verify-email-text">your email address</span>
            </div>
          )}
        </div>

        {/* Alert Error Banner */}
        {errorMessage && (
          <div
            className={`verify-alert ${errorType === 'OFFLINE' ? 'offline' : ''}`}
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={18} className="alert-icon" aria-hidden="true" />
            <div className="alert-content">
              <p className="alert-text">{errorMessage}</p>
              {errorType === 'OFFLINE' && (
                <button
                  type="button"
                  className="alert-retry-btn"
                  onClick={handleVerify}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="verify-success-banner" role="status" aria-live="assertive">
            <CheckCircle2 size={20} className="success-icon" aria-hidden="true" />
            <div>
              <strong className="success-title">Email verified</strong>
              <p className="success-sub">Your account is ready.</p>
            </div>
          </div>
        )}

        {/* Resend Confirmation */}
        {resendNotification && !errorMessage && (
          <div className="verify-resend-pill" role="status">
            <CheckCircle2 size={15} color="#4F7A52" aria-hidden="true" />
            <span>{resendNotification}</span>
          </div>
        )}

        {/* OTP Input Card */}
        <form onSubmit={handleVerify} className="otp-card card" noValidate>
          <div
            className="otp-inputs-row"
            role="group"
            aria-label={`${otpLength}-digit verification code`}
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => handleFocus(index)}
                className={`otp-digit-input ${errorMessage ? 'has-error' : ''} ${digit ? 'filled' : ''}`}
                aria-label={`Digit ${index + 1} of ${otpLength}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                disabled={isSubmitting || isSuccess}
              />
            ))}
          </div>

          {/* Resend Code Row */}
          <div className="resend-row">
            <span className="resend-label">Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                className="btn-resend-active"
                onClick={handleResend}
                disabled={isSubmitting || isSuccess}
              >
                Resend code
              </button>
            ) : (
              <span className="resend-countdown" aria-live="polite">
                Resend code in {countdown}s
              </span>
            )}
          </div>

          {/* Primary Action Button: Verify email */}
          <button
            type="submit"
            className="btn-verify-primary"
            disabled={!isOtpComplete || isSubmitting || isSuccess}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading-flex">
                <RefreshCw size={17} className="spin-icon" aria-hidden="true" />
                <span>Verifying...</span>
              </span>
            ) : isSuccess ? (
              <span>Verified ✓</span>
            ) : (
              <span>Verify email</span>
            )}
          </button>
        </form>

        {/* Change Email Option: Use a different email */}
        <div className="change-email-row">
          <button
            type="button"
            className="btn-change-email"
            onClick={() => navigateTo('register')}
            disabled={isSubmitting || isSuccess}
          >
            Use a different email
          </button>
        </div>
      </main>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .verify-screen {
          width: 100%;
          height: 100%;
          min-height: 100%;
          background-color: #FFF9EF;
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

        .verify-top-bar {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 6px;
          flex-shrink: 0;
        }

        .verify-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          color: #786D61;
          cursor: pointer;
          padding: 8px 4px;
          border-radius: 8px;
          transition: color 0.15s ease;
          min-height: 40px;
        }

        .verify-back-btn:hover {
          color: #34261B;
        }

        .verify-back-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verify-container {
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          justify-content: center;
          text-align: center;
        }

        /* Subtle Verification Artwork */
        .verify-visual-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: -4px;
        }

        /* Header Narrative */
        .verify-header-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .verify-heading {
          font-family: var(--font-family);
          font-size: 26px;
          font-weight: 700;
          line-height: 1.25;
          color: #34261B;
          letter-spacing: -0.015em;
          margin: 0;
        }

        .verify-supporting {
          font-family: var(--font-family);
          font-size: 14.5px;
          line-height: 1.5;
          color: #786D61;
          margin: 0;
        }

        .verify-email-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #FAF2E4;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(217, 154, 36, 0.25);
          margin-top: 4px;
        }

        .verify-email-text {
          font-family: var(--font-family);
          font-size: 13.5px;
          font-weight: 600;
          color: #34261B;
          word-break: break-all;
        }

        .btn-mask-toggle {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 11.5px;
          font-weight: 600;
          color: #B87316;
          cursor: pointer;
          padding: 0 2px;
          text-decoration: underline;
        }

        /* Alert Banners */
        .verify-alert {
          background-color: #FDF4F3;
          border: 1px solid rgba(184, 84, 80, 0.25);
          border-radius: var(--radius-button);
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #B85450;
          text-align: left;
          animation: alertSlideDown 0.2s ease-out;
        }

        .verify-alert.offline {
          background-color: #FFF6EC;
          border-color: rgba(217, 130, 43, 0.3);
          color: #34261B;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .alert-text {
          font-size: 13px;
          line-height: 1.45;
          margin: 0;
        }

        .alert-retry-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: #D99A24;
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
        }

        /* Success Banner */
        .verify-success-banner {
          background-color: #F0F6F1;
          border: 1px solid rgba(79, 122, 82, 0.3);
          border-radius: var(--radius-button);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #4F7A52;
          text-align: left;
          animation: alertSlideDown 0.25s ease-out;
        }

        .success-icon {
          flex-shrink: 0;
        }

        .success-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #4F7A52;
          display: block;
        }

        .success-sub {
          font-size: 13px;
          color: #786D61;
          margin: 2px 0 0 0;
        }

        /* Resend pill */
        .verify-resend-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background-color: #F3F8F3;
          border: 1px solid rgba(79, 122, 82, 0.25);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12.5px;
          color: #4F7A52;
          font-weight: 500;
          margin: -4px auto;
        }

        /* Card container */
        .otp-card {
          background-color: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: var(--radius-card);
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: var(--shadow-card);
          box-sizing: border-box;
        }

        /* 6-digit input row */
        .otp-inputs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        .otp-digit-input {
          width: 46px;
          height: 54px;
          font-family: var(--font-family);
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          border-radius: 11px;
          border: 1.5px solid #EDE2D1;
          background-color: #FFFFFF;
          color: #34261B;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
          padding: 0;
        }

        .otp-digit-input:focus {
          border-color: #D99A24;
          box-shadow: 0 0 0 3px rgba(217, 154, 36, 0.18);
          transform: translateY(-1px);
        }

        .otp-digit-input.filled {
          background-color: #FFFDF8;
          border-color: #EDE2D1;
        }

        .otp-digit-input.has-error {
          border-color: #B85450;
          background-color: #FFFDFD;
        }

        .otp-digit-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(184, 84, 80, 0.15);
        }

        /* Resend row */
        .resend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13.5px;
          flex-wrap: wrap;
        }

        .resend-label {
          color: #786D61;
        }

        .btn-resend-active {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 13.5px;
          font-weight: 600;
          color: #D99A24;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          transition: color 0.15s ease;
        }

        .btn-resend-active:hover {
          color: #B87316;
        }

        .resend-countdown {
          color: #786D61;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        /* Primary Verify Button */
        .btn-verify-primary {
          width: 100%;
          height: 54px;
          background-color: #D99A24;
          color: #FFFFFF;
          border: none;
          border-radius: 11px;
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
          box-sizing: border-box;
        }

        .btn-verify-primary:hover:not(:disabled) {
          background-color: #B87316;
          box-shadow: 0 4px 12px rgba(184, 115, 22, 0.3);
        }

        .btn-verify-primary:active:not(:disabled) {
          transform: scale(0.985);
        }

        .btn-verify-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading-flex {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        /* Change email option */
        .change-email-row {
          margin-top: 4px;
        }

        .btn-change-email {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 14px;
          font-weight: 600;
          color: #34261B;
          cursor: pointer;
          padding: 8px;
          transition: color 0.15s ease;
          opacity: 0.85;
        }

        .btn-change-email:hover {
          color: #D99A24;
          opacity: 1;
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

        /* Small device adaptations */
        @media (max-width: 360px) {
          .otp-digit-input {
            width: 40px;
            height: 48px;
            font-size: 19px;
          }
        }

        @media (max-height: 680px) {
          .verify-container {
            gap: 12px;
          }

          .verify-heading {
            font-size: 23px;
          }

          .otp-card {
            padding: 16px 14px;
            gap: 14px;
          }

          .btn-verify-primary {
            height: 48px;
            font-size: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .verify-alert,
          .verify-success-banner {
            animation: none !important;
          }
          .spin-icon {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
