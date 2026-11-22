// ShiftRelay Brand Assets - Distinctive SVG Logo and Wordmark
export function logoIcon(size = 28, className = '') {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ShiftRelay Logo">
    <defs>
      <linearGradient id="srGrad1" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#2563EB" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
      <linearGradient id="srGrad2" x1="10" y1="6" x2="26" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <linearGradient id="srGrad3" x1="2" y1="20" x2="22" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#10B981" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
    </defs>
    <!-- Outgoing arc -->
    <path d="M7 16C7 11.0294 11.0294 7 16 7C18.6 7 20.9 8.1 22.5 9.9" stroke="url(#srGrad1)" stroke-width="3" stroke-linecap="round"/>
    <!-- Incoming arc -->
    <path d="M25 16C25 20.9706 20.9706 25 16 25C13.4 25 11.1 23.9 9.5 22.1" stroke="url(#srGrad3)" stroke-width="3" stroke-linecap="round"/>
    <!-- Central dynamic relay baton passing forward -->
    <rect x="13.2" y="8" width="5.6" height="16" rx="2.8" transform="rotate(30 16 16)" fill="url(#srGrad2)"/>
    <circle cx="11.5" cy="11.5" r="2.2" fill="#2563EB"/>
    <circle cx="20.5" cy="20.5" r="2.2" fill="#059669"/>
  </svg>`;
}

export function logoFull(size = 28, showTagline = false, theme = 'auto') {
  const themeClass = theme === 'dark-text' ? 'sr-brand-dark-text' : (theme === 'light-text' ? 'sr-brand-light-text' : '');
  return `<div class="sr-brand-lockup ${themeClass}">
    ${logoIcon(size, 'sr-logo-icon')}
    <div class="sr-brand-text">
      <span class="sr-brand-name">Shift<span class="sr-accent">Relay</span></span>
      ${showTagline ? '<span class="sr-brand-tagline">Never drop the baton</span>' : ''}
    </div>
  </div>`;
}

export const faviconSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="%232563eb"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><path d="M7 16C7 11 11 7 16 7c2.6 0 4.9 1.1 6.5 2.9" stroke="url(%23g)" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M25 16c0 5-4 9-9 9-2.6 0-4.9-1.1-6.5-2.9" stroke="%23059669" stroke-width="3" stroke-linecap="round" fill="none"/><rect x="13.2" y="8" width="5.6" height="16" rx="2.8" transform="rotate(30 16 16)" fill="url(%23b)"/><circle cx="11.5" cy="11.5" r="2" fill="%232563eb"/><circle cx="20.5" cy="20.5" r="2" fill="%23059669"/></svg>`;
