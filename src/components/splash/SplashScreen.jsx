import React, { useEffect, useState } from 'react';
import { performStartupInitialization } from '../../services/startupRouter';

export const SplashScreen = ({ session, onReady, minDisplayDuration = 1900 }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    performStartupInitialization(session, minDisplayDuration).then((destination) => {
      if (!isMounted) return;

      // Initiate gentle fade-out transition
      setIsFadingOut(true);

      // Allow 400ms CSS fade-out before unmounting/routing
      setTimeout(() => {
        if (isMounted && onReady) {
          onReady(destination);
        }
      }, 420);
    });

    return () => {
      isMounted = false;
    };
  }, [session, onReady, minDisplayDuration]);

  return (
    <div
      className={`splash-container ${isFadingOut ? 'fading-out' : ''}`}
      role="region"
      aria-label="Application loading"
    >
      <div className="splash-safe-top" />

      <main className="splash-content">
        {/* Brandmark: Hexagonal honeycomb cell enclosing a pure honey drop */}
        <div
          className="splash-brandmark-wrap"
          role="img"
          aria-label="HoneyChain Brandmark: Subtle hexagonal honeycomb cell framing a natural honey drop"
        >
          <svg
            className="splash-brandmark"
            width="72"
            height="72"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <title>HoneyChain Logo</title>
            <desc>A handcrafted geometric honeycomb cell enclosing a balanced honey drop</desc>
            {/* Hexagonal honeycomb geometry */}
            <path
              d="M32 5.5L54 18.2V43.8L32 56.5L10 43.8V18.2L32 5.5Z"
              stroke="var(--color-primary-honey)"
              strokeWidth="2.75"
              strokeLinejoin="round"
            />
            {/* Organic honey drop */}
            <path
              d="M32 17C32 17 43 31.5 43 38C43 44.075 38.075 49 32 49C25.925 49 21 44.075 21 38C21 31.5 32 17 32 17Z"
              fill="var(--color-primary-honey)"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="splash-title">HoneyChain</h1>

        {/* Tagline */}
        <p className="splash-tagline">From hive to honey.</p>
      </main>

      <div className="splash-safe-bottom" />

      <style>{`
        .splash-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: var(--color-warm-cream);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding-top: calc(var(--safe-top) + 24px);
          padding-bottom: calc(var(--safe-bottom) + 24px);
          padding-left: var(--mobile-pad);
          padding-right: var(--mobile-pad);
          z-index: 99999;
          transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          box-sizing: border-box;
          overflow: hidden;
        }

        .splash-container.fading-out {
          opacity: 0;
          visibility: hidden;
        }

        .splash-safe-top,
        .splash-safe-bottom {
          width: 100%;
          height: 1px;
          flex-shrink: 0;
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 320px;
          width: 100%;
        }

        /* 1. Subtle Logo Fade In */
        .splash-brandmark-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin-bottom: 2px;
          opacity: 0;
          transform: translateY(6px);
          animation: splashFadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards;
        }

        .splash-brandmark {
          display: block;
        }

        /* 2. Brand Name Appears Shortly Afterward */
        .splash-title {
          font-family: var(--font-family);
          font-size: 30px;
          line-height: 1.25;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          letter-spacing: -0.02em;
          margin-top: 14px;
          margin-bottom: 0;
          opacity: 0;
          transform: translateY(6px);
          animation: splashFadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.32s forwards;
        }

        /* 3. Tagline Appears Subtly */
        .splash-tagline {
          font-family: var(--font-family);
          font-size: 15px;
          line-height: 1.5;
          font-weight: 400;
          color: var(--color-warm-gray);
          letter-spacing: 0.015em;
          margin-top: 8px;
          margin-bottom: 0;
          opacity: 0;
          transform: translateY(4px);
          animation: splashFadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.52s forwards;
        }

        @keyframes splashFadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Accessibility: respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .splash-brandmark-wrap,
          .splash-title,
          .splash-tagline {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .splash-container {
            transition: opacity 0.2s ease, visibility 0.2s ease;
          }
        }
      `}</style>
    </div>
  );
};
