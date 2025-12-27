const STATION = 'KMDW';
const REFRESH_MIN = 3;

const tempEl     = document.getElementById('temperature');
const tempFEl    = document.getElementById('temp-f');
const timeEl     = document.getElementById('obs-time');
const windEl     = document.getElementById('wind');
const visEl      = document.getElementById('vis');
const rawEl      = document.getElementById('raw-metar');
const updateEl   = document.getElementById('last-update');
const loadingEl  = document.querySelector('.loading');
const dataEl     = document.querySelector('.data');

async function fetchMetar() {
  try {
    const url = `https://aviationweather.gov/api/data/metar?ids=${STATION}&format=json`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.length) throw new Error('No METAR returned');

    const metar = data[0];  // most recent first

    // Temperature (priority: temp_c → temp → value)
    let tempC = metar.temp_c ?? metar.temp ?? null;
    if (tempC !== null) {
      tempC = Number(tempC);
      tempEl.textContent = `${tempC.toFixed(0)} °C`;
      
      const f = (tempC * 9/5) + 32;
      tempFEl.textContent = `${Math.round(f)} °F`;
    } else {
      tempEl.textContent = '— °C';
      tempFEl.textContent = '— °F';
    }

    // Other fields
    timeEl.textContent   = metar.observation_time?.slice(0,19).replace('T',' ') || '—';
    windEl.textContent   = metar.wind_dir_degrees ? `${metar.wind_dir_degrees}° @ ${metar.wind_speed_kt || '?'} kt` : '—';
    visEl.textContent    = metar.visibility_statute_mi ? `${metar.visibility_statute_mi} SM` : '—';
    rawEl.textContent    = metar.raw_text || '—';

    updateEl.textContent = new Date().toLocaleTimeString([], {timeStyle: 'short'});
    
    loadingEl.classList.add('hidden');
    dataEl.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    loadingEl.textContent = 'Error loading METAR • try again later';
  }
}

// Initial fetch + auto refresh
fetchMetar();
setInterval(fetchMetar, REFRESH_MIN * 60 * 1000);