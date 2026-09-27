/**
 * HoneyChain Workspace Visual Identity Service
 *
 * Provides 20 curated, deterministic workspace visual themes based on
 * capability signatures, ensuring every capability combination receives
 * an elegant, recognizable, and stable visual identity.
 *
 * Pure presentation layer: NEVER communicates authorization by color alone.
 */

import themePalettes from '../data/matrices/theme_palettes.js';

export const THEME_PALETTES = themePalettes;

/**
 * Deterministic 32-bit FNV-1a style hash for strings
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Resolves a deterministic visual profile based on active capabilities and primary designation.
 *
 * @param {Array<string>} capabilities - List of active capability IDs
 * @param {string} primaryDesignation - Optional primary designation (BEEKEEPER, PROCESSOR, etc.)
 * @returns {Object} Full visual profile configuration
 */
export function resolveVisualProfile(capabilities = [], primaryDesignation = 'BEEKEEPER') {
  const sortedCaps = Array.from(new Set(capabilities || [])).sort();
  const signature = sortedCaps.join('|') || primaryDesignation || 'DEFAULT';

  // Deterministic theme index (0 - 19)
  const themeIndex = hashString(signature) % THEME_PALETTES.length;
  const baseTheme = THEME_PALETTES[themeIndex] || THEME_PALETTES[0];

  // Tailored hero emphasis and layout density by primary designation & complexity
  let heroEmphasis = 'observation';
  let density = 'comfortable';
  const desig = (primaryDesignation || '').toUpperCase();

  if (desig.includes('PROCESSOR')) {
    heroEmphasis = 'batch';
  } else if (desig.includes('LAB')) {
    heroEmphasis = 'sample';
    density = 'compact';
  } else if (desig.includes('DISTRIBUTOR') || desig.includes('DISPATCH')) {
    heroEmphasis = 'dispatch';
    density = 'compact';
  }

  // Adjust density if many capabilities exist
  if (sortedCaps.length > 8) {
    density = 'compact';
  }

  return {
    ...baseTheme,
    signature,
    density,
    heroEmphasis,
    capabilityCount: sortedCaps.length,
    statusTreatment: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: baseTheme.primaryColor
    }
  };
}

/**
 * Injects CSS custom properties into document :root or target element
 *
 * @param {Object} visualProfile
 * @param {HTMLElement} targetEl - Optional target element (defaults to document.documentElement)
 */
export function applyWorkspaceTheme(visualProfile, targetEl = null) {
  if (typeof document === 'undefined' || !visualProfile) return;

  const root = targetEl || document.documentElement;

  root.style.setProperty('--color-theme-primary', visualProfile.primaryColor);
  root.style.setProperty('--color-theme-secondary', visualProfile.secondaryColor);
  root.style.setProperty('--color-theme-accent', visualProfile.accentColor);
  root.style.setProperty('--color-theme-surface', visualProfile.surfaceColor);
  root.style.setProperty('--color-theme-card-border', visualProfile.cardBorder);
  root.style.setProperty('--color-theme-nav-accent', visualProfile.navigationAccent);
  root.style.setProperty('--color-theme-icon-accent', visualProfile.iconAccent);

  // Set tinted primary background (12% opacity)
  root.style.setProperty('--color-theme-primary-tint', `${visualProfile.primaryColor}1F`);
}

export const WorkspaceVisualIdentityService = {
  getAllThemes() {
    return THEME_PALETTES;
  },

  resolveVisualProfile,
  applyWorkspaceTheme,
  hashString
};
