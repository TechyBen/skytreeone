const UNITS = { vol: '%', glass: '%', blur: ' px', mins: ' min', px: ' px', fps: ' fps' };

chrome.storage.sync.get(SKYTREE_DEFAULTS).then(cfg => {
  for (const key of Object.keys(SKYTREE_DEFAULTS)) {
    const el = document.getElementById(key);
    if (!el) continue;
    const out = document.querySelector(`output[for="${key}"]`);
    const show = () => { if (out) out.textContent = el.value + (UNITS[key] || ''); };
    if (el.type === 'checkbox') {
      el.checked = cfg[key];
      el.addEventListener('change', () => chrome.storage.sync.set({ [key]: el.checked }));
    } else if (el.tagName === 'SELECT') {
      el.value = cfg[key];
      el.addEventListener('change', () => chrome.storage.sync.set({ [key]: el.value }));
    } else if (key === 'location') {
      // A town from the forest's built-in list, or "lat, lon": looked up
      // here, never online. Only the rounded position reaches the forest.
      el.value = cfg[key];
      const note = document.getElementById('location-note'), said = note.textContent;
      el.addEventListener('change', async () => {
        const text = el.value.trim();
        if (!text) {
          note.textContent = said;
          chrome.storage.sync.set({ location: '', lat: null, lon: null });
          return;
        }
        const { findPlace } = await import('./tree/src/cities.js');
        const at = await findPlace(text);
        if (!at) {
          note.textContent = 'Not in the built-in list (towns of 15,000+). Try a bigger town nearby, or lat, lon like 51.5, -0.1.';
          return;
        }
        el.value = at.label;
        const pos = `${at.lat}, ${at.lon}`;
        note.textContent = `${at.label === pos ? pos : `${at.label}: ${pos}`}. Only this rounded position is used.`;
        chrome.storage.sync.set({ location: at.label, lat: at.lat, lon: at.lon });
      });
    } else if (el.type === 'text') {
      el.value = cfg[key];
      el.addEventListener('change', () => chrome.storage.sync.set({ [key]: el.value.trim().replace(/^@/, '') }));
    } else {
      el.value = cfg[key];
      show();
      el.addEventListener('input', show);
      // Sliders that reload the forest save on release; the rest save live.
      const ev = SKYTREE_RELOAD.includes(key) ? 'change' : 'input';
      el.addEventListener(ev, () => chrome.storage.sync.set({ [key]: +el.value }));
    }
  }
});

// Wander: ask the content script in this tab to switch the forest to the front.
document.getElementById('wander').addEventListener('click', async () => {
  const note = document.getElementById('wander-note');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const ok = await chrome.tabs.sendMessage(tab.id, 'skytree:wander');
    if (ok) window.close();
    else note.textContent = 'Turn on “Forest behind Bluesky” first.';
  } catch {
    note.textContent = 'Open bsky.app in this tab first.';
  }
});
