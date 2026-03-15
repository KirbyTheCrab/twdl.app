/**
 * themeSettings.js
 * ─────────────────
 * Builds the floating "Appearance" panel and manages theme switching.
 * Theme choice is stored in localStorage under the key 'twdl-theme'.
 *
 * Themes:  ocean (default) | midnight | ember | jade
 * Applied: [data-theme] attribute on <html>.
 */

const STORAGE_KEY = 'twdl-theme';

const THEMES = [
  {
    id: 'ocean',
    label: 'Ocean',
    bg: '#0a1e2d',
    accent: '#2bc0ff',
    warm: '#ffb347',
  },
  {
    id: 'midnight',
    label: 'Midn.',
    bg: '#1a1433',
    accent: '#7c6aff',
    warm: '#ff7eb3',
  },
  {
    id: 'ember',
    label: 'Ember',
    bg: '#251608',
    accent: '#ff8c3a',
    warm: '#ffd166',
  },
  {
    id: 'jade',
    label: 'Jade',
    bg: '#0c2220',
    accent: '#2dda93',
    warm: '#ffd166',
  },
];

// ── Helpers ───────────────────────────────────────────────────

function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'ocean';
}

function applyTheme(id, animate = false) {
  const html = document.documentElement;

  if (animate) {
    html.classList.add('theme-transitioning');
    setTimeout(() => html.classList.remove('theme-transitioning'), 320);
  }

  if (id === 'ocean') {
    html.removeAttribute('data-theme');
  } else {
    html.dataset.theme = id;
  }

  localStorage.setItem(STORAGE_KEY, id);

  // Sync active state on all swatch buttons
  document.querySelectorAll('.theme-swatch').forEach((el) => {
    const isActive = el.dataset.themeId === id;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-pressed', String(isActive));
  });
}

// ── Build swatch HTML ─────────────────────────────────────────

function swatchHTML(theme, isActive) {
  return `
    <button
      class="theme-swatch${isActive ? ' active' : ''}"
      data-theme-id="${theme.id}"
      aria-pressed="${isActive}"
      aria-label="Switch to ${theme.label} theme"
      title="${theme.label}"
    >
      <span class="swatch-preview">
        <span class="swatch-bg-fill"   style="background:${theme.bg}"></span>
        <span class="swatch-accent-bar" style="background:${theme.accent}"></span>
        <span class="swatch-warm-bar"   style="background:${theme.warm}"></span>
      </span>
      <span class="swatch-label">${theme.label}</span>
    </button>`;
}

// ── Build the switcher DOM and attach behaviour ───────────────

function createThemeSwitcher() {
  const active = getSavedTheme();

  const host = document.createElement('div');
  host.id = 'theme-settings-host';
  host.innerHTML = `
    <button
      id="theme-toggle-btn"
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-label="Open appearance settings"
      title="Appearance"
    >
      <!-- Sun/rays icon -->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2"  x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34"/>
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
        <line x1="2"  y1="12" x2="5"  y2="12"/>
        <line x1="19" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
        <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
      </svg>
    </button>

    <div id="theme-panel" role="dialog" aria-label="Appearance settings" hidden>
      <p class="theme-panel-title">Appearance</p>
      <div class="theme-swatches">
        ${THEMES.map((t) => swatchHTML(t, t.id === active)).join('')}
      </div>
    </div>`;

  document.body.appendChild(host);

  const btn   = host.querySelector('#theme-toggle-btn');
  const panel = host.querySelector('#theme-panel');

  // Toggle panel
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    btn.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      // Focus first swatch for keyboard users
      host.querySelector('.theme-swatch')?.focus();
    }
  });

  // Click outside closes panel
  document.addEventListener('click', () => {
    if (!panel.hidden) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Clicks inside panel don't bubble to document
  panel.addEventListener('click', (e) => e.stopPropagation());

  // Apply theme on swatch click
  host.querySelectorAll('.theme-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      applyTheme(swatch.dataset.themeId, true);
    });
  });

  // Keyboard: Escape closes panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

// ── Init ──────────────────────────────────────────────────────

// Re-apply saved theme (the inline <head> script handles initial paint;
// this is a fallback for dynamic page loads).
applyTheme(getSavedTheme(), false);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createThemeSwitcher);
} else {
  createThemeSwitcher();
}
