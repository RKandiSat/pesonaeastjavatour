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
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
async function loadCurrency() {
  try {
    const r = await fetch('https://api.frankfurter.dev/v2/rates?base=IDR&quotes=USD,EUR,GBP,AUD,SGD');
    const d = await r.json();
    const rates = d.rates;
    const pairs = [['USD','$'], ['EUR','€'], ['GBP','£'], ['AUD','A$'], ['SGD','S$']];
    document.getElementById('currency-rates').innerHTML = pairs.map(([cur, sym]) => {
      const val = rates[cur] ? (10000 * rates[cur]).toFixed(4) : '—';
      return `<span class="currency-item">IDR 10,000 = <span>${sym}${val}</span></span>`;
    }).join('');
  } catch(e) {
    document.getElementById('currency-rates').innerHTML =
      '<span class="currency-item">Rates temporarily unavailable</span>';
  }
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
