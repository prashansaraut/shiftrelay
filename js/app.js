// ShiftRelay Application Router & Event Orchestrator
import { routes, acts, Q, lists, submitForm, saveSettings, saveProfilePrefs } from './views.js';
import { $, $$, icons, empty, toast, esc, ask } from './ui.js';
import { get, getTheme, setTheme, setRole } from './store.js';

const rx = routes.map(([p, h]) => [new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'), h]);

// Normalizes any URL, including subfolders, LiveServer paths, file:// paths, or hash routing
export function normalizePath(rawPath, hash = '') {
  // Support hash routing fallback if present (#/demo, #/app/dashboard)
  if (hash && hash.startsWith('#/')) {
    return hash.slice(1);
  }

  let p = rawPath || '/';

  // Strip trailing slashes unless root
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

  // Look for any known route candidate in the path
  const candidates = ['/app/', '/app', '/demo', '/dashboard', '/shifts', '/handovers', '/tasks', '/incidents', '/activity', '/settings', '/search'];
  for (const c of candidates) {
    const idx = p.indexOf(c);
    if (idx !== -1) {
      return p.slice(idx);
    }
  }

  // If file:// or index.html or arbitrary base path without a known route, default to '/'
  if (p.endsWith('/index.html') || p.includes('.html') || p.startsWith('/C:') || p.startsWith('C:') || !p.startsWith('/')) {
    return '/';
  }

  // If path is root or single folder name (e.g. /handoverhq or /shiftrelay or empty)
  const segments = p.split('/').filter(Boolean);
  if (segments.length <= 1) {
    return '/';
  }

  return p;
}

export const navigate = url => {
  // If running via file: protocol, use hash navigation so links work without a web server
  if (location.protocol === 'file:') {
    location.hash = url;
    return;
  }
  history.pushState({}, '', url);
  render(true);
};

// Sync Theme state across DOM and controls
function syncThemeUI() {
  const currentTheme = getTheme ? getTheme() : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.body.setAttribute('data-theme', currentTheme);

  const iconName = currentTheme === 'dark' ? 'sun' : 'moon';
  const label = currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';

  const themeIcon = $('#themeIcon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', iconName);
  }
  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.title = label;
  }

  $$('.sr-theme-toggle, [data-act="toggle-theme"]').forEach(btn => {
    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    btn.title = label;
    btn.setAttribute('aria-label', label);
  });
}

// Sync Profile Header & Dropdown
function syncProfileUI() {
  const s = get();
  const user = s.user || { name: 'Priya Nair' };
  const role = s.role || 'Operations Manager';

  // Extract initials
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'SR';

  const avatarBadge = $('#srAvatarInitials');
  if (avatarBadge) avatarBadge.textContent = initials;
  const avatarLg = $('#srAvatarLg');
  if (avatarLg) avatarLg.textContent = initials;

  const profileName = $('#srProfileName');
  if (profileName) profileName.textContent = user.name;
  const dropdownName = $('#srDropdownName');
  if (dropdownName) dropdownName.textContent = user.name;

  const profileRole = $('#srProfileRole');
  if (profileRole) profileRole.textContent = role;
  const dropdownRole = $('#srDropdownRole');
  if (dropdownRole) dropdownRole.textContent = role;
  const roleTag = $('#roleTag');
  if (roleTag) roleTag.textContent = role;

  // Highlight active role button
  $$('.sr-role-btn').forEach(b => {
    const isCurrent = b.dataset.switchRole === role;
    b.classList.toggle('active', isCurrent);
  });
}

function render(top = true) {
  const u = new URL(location.href);
  const activePath = normalizePath(u.pathname, location.hash);
  let out = null;

  for (const [r, h] of rx) {
    const m = r.exec(activePath);
    if (m) {
      try {
        out = h(m.groups || {}, u.searchParams);
      } catch (e) {
        console.error('Render error:', e);
        out = {
          title: 'Something went wrong',
          html: empty('bug', 'This view could not be displayed. Try returning to the dashboard or resetting data in Settings.')
        };
      }
      break;
    }
  }

  // Handle redirects
  if (out && out.redirect) {
    if (location.protocol === 'file:') {
      location.hash = out.redirect;
    } else {
      history.replaceState({}, '', out.redirect);
    }
    render(top);
    return;
  }

  // Graceful fallback for unrecognized routes
  out ??= {
    title: 'Page Not Found',
    html: `
      <div class="empty" style="padding: 3.5rem 1.5rem; text-align: center;">
        <i data-lucide="map-pin-off" style="width: 48px; height: 48px; color: var(--tx-muted); margin-bottom: 1rem; opacity: 0.6;"></i>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.6rem; font-weight: 700;">Page Not Found</h2>
        <p class="muted" style="margin: 0 0 1.75rem; font-size: 0.95rem;">There is no page at <code>${esc(activePath)}</code>.</p>
        <div class="row justify-center" style="gap: 0.75rem;">
          <a class="btn primary" href="/" data-link><i data-lucide="home"></i> ShiftRelay Home</a>
          <a class="btn" href="/demo" data-link><i data-lucide="play-circle"></i> Interactive Demo</a>
          <a class="btn" href="/app/dashboard" data-link><i data-lucide="layout-dashboard"></i> Workspace Dashboard</a>
        </div>
      </div>
    `
  };

  const isPublic = out.isPublic || activePath === '/' || activePath === '/demo';

  // Toggle public layout vs workspace layout
  const side = $('#side');
  if (isPublic) {
    document.body.classList.add('public-mode');
    if (side) side.style.display = 'none';
    const topBar = $('#topBar');
    if (topBar) topBar.style.display = 'none';
    const pageHead = $('#pageHead');
    if (pageHead) pageHead.style.display = 'none';
  } else {
    document.body.classList.remove('public-mode');
    if (side) side.style.display = '';
    const topBar = $('#topBar');
    if (topBar) topBar.style.display = 'flex';
    const pageHead = $('#pageHead');
    if (pageHead) pageHead.style.display = 'flex';

    $('#title').textContent = out.title;
    $('#crumb').innerHTML = out.crumb || '';
    $('#actions').innerHTML = out.actions || '';
    syncProfileUI();
  }

  $('#view').innerHTML = out.html;
  document.title = (out.title ? out.title + ' | ' : '') + 'ShiftRelay';

  // Update active sidebar nav item
  $$('#side nav a').forEach(a => {
    const linkPath = a.pathname;
    const isActive = activePath === linkPath || (linkPath !== '/app/dashboard' && activePath.startsWith(linkPath + '/'));
    a.classList.toggle('active', isActive);
  });

  document.body.classList.remove('nav-open');
  document.body.classList.remove('sr-mobile-nav-open');
  const dropdown = $('#srProfileDropdown');
  if (dropdown) dropdown.hidden = true;
  const trigger = $('#srProfileTrigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');

  syncThemeUI();
  icons();
  if (top) {
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      } else {
        scrollTo(0, 0);
      }
    } else {
      scrollTo(0, 0);
    }
  }
}

// Filter handling for lists
const filter = el => {
  const [m, k] = el.dataset.q.split('.');
  Q[m][k] = el.value;
  const listEl = $('#list');
  if (listEl && lists[m]) {
    listEl.innerHTML = lists[m]();
    icons();
  }
};

// Global click delegation
if (typeof document !== 'undefined') {
  document.addEventListener('click', async e => {
    // Smooth Anchor Navigation & Interception (#problem, #how-it-works, etc.)
    const anchor = e.target.closest('a[href^="#"], a[href*="/#"]');
    if (anchor && !e.metaKey && !e.ctrlKey) {
      const rawHref = anchor.getAttribute('href');
      const hashIndex = rawHref.indexOf('#');
      if (hashIndex !== -1) {
        const hash = rawHref.slice(hashIndex + 1);
        if (hash) {
          // Close mobile navigation drawer if open
          document.body.classList.remove('sr-mobile-nav-open');
          const navToggle = document.getElementById('srNavToggle');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');

          const currentPath = window.location.pathname;
          if (currentPath === '/' || rawHref.startsWith('#')) {
            const targetEl = document.getElementById(hash);
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.pushState(null, '', '#' + hash);
              return;
            }
          } else {
            // We are on another route (e.g. /demo or /app/*); navigate to /#hash
            e.preventDefault();
            navigate('/#' + hash);
            setTimeout(() => {
              const targetEl = document.getElementById(hash);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 150);
            return;
          }
        }
      }
    }

    const a = e.target.closest('a[data-link]');
    if (a && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      navigate(a.getAttribute('href'));
      return;
    }

    // Theme Toggle Button
    const themeBtn = e.target.closest('#themeToggle, [data-act="toggle-theme"], .sr-theme-toggle');
    if (themeBtn) {
      const current = getTheme ? getTheme() : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      if (setTheme) setTheme(next);
      syncThemeUI();
      icons();
      toast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Theme.`);
      return;
    }

    // Workspace Profile Menu Trigger
    const profileTrigger = e.target.closest('#srProfileTrigger');
    if (profileTrigger) {
      const dropdown = $('#srProfileDropdown');
      if (dropdown) {
        const willOpen = dropdown.hidden;
        dropdown.hidden = !willOpen;
        profileTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        icons();
      }
      return;
    }

    // Role Switch inside Profile Menu
    const roleBtn = e.target.closest('[data-switch-role]');
    if (roleBtn) {
      const newRole = roleBtn.dataset.switchRole;
      if (setRole) setRole(newRole);
      syncProfileUI();
      const dropdown = $('#srProfileDropdown');
      if (dropdown) dropdown.hidden = true;
      toast(`Active simulated role set to ${newRole}`);
      render(false);
      return;
    }

    // "About ShiftRelay" Modal Dialog
    const aboutBtn = e.target.closest('#srAboutBtn');
    if (aboutBtn) {
      const dropdown = $('#srProfileDropdown');
      if (dropdown) dropdown.hidden = true;
      showAboutModal();
      return;
    }

    // Dismiss profile dropdown on outside click
    const profileContainer = e.target.closest('#srProfileMenu');
    if (!profileContainer) {
      const dropdown = $('#srProfileDropdown');
      if (dropdown && !dropdown.hidden) {
        dropdown.hidden = true;
        const trigger = $('#srProfileTrigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    }

    // Public mobile navigation drawer toggle & dismiss
    const navToggle = e.target.closest('#srNavToggle');
    if (navToggle) {
      const isOpen = document.body.classList.toggle('sr-mobile-nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      icons();
      return;
    }

    if (e.target.closest('#srNavClose') || e.target.id === 'srNavScrim' || e.target.closest('.sr-nav-mobile-item') || e.target.closest('.sr-mobile-btn')) {
      document.body.classList.remove('sr-mobile-nav-open');
      const toggle = document.getElementById('srNavToggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    const b = e.target.closest('[data-act]');
    if (b && b.tagName !== 'SELECT' && b.type !== 'checkbox') {
      const actName = b.dataset.act;
      if (acts[actName]) {
        await acts[actName](b.dataset.id, b);
        render(false);
      }
    }
  });

  // "About ShiftRelay" Modal Helper
  function showAboutModal() {
    const d = document.createElement('dialog');
    d.className = 'sr-modal-about';
    d.innerHTML = `
      <div class="sr-about-card">
        <div class="sr-about-header">
          <div class="row items-center" style="gap: 0.75rem;">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16C7 11.0294 11.0294 7 16 7C18.6 7 20.9 8.1 22.5 9.9" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
              <path d="M25 16C25 20.9706 20.9706 25 16 25C13.4 25 11.1 23.9 9.5 22.1" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
              <rect x="13.2" y="8" width="5.6" height="16" rx="2.8" transform="rotate(30 16 16)" fill="#F59E0B"/>
              <circle cx="11.5" cy="11.5" r="2.2" fill="#3B82F6"/>
              <circle cx="20.5" cy="20.5" r="2.2" fill="#10B981"/>
            </svg>
            <div>
              <h3 style="margin: 0; font-size: 1.25rem;">ShiftRelay 2.4.0</h3>
              <p class="muted" style="margin: 0; font-size: 0.85rem;">Shift Continuity &amp; Handover Platform</p>
            </div>
          </div>
          <button class="icon-btn" id="srAboutClose" aria-label="Close dialog"><i data-lucide="x"></i></button>
        </div>

        <div class="sr-about-body">
          <p><strong>Tagline:</strong> Every shift connected. Nothing left behind.</p>
          <p><strong>Signature Feature:</strong> The Continuity Engine enforces original ID preservation, cumulative carry tracking, and mid-flight reassignment conflict protection.</p>
          
          <div class="sr-about-meta-grid">
            <div><span class="muted">Architecture:</span><br><strong>Zero-Dependency Vanilla ES2022</strong></div>
            <div><span class="muted">Routing:</span><br><strong>HTML5 History API with Normalizer</strong></div>
            <div><span class="muted">Persistence:</span><br><strong>Resilient LocalStorage + In-Memory Sandbox</strong></div>
            <div><span class="muted">Design System:</span><br><strong>W3C CSS Tokens (Light &amp; Dark)</strong></div>
          </div>

          <div class="card mt" style="background: var(--bg); font-size: 0.85rem; padding: 0.75rem 1rem;">
            <strong>Internship Context:</strong> Developed by Manthan Raut for the Yuva Intern Frontend Web Developer Week 5 Final Evaluation.
          </div>
        </div>

        <div class="row end mt" style="gap: 0.75rem;">
          <a href="/demo" data-link class="btn" id="srAboutDemoBtn"><i data-lucide="play-circle"></i> Explore Interactive Demo</a>
          <button class="btn primary" id="srAboutOkBtn">Close</button>
        </div>
      </div>
    `;

    d.querySelector('#srAboutClose').onclick = () => d.close();
    d.querySelector('#srAboutOkBtn').onclick = () => d.close();
    const demoBtn = d.querySelector('#srAboutDemoBtn');
    if (demoBtn) {
      demoBtn.onclick = () => {
        d.close();
        navigate('/demo');
      };
    }
    d.onclose = () => d.remove();
    document.body.append(d);
    icons();
    d.showModal();
  }

  // Global change delegation (selects, inputs)
  document.addEventListener('change', async e => {
    if (e.target.dataset.q) {
      filter(e.target);
    }
    if (e.target.dataset.act) {
      const actName = e.target.dataset.act;
      if (acts[actName]) {
        await acts[actName](e.target.dataset.id, e.target);
        render(false);
      }
    }
  });

  // Form submission
  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.id === 'gsearch') {
      e.preventDefault();
      navigate('/app/search?q=' + encodeURIComponent(f.q.value.trim()));
    } else if (f.dataset.kind) {
      e.preventDefault();
      const to = submitForm(f);
      if (to) navigate(to);
    } else if (f.dataset.profilePrefs) {
      e.preventDefault();
      saveProfilePrefs(f);
      render(false);
    } else if (f.dataset.settings) {
      e.preventDefault();
      saveSettings(f);
      render(false);
    }
  });

  // Workspace sidebar drawer toggle on mobile
  const menuBtn = $('#menu');
  if (menuBtn) {
    menuBtn.onclick = () => {
      document.body.classList.toggle('nav-open');
      icons();
    };
  }

  const scrim = $('#scrim');
  if (scrim) {
    scrim.onclick = () => document.body.classList.remove('nav-open');
  }

  // Global Keyboard Accessibility (Escape dismissal)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.body.classList.remove('sr-mobile-nav-open');
      document.body.classList.remove('nav-open');
      const dropdown = $('#srProfileDropdown');
      if (dropdown && !dropdown.hidden) {
        dropdown.hidden = true;
        const trigger = $('#srProfileTrigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// Storage error listener & route events
if (typeof window !== 'undefined') {
  window.addEventListener('sr-save-error', e => {
    toast('Storage warning: ' + e.detail, 'err');
  });

  window.addEventListener('popstate', () => render(true));
  window.addEventListener('hashchange', () => render(true));

  // Initial bootstrap
  syncThemeUI();
  render(true);
}
