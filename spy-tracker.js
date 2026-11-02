/**
 * Tecnoemprende & Jota Beta — Universal Headless Spy Telemetry Engine v4 (Anti-Bot & Human Proof-of-Interaction)
 *
 * SECURITY & ANTI-NOISE ARCHITECTURE:
 *  1. ZERO UI / ZERO MODAL on client websites. Accessible EXCLUSIVELY in Jota Online (/#/espia) & Jota Desktop.
 *  2. Automatic Exclusion of David's IPs (IPv4 & IPv6) and Admin Browser IDs.
 *  3. Strict Anti-Bot & Headless Browser Filter (blocks WebDriver, HeadlessChrome, Crawlers, Link Previewers, and Cloud/Datacenter Scanner ASNs like AWS, GCP, Azure, Censys, Shodan, M247, OVH, Hetzner).
 *  4. Mandatory Real Human Proof-of-Interaction + Minimum 4-Second Dwell Time Gate:
 *     Never records 1s-2s automated bounces or passive scanner pings. A visit is ONLY recorded after a real human
 *     physically interacts (touch, scroll, pointer/mouse movement, or click) AND stays >= 4 seconds (or triggers a conversion).
 */
(function () {
  const CONFIG = {
    supabaseUrl: 'https://jyrqzjctkmzdvmraqrcv.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cnF6amN0a216ZHZtcmFxcmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI4MTU3NCwiZXhwIjoyMTAxODU3NTc0fQ.jpzy38i_JqhKiLZwNFXESJo62kk4vWvwCVPLpFIyLjc',
    heartbeatIntervalMs: 15000,
    minHumanDwellMs: 4000,
    excludedIps: [
      '94.59.222.46',
      '92.99.182.224',
      '2001:8f8:2d49:ae62::ba15:f701',
      '74.179.67.173',
      '80.82.77.202',
      '93.174.93.34',
      '45.132.195.24',
      '45.86.18.148'
    ],
    excludedIpPrefixes: [
      '94.59.222.',
      '92.99.182.',
      '2001:8f8:2d49:ae62',
      '66.249.',
      '34.203.',
      '3.239.',
      '52.207.',
      '104.154.',
      '2a03:2880:'
    ],
    excludedVisitorIds: [
      'usr_0ed586a2-f30',
      'usr_7e22d322-49a',
      'usr_a58ff49e-37f'
    ],
    datacenterKeywords: [
      'amazon', 'aws', 'google cloud', 'google llc', 'microsoft', 'azure',
      'digitalocean', 'hetzner', 'ovh', 'choopa', 'vultr', 'linode', 'akamai',
      'censys', 'shodan', 'leaseweb', 'm247', 'datacamp', 'cloudflare', 'fastly',
      'facebook', 'meta platforms', 'quasi networks', 'frantech', 'contabo',
      'tzulo', 'performive', 'multacom', ' Stark ', 'scaleway', 'upcloud',
      'alibaba', 'tencent', 'oracle cloud', 'ibm cloud', 'hosting', 'datacenter',
      'server', 'colocation', 'vpn', 'proxy'
    ]
  };

  // Immediate Bot / Headless / Crawler Rejection
  function isAutomatedBotEnv() {
    const ua = (navigator.userAgent || '').toLowerCase();
    if (!ua) return true;
    if (navigator.webdriver === true) return true;
    if (/bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|slackbot|discordbot|vkshare|W3C_Validator|curl|wget|python|axios|node-fetch|go-http-client|java|okhttp/i.test(ua)) {
      return true;
    }
    if (window.outerWidth === 0 && window.outerHeight === 0) return true;
    if (!navigator.languages || navigator.languages.length === 0) return true;
    return false;
  }

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

  function isIpOrIspExcluded(ipStr, ispStr) {
    if (ipStr) {
      const norm = String(ipStr).trim().toLowerCase();
      if (CONFIG.excludedIps.some(ip => ip.toLowerCase() === norm)) return true;
      if (CONFIG.excludedIpPrefixes.some(prefix => norm.startsWith(prefix.toLowerCase()))) return true;
    }
    if (ispStr) {
      const normIsp = String(ispStr).trim().toLowerCase();
      if (CONFIG.datacenterKeywords.some(kw => normIsp.includes(kw.toLowerCase()))) return true;
    }
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
  let clientGeo = { ip: 'direct', city: 'Visitante', country: 'Externo', isp: '' };
  let isTrackingActive = false;
  let hasHumanInteracted = false;
  let hasPassedDwellGate = false;
  let geoReady = false;
  let isBlockedSource = false;

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
          const ispInfo = [
            d1.connection && d1.connection.isp,
            d1.connection && d1.connection.org,
            d1.connection && d1.connection.domain
          ].filter(Boolean).join(' ');
          return {
            ip: d1.ip,
            city: d1.city || 'Ciudad',
            country: d1.country || 'País',
            isp: ispInfo
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
            country: d2.country_name || d2.country || 'País',
            isp: d2.org || ''
          };
        }
      }
    } catch (e2) {}
    return { ip: 'direct_' + visitorId.slice(-6), city: 'Acceso Directo', country: 'Web / Móvil', isp: '' };
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

  async function tryActivateHumanSession(forceByConversion = false) {
    if (isTrackingActive || isBlockedSource) return;
    if (!geoReady) return;
    if (!forceByConversion && (!hasHumanInteracted || !hasPassedDwellGate)) return;

    if (!sessionId) {
      sessionId = 'spy_' + siteId.slice(0, 18) + '_' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : Math.random().toString(36).substring(2, 10) + Date.now().toString(36));
      visitNumber = incrementSiteVisitCount(siteId);
      sessionStorage.setItem(sessionKey, sessionId);
      sessionStorage.setItem(startKey, String(sessionStartTime));
      sessionStorage.setItem(vnumKey, String(visitNumber));
    } else if (!visitNumber) {
      visitNumber = parseInt(localStorage.getItem('tecno_spy_vcount_' + siteId) || '1', 10);
    }

    isTrackingActive = true;
    await registerInitialVisit();
    setInterval(() => sendHeartbeat(false), CONFIG.heartbeatIntervalMs);
    window.addEventListener('beforeunload', () => sendHeartbeat(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendHeartbeat(true);
    });
  }

  function recordConversion(label) {
    if (isBlockedSource) return;
    conversionsCount += 1;
    conversionEvents.push({
      label: label,
      at: new Date().toISOString()
    });
    sessionStorage.setItem(convKey, String(conversionsCount));
    sessionStorage.setItem(convEventsKey, JSON.stringify(conversionEvents.slice(-20)));
    if (!isTrackingActive) {
      hasHumanInteracted = true;
      hasPassedDwellGate = true;
      tryActivateHumanSession(true);
    } else {
      sendHeartbeat(false);
    }
  }

  window.recordTecnoSpyConversion = recordConversion;

  function listenForHumanProof() {
    const onHumanEvent = (e) => {
      if (e && e.isTrusted === false) return;
      hasHumanInteracted = true;
      tryActivateHumanSession(false);
    };
    window.addEventListener('scroll', onHumanEvent, { passive: true, once: true });
    window.addEventListener('touchstart', onHumanEvent, { passive: true, once: true });
    window.addEventListener('pointerdown', onHumanEvent, { passive: true, once: true });
    window.addEventListener('mousemove', onHumanEvent, { passive: true, once: true });
    window.addEventListener('keydown', onHumanEvent, { passive: true, once: true });
  }

  async function initTelemetry() {
    const legacyPanel = document.getElementById('tecno-universal-spy-panel');
    if (legacyPanel) legacyPanel.remove();

    ensureSiteRegistered();

    if (localStorage.getItem('tecno_spy_admin_excluded') === 'true' || isAutomatedBotEnv()) {
      isBlockedSource = true;
      return;
    }

    sessionStartTime = parseInt(sessionStorage.getItem(startKey) || String(Date.now()), 10);
    sessionStorage.setItem(startKey, String(sessionStartTime));

    listenForHumanProof();
    setupConversionListeners();

    setTimeout(() => {
      if (document.visibilityState !== 'hidden') {
        hasPassedDwellGate = true;
        tryActivateHumanSession(false);
      }
    }, CONFIG.minHumanDwellMs);

    try {
      clientGeo = await resolveGeo();
      if (isIpOrIspExcluded(clientGeo.ip, clientGeo.isp)) {
        isBlockedSource = true;
        return;
      }
      geoReady = true;
      tryActivateHumanSession(false);
    } catch (err) {}
  }

  async function registerInitialVisit() {
    const durationSec = Math.max(4, Math.round((Date.now() - sessionStartTime) / 1000));
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
    if (!isTrackingActive || !sessionId || isBlockedSource) return;
    const durationSec = Math.max(4, Math.round((Date.now() - sessionStartTime) / 1000));
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
