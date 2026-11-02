/**
 * Tecnoemprende & Jota Beta — Universal Headless Spy Telemetry Engine v3
 *
 * SECURITY & ARCHITECTURE POLICY:
 *  - ZERO UI / ZERO MODAL on client websites. Telemetry is 100% invisible on the web.
 *  - Accessible EXCLUSIVELY from Jota Online (/#/espia) and Jota Beta Desktop on David's PC.
 *  - Automatically excludes David's IPs (IPv4 & IPv6) and Admin Devices from all visit/conversion counts.
 */
(function () {
  const CONFIG = {
    supabaseUrl: 'https://jyrqzjctkmzdvmraqrcv.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cnF6amN0a216ZHZtcmFxcmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI4MTU3NCwiZXhwIjoyMTAxODU3NTc0fQ.jpzy38i_JqhKiLZwNFXESJo62kk4vWvwCVPLpFIyLjc',
    heartbeatIntervalMs: 15000,
    excludedIps: [
      '94.59.222.46',
      '2001:8f8:2d49:ae62::ba15:f701'
    ],
    excludedIpPrefixes: [
      '94.59.222.',
      '2001:8f8:2d49:ae62'
    ],
    excludedVisitorIds: [
      'usr_0ed586a2-f30',
      'usr_7e22d322-49a',
      'usr_a58ff49e-37f'
    ]
  };

  function detectSiteMetadata() {
    if (window.SPY_SITE_ID && window.SPY_SITE_NAME) {
      return {
        siteId: window.SPY_SITE_ID,
        siteName: window.SPY_SITE_NAME,
        category: window.SPY_SITE_CATEGORY || 'dubai'
      };
    }
    return {
      siteId: 'best-opticals-abudhabi',
      siteName: 'Best Opticals Br.3 — Luxury Optometry & Eyewear Abu Dhabi',
      category: 'dubai'
    };
  }

  const { siteId, siteName, category } = detectSiteMetadata();
  const urlParams = new URLSearchParams(window.location.search);

  // Silent Admin Exclusion Flag (No UI ever rendered on the site)
  if (urlParams.get('admin') === 'david') {
    localStorage.setItem('tecno_spy_admin_excluded', 'true');
  }

  function getOrCreateVisitorId() {
    let vid = localStorage.getItem('tecno_spy_visitor_id');
    if (!vid) {
      vid = 'usr_' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 12) : Math.random().toString(36).substring(2, 12) + Date.now().toString(36));
      localStorage.setItem('tecno_spy_visitor_id', vid);
    }
    return vid;
  }

  const visitorId = getOrCreateVisitorId();

  if (CONFIG.excludedVisitorIds.includes(visitorId)) {
    localStorage.setItem('tecno_spy_admin_excluded', 'true');
  }

  function isIpExcluded(ipStr) {
    if (!ipStr) return false;
    const norm = String(ipStr).trim().toLowerCase();
    if (CONFIG.excludedIps.some(ip => ip.toLowerCase() === norm)) return true;
    if (CONFIG.excludedIpPrefixes.some(prefix => norm.startsWith(prefix.toLowerCase()))) return true;
    return false;
  }

  function incrementSiteVisitCount(sId) {
    const key = 'tecno_spy_vcount_' + sId;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const next = prev + 1;
    localStorage.setItem(key, String(next));
    return next;
  }

  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    if (/iPhone/i.test(ua)) return 'Apple iPhone';
    if (/iPad/i.test(ua)) return 'Apple iPad';
    if (/Android/i.test(ua)) return 'Android Smartphone';
    if (/Macintosh/i.test(ua)) return 'Apple Mac';
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Linux/i.test(ua)) return 'Linux PC';
    return 'Dispositivo Web';
  }

  const sessionKey = 'tecno_spy_sess_' + siteId;
  const startKey = 'tecno_spy_start_' + siteId;
  const vnumKey = 'tecno_spy_vnum_' + siteId;
  const convKey = 'tecno_spy_conv_' + siteId;
  const convEventsKey = 'tecno_spy_convev_' + siteId;

  let sessionId = sessionStorage.getItem(sessionKey);
  let sessionStartTime = parseInt(sessionStorage.getItem(startKey) || String(Date.now()), 10);
  let visitNumber = parseInt(sessionStorage.getItem(vnumKey) || '0', 10);
  let conversionsCount = parseInt(sessionStorage.getItem(convKey) || '0', 10);
  let conversionEvents = [];
  try {
    conversionEvents = JSON.parse(sessionStorage.getItem(convEventsKey) || '[]');
  } catch (e) {
    conversionEvents = [];
  }
  let clientGeo = { ip: 'direct', city: 'Visitante', country: 'Externo' };
  let isTrackingActive = false;

  async function ensureSiteRegistered() {
    const cleanUrl = window.location.href.split('?')[0];
    if (cleanUrl.startsWith('file:') || cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) return;
    try {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/web_spy_sites`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          site_id: siteId,
          site_name: siteName,
          site_url: cleanUrl,
          category: category,
          platform: 'GitHub Pages / Oficial'
        })
      });
    } catch (e) {}
  }

  async function resolveGeo() {
    try {
      const r1 = await fetch('https://ipwho.is/', { cache: 'no-store' });
      if (r1.ok) {
        const d1 = await r1.json();
        if (d1 && d1.ip) {
          return {
            ip: d1.ip,
            city: d1.city || 'Ciudad',
            country: d1.country || 'País'
          };
        }
      }
    } catch (e) {}
    try {
      const r2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (r2.ok) {
        const d2 = await r2.json();
        if (d2 && d2.ip) {
          return {
            ip: d2.ip,
            city: d2.city || 'Ciudad',
            country: d2.country_name || d2.country || 'País'
          };
        }
      }
    } catch (e2) {}
    return { ip: 'direct_' + visitorId.slice(-6), city: 'Acceso Directo', country: 'Web / Móvil' };
  }

  function setupConversionListeners() {
    document.addEventListener('click', (e) => {
      const target = e.target ? e.target.closest('a, button, [role="button"], input[type="submit"]') : null;
      if (!target) return;
      const href = (target.getAttribute('href') || '').toLowerCase();
      const text = (target.innerText || target.value || target.getAttribute('aria-label') || '').trim().toLowerCase();

      let actionLabel = null;
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        actionLabel = 'Clic Reserva/Contacto WhatsApp';
      } else if (href.startsWith('tel:')) {
        actionLabel = 'Llamada Directa';
      } else if (
        /comprar|reservar|book|appointment|cita|cotizar|ordenar|pedido|checkout|pagar|claim|solicitar|oferta|inquire|dossier|brochure|buy/i.test(text)
      ) {
        actionLabel = 'Acción: ' + (target.innerText || 'Reserva/Compra').trim().slice(0, 32);
      }

      if (actionLabel) {
        recordConversion(actionLabel);
      }
    }, true);

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form && form.id !== 'project-form') {
        recordConversion('Formulario Enviado / Reserva');
      }
    }, true);
  }

  function recordConversion(label) {
    if (!isTrackingActive) return;
    conversionsCount += 1;
    conversionEvents.push({
      label: label,
      at: new Date().toISOString()
    });
    sessionStorage.setItem(convKey, String(conversionsCount));
    sessionStorage.setItem(convEventsKey, JSON.stringify(conversionEvents.slice(-20)));
    sendHeartbeat(false);
  }

  window.recordTecnoSpyConversion = recordConversion;

  async function initTelemetry() {
    // Remove any legacy spy panel if cached in DOM
    const legacyPanel = document.getElementById('tecno-universal-spy-panel');
    if (legacyPanel) legacyPanel.remove();

    ensureSiteRegistered();

    if (localStorage.getItem('tecno_spy_admin_excluded') === 'true') {
      return;
    }

    try {
      clientGeo = await resolveGeo();

      // Check if resolved IP belongs to David — if so, permanently exclude and abort
      if (isIpExcluded(clientGeo.ip)) {
        localStorage.setItem('tecno_spy_admin_excluded', 'true');
        return;
      }

      if (!sessionId) {
        sessionId = 'spy_' + siteId.slice(0, 18) + '_' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : Math.random().toString(36).substring(2, 10) + Date.now().toString(36));
        sessionStartTime = Date.now();
        visitNumber = incrementSiteVisitCount(siteId);
        sessionStorage.setItem(sessionKey, sessionId);
        sessionStorage.setItem(startKey, String(sessionStartTime));
        sessionStorage.setItem(vnumKey, String(visitNumber));
      } else if (!visitNumber) {
        visitNumber = parseInt(localStorage.getItem('tecno_spy_vcount_' + siteId) || '1', 10);
      }

      isTrackingActive = true;
      await registerInitialVisit();
      setupConversionListeners();

      setInterval(() => sendHeartbeat(false), CONFIG.heartbeatIntervalMs);
      window.addEventListener('beforeunload', () => sendHeartbeat(true));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') sendHeartbeat(true);
      });
    } catch (err) {}
  }

  async function registerInitialVisit() {
    const durationSec = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const payload = {
      id: sessionId,
      site_id: siteId,
      site_name: siteName,
      page_path: window.location.pathname || '/',
      page_url: window.location.href.split('?')[0],
      visitor_id: visitorId,
      ip: clientGeo.ip,
      city: clientGeo.city,
      country: clientGeo.country,
      device: getDeviceInfo(),
      user_agent: (navigator.userAgent || '').slice(0, 250),
      referrer: (document.referrer || 'Directo').slice(0, 200),
      duration_seconds: durationSec,
      conversions_count: conversionsCount,
      conversion_events: conversionEvents,
      is_active: true,
      visit_count: visitNumber || 1,
      last_ping_at: new Date().toISOString()
    };

    try {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/web_spy_visits`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }

  async function sendHeartbeat(isClosing = false) {
    if (!isTrackingActive || !sessionId) return;
    const durationSec = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const payload = {
      duration_seconds: durationSec,
      conversions_count: conversionsCount,
      conversion_events: conversionEvents,
      is_active: !isClosing,
      last_ping_at: new Date().toISOString()
    };

    try {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/web_spy_visits?id=eq.${encodeURIComponent(sessionId)}`, {
        method: 'PATCH',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: Boolean(isClosing)
      });
    } catch (e) {}
  }

  initTelemetry();
})();
