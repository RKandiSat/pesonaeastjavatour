/* ============================================
   MALANG EAST JAVA TRAVEL GUIDE
   main.js — weather, currency, scroll reveal
   ============================================ */

/* ── YOUTUBE LAZY LOAD ── */
/* HOW TO USE:
   1. Find a YouTube video you want to embed
   2. Copy the video URL e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
   3. The VIDEO ID is the part after ?v= — in this example: dQw4w9WgXcQ
   4. In index.html find the placeholder div for that location
   5. Replace PASTE_YOUTUBE_ID_HERE with your actual video ID
   6. Save and redeploy — the placeholder becomes a real video
*/
function loadYT(containerId, videoId) {
  if (videoId === 'PASTE_YOUTUBE_ID_HERE') {
    alert('YouTube video not set up yet.\n\nTo add a video:\n1. Find a YouTube video\n2. Copy the video ID from the URL\n3. Open index.html\n4. Find the placeholder for this location\n5. Replace PASTE_YOUTUBE_ID_HERE with your video ID');
    return;
  }
  const el = document.getElementById(containerId);
  if (!el) return;
  el.outerHTML = `<div class="yt-wrap">
    <iframe class="yt-iframe"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen loading="lazy" title="Tour video">
    </iframe>
  </div>`;
}

/* ── CULINARY DETAIL TOGGLE ── */
function toggleFoodDetail(id, btn) {
  const panel = document.getElementById(id);
  const isOpen = panel.classList.contains('open');
  document.querySelectorAll('.dest-detail, .food-detail').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.dest-toggle-btn, .food-toggle-btn').forEach(b => {
    b.classList.remove('open');
    b.innerHTML = b.classList.contains('food-toggle-btn')
      ? 'View details <em class="arrow">▼</em>'
      : 'View full details <em class="arrow">▼</em>';
  });
  if (!isOpen) {
    panel.classList.add('open');
    if (btn) {
      btn.classList.add('open');
      btn.innerHTML = 'Close details <em class="arrow">▼</em>';
    }
    scrollToPanel(panel);
  }
}

/* ── DESTINATION DETAIL TOGGLE ── */
function toggleDetail(id, btn) {
  const panel = document.getElementById(id);
  const isOpen = panel.classList.contains('open');
  // close all panels first
  document.querySelectorAll('.dest-detail').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.dest-toggle-btn').forEach(b => {
    b.classList.remove('open');
    b.innerHTML = 'View full details <em class="arrow">▼</em>';
  });
  // open clicked one if it was closed
  if (!isOpen) {
    panel.classList.add('open');
    if (btn) {
      btn.classList.add('open');
      btn.innerHTML = 'Close details <em class="arrow">▼</em>';
    }
    scrollToPanel(panel);
  }
}

/* ── WEATHER ── */
async function loadWeather() {
  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-7.9797&longitude=112.6304&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FJakarta'
    );
    const d = await r.json();
    const c = d.current;
    const codes = {
      0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
      45:'Foggy', 51:'Light drizzle', 61:'Light rain', 63:'Moderate rain',
      80:'Rain showers', 95:'Thunderstorm'
    };
    document.getElementById('w-temp').innerHTML  = `<span>🌡</span> ${c.temperature_2m}°C`;
    document.getElementById('w-humid').innerHTML = `<span>💧</span> Humidity ${c.relative_humidity_2m}%`;
    document.getElementById('w-wind').innerHTML  = `<span>💨</span> Wind ${c.wind_speed_10m} km/h`;
    document.getElementById('w-desc').innerHTML  = `<span>☁</span> ${codes[c.weather_code] || 'Variable'}`;
  } catch(e) {
    document.getElementById('w-temp').innerHTML = '<span>🌡</span> Malang ~22°C';
  }
}

/* ── CURRENCY ── */
/* Frankfurter API updates rates every business day automatically.
   This code adds smart caching (6 hours) so repeat visitors
   see instant rates, then refreshes in the background. */
 
const CURRENCY_CACHE_KEY = 'pesona-currency-cache';
const CURRENCY_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
 
const CURRENCY_PAIRS = [
  ['USD', '$',   'US Dollar'],
  ['EUR', '€',   'Euro'],
  ['GBP', '£',   'British Pound'],
  ['AUD', 'A$',  'Australian Dollar'],
  ['SGD', 'S$',  'Singapore Dollar'],
  ['JPY', '¥',   'Japanese Yen'],
  ['MYR', 'RM',  'Malaysian Ringgit'],
  ['KRW', '₩',   'Korean Won'],
];
 
async function loadCurrency() {
  // 1. Try to load from cache first for instant display
  const cached = getCurrencyCache();
  if (cached) {
    displayCurrency(cached.rates, cached.timestamp, true);
  }
 
  // 2. Always fetch fresh if cache expired or missing
  if (!cached || isCacheExpired(cached.timestamp)) {
    try {
      const quotes = CURRENCY_PAIRS.map(p => p[0]).join(',');
      const r = await fetch(
        `https://api.frankfurter.dev/v2/rates?base=IDR&quotes=${quotes}`
      );
      if (!r.ok) throw new Error('API error');
      const d = await r.json();
      const now = Date.now();
 
      // Save to cache
      localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify({
        rates: d.rates,
        timestamp: now
      }));
 
      displayCurrency(d.rates, now, false);
    } catch(e) {
      // If fetch fails and no cache, show fallback
      if (!cached) {
        document.getElementById('currency-rates').innerHTML =
          '<span class="currency-item">Rates temporarily unavailable — please refresh</span>';
      }
      // If cache exists, it already displayed — silent fail is fine
    }
  }
}
 
function displayCurrency(rates, timestamp, fromCache) {
  const el = document.getElementById('currency-rates');
  if (!el) return;
 
  // Format the update time
  const updateDate = new Date(timestamp);
  const timeStr = updateDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
 
  const rateItems = CURRENCY_PAIRS.map(([cur, sym, name]) => {
    const rate = rates[cur];
    if (!rate) return '';
    // Show IDR 10,000 = X for small currencies, IDR 1,000 for JPY/KRW
    const [idrAmount, divisor] = (cur === 'JPY' || cur === 'KRW')
      ? ['IDR 1,000', 1000]
      : ['IDR 10,000', 10000];
    const val = (divisor * rate).toFixed(cur === 'JPY' || cur === 'KRW' ? 2 : 4);
    return `<span class="currency-item" title="${name}">
      ${idrAmount} = <span>${sym}${val}</span>
    </span>`;
  }).filter(Boolean).join('');
 
  el.innerHTML = rateItems;
 
  // Add or update the timestamp display
  const existing = document.getElementById('currency-timestamp');
  const tsHtml = `<span id="currency-timestamp" class="currency-timestamp">
    🕐 Rates updated: ${timeStr}${fromCache ? ' (cached)' : ' (live)'}
  </span>`;
  if (existing) {
    existing.outerHTML = tsHtml;
  } else {
    el.insertAdjacentHTML('afterend', tsHtml);
  }
}
 
function getCurrencyCache() {
  try {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
 
function isCacheExpired(timestamp) {
  return Date.now() - timestamp > CURRENCY_CACHE_TTL;
}

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── INIT ── */
loadWeather();
loadCurrency();
