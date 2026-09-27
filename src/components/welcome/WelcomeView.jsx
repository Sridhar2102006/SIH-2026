import React from 'react';
import { useAppState } from '../../context/AppStateContext';

export const WelcomeView = () => {
  const { navigateTo } = useAppState();

  return (
    <div className="welcome-screen" role="region" aria-label="HoneyChain Welcome Screen">
      {/* Top Safe Area & Breathing Room */}
      <div className="welcome-top-spacer" aria-hidden="true" />

      <main className="welcome-container">
        {/* Hero Visual: Refined editorial illustration (35-40% height) */}
        <div
          className="welcome-hero-wrap"
          role="img"
          aria-label="Editorial illustration of a handcrafted glass honey jar, wild sage meadow flora, subtle honeycomb geometry, and warm morning sunlight"
        >
          <svg
            className="welcome-hero-svg"
            viewBox="0 0 340 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <title>Know your hives, follow your honey</title>
            <desc>
              A serene natural beekeeping artwork featuring botanical sage foliage, a jar of pure honey,
              gentle honeycomb facets, and warm sunlight.
            </desc>

            {/* 1. Warm Sunlight Auras */}
            <circle cx="170" cy="118" r="94" fill="#FAF0DE" />
            <circle cx="170" cy="118" r="66" fill="#F6E6CC" opacity="0.85" />

            {/* 2. Ground / Hive resting plane */}
            <line x1="48" y1="202" x2="292" y2="202" stroke="#EDE2D1" strokeWidth="2" strokeLinecap="round" />
            {/* Subtle wooden hive silhouette lines */}
            <rect x="64" y="174" width="76" height="28" rx="4" fill="#F7EFE2" stroke="#E5D6C0" strokeWidth="1.5" />
            <line x1="72" y1="188" x2="132" y2="188" stroke="#E5D6C0" strokeWidth="1" strokeLinecap="round" />
            <line x1="94" y1="195" x2="110" y2="195" stroke="#D3BEA2" strokeWidth="2.5" strokeLinecap="round" />

            {/* 3. Subtle Honeycomb Geometry (Right background) */}
            <g opacity="0.65">
              <path
                d="M236 44 L254 54 V74 L236 84 L218 74 V54 Z"
                stroke="#E2D1B8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M254 54 L272 64 V84 L254 94 L236 84 V64 Z"
                stroke="#D99A24"
                strokeWidth="1.75"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M236 84 L254 94 V114 L236 124 L218 114 V94 Z"
                stroke="#E2D1B8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M272 64 L290 74 V94 L272 104 L254 94 V74 Z"
                stroke="#E2D1B8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
              />
            </g>

            {/* 4. Natural Botanical Sage & Meadow Foliage */}
            <g>
              {/* Primary Sage Stem */}
              <path
                d="M102 202 C108 162 118 132 140 102"
                stroke="#71845B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Sage Leaves with organic curved contours */}
              <path
                d="M112 168 C96 162 94 144 110 148 C120 151 118 164 112 168 Z"
                fill="#71845B"
              />
              <path
                d="M125 142 C110 132 114 114 128 122 C138 128 132 138 125 142 Z"
                fill="#82966B"
              />
              <path
                d="M139 104 C134 88 148 84 150 98 C152 108 144 112 139 104 Z"
                fill="#71845B"
              />
              {/* Secondary delicate floral sprig on right */}
              <path
                d="M216 202 C222 176 238 154 248 136"
                stroke="#8B9E76"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M228 170 C240 164 244 150 234 154 C224 158 226 166 228 170 Z"
                fill="#82966B"
              />
              <path
                d="M246 138 C256 128 252 116 244 122 C238 128 240 134 246 138 Z"
                fill="#71845B"
              />
            </g>

            {/* 5. Handcrafted Artisanal Honey Jar */}
            <g>
              {/* Jar Glass Outer Silhouette */}
              <path
                d="M146 136 C146 128 152 122 160 122 H184 C192 122 198 128 198 136 V188 C198 194 193 199 187 199 H157 C151 199 146 194 146 188 Z"
                fill="#FFFDF8"
                stroke="#D6C5AD"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* Luminous Golden Honey Content */}
              <path
                d="M148 146 C156 143 188 143 196 146 V187 C196 192 192 196 187 196 H157 C152 196 148 192 148 187 Z"
                fill="#E8A62F"
              />
              <path
                d="M148 160 C160 156 184 156 196 160 V187 C196 192 192 196 187 196 H157 C152 196 148 192 148 187 Z"
                fill="#D99A24"
                opacity="0.8"
              />

              {/* Wooden / Cork Jar Lid */}
              <path
                d="M154 122 C154 117 157 113 162 113 H182 C187 113 190 117 190 122 Z"
                fill="#B87316"
              />
              <rect x="151" y="120" width="42" height="4" rx="2" fill="#9C6010" />

              {/* Artisanal Paper Label on Jar */}
              <rect x="156" y="152" width="32" height="24" rx="3" fill="#FFFDF8" stroke="#EDE2D1" strokeWidth="1" />
              <line x1="162" y1="162" x2="182" y2="162" stroke="#D99A24" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="166" y1="168" x2="178" y2="168" stroke="#B87316" strokeWidth="1" strokeLinecap="round" />

              {/* Glass Reflection Highlight */}
              <path
                d="M150 138 C150 132 153 128 158 128"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>

            {/* 6. Luminous Suspended Honey Drop */}
            <g>
              <path
                d="M172 82 C172 82 180 93 180 98 C180 103 176.4 107 172 107 C167.6 107 164 103 164 98 C164 93 172 82 172 82 Z"
                fill="#D99A24"
              />
              <path
                d="M172 85 C172 85 178 94 178 98 C178 101.5 175.5 104.5 172 104.5 C168.5 104.5 166 101.5 166 98 C166 94 172 85 172 85 Z"
                fill="#B87316"
                opacity="0.3"
              />
              {/* Highlight gleam */}
              <circle cx="169.5" cy="96.5" r="1.5" fill="#FFFDF8" />
            </g>
          </svg>
        </div>

        {/* Narrative & Value Proposition */}
        <div className="welcome-text-block">
          {/* Primary Heading (28-32px, friendly & strong, not all-caps) */}
          <h1 className="welcome-heading" id="welcome-title">
            Know your hives.<br />
            Follow your honey.
          </h1>

          {/* Supporting Text (short, calm, no large feature list) */}
          <p className="welcome-supporting">
            Monitor your hives, record inspections, and follow every batch from collection to bottle.
          </p>
        </div>

        {/* Actions Section */}
        <div className="welcome-actions">
          {/* Primary Action Button */}
          <button
            type="button"
            className="btn-welcome-primary"
            onClick={() => navigateTo('register')}
            aria-label="Get started with HoneyChain account creation"
          >
            Get started
          </button>

          {/* Secondary Action Link / Button */}
          <button
            type="button"
            className="btn-welcome-secondary"
            onClick={() => navigateTo('login')}
            aria-label="I already have an account, sign in"
          >
            I already have an account
          </button>

        </div>
      </main>

      {/* Bottom Safe Area & Breathing Room */}
      <div className="welcome-bottom-spacer" aria-hidden="true" />

      <style>{`
        .welcome-screen {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 100%;
          background-color: var(--color-warm-cream);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding-top: calc(var(--safe-top) + 12px);
          padding-bottom: calc(var(--safe-bottom) + 20px);
          padding-left: var(--mobile-pad);
          padding-right: var(--mobile-pad);
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          user-select: none;
        }

        .welcome-top-spacer,
        .welcome-bottom-spacer {
          width: 100%;
          height: 8px;
          flex-shrink: 0;
        }

        .welcome-container {
          max-width: 380px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin: auto 0;
          gap: 0;
        }

        /* 1. Hero Visual (approx. 35-40% usable screen height) */
        .welcome-hero-wrap {
          width: 100%;
          max-width: 330px;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          opacity: 0;
          transform: translateY(8px);
          animation: welcomeFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards;
        }

        .welcome-hero-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* 2. Typography Block */
        .welcome-text-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-heading {
          font-family: var(--font-family);
          font-size: 30px;
          line-height: 1.25;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          letter-spacing: -0.02em;
          margin-top: 8px;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(8px);
          animation: welcomeFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.22s forwards;
        }

        .welcome-supporting {
          font-family: var(--font-family);
          font-size: 15px;
          line-height: 1.55;
          font-weight: 400;
          color: var(--color-warm-gray);
          max-width: 320px;
          margin: 0 auto 28px;
          opacity: 0;
          transform: translateY(6px);
          animation: welcomeFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.36s forwards;
        }

        /* 3. Actions Section */
        .welcome-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transform: translateY(6px);
          animation: welcomeFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }

        /* Primary Action: Get started (Honey Gold #D99A24, 52-56px height, 10-12px radius) */
        .btn-welcome-primary {
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
          box-sizing: border-box;
        }

        .btn-welcome-primary:hover {
          background-color: var(--color-deep-honey);
          box-shadow: 0 4px 12px rgba(184, 115, 22, 0.3);
        }

        .btn-welcome-primary:active {
          transform: scale(0.985);
        }

        /* Secondary Action: I already have an account (Deep Cocoa #34261B, calm, comfortable target) */
        .btn-welcome-secondary {
          width: 100%;
          height: 48px;
          background: transparent;
          border: none;
          color: var(--color-deep-cocoa);
          font-family: var(--font-family);
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: 0.005em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, opacity 0.15s ease;
          padding: 8px;
          box-sizing: border-box;
        }

        .btn-welcome-secondary:hover {
          color: var(--color-deep-honey);
        }

        .btn-welcome-secondary:active {
          opacity: 0.75;
        }

        /* Entrance Keyframes */
        @keyframes welcomeFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Small device adaptations (e.g. height <= 680px) */
        @media (max-height: 680px) {
          .welcome-hero-wrap {
            height: 180px;
            max-width: 260px;
            margin-bottom: 6px;
          }

          .welcome-heading {
            font-size: 26px;
            margin-top: 4px;
            margin-bottom: 6px;
          }

          .welcome-supporting {
            font-size: 14px;
            margin-bottom: 20px;
          }

          .btn-welcome-primary {
            height: 50px;
            font-size: 15.5px;
          }

          .btn-welcome-secondary {
            height: 44px;
            font-size: 14px;
          }
        }

        /* Respect accessibility reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .welcome-hero-wrap,
          .welcome-heading,
          .welcome-supporting,
          .welcome-actions {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
