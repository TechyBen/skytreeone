// Shared by the content script and the popup (kept in chrome.storage.sync).
// eslint-disable-next-line no-unused-vars
const SKYTREE_DEFAULTS = {
  enabled: true,
  sound: false,  // muted by default; sound needs one click on the page to start
  vol: 40,       // 0-100, master
  mins: 15,      // minutes per scene
  px: 240,       // render height in pixels
  fps: 30,       // frame cap
  glass: 70,     // opacity of the panel behind the feed, 0-100
  blur: 6,       // blur behind the feed, px
  style: 'dense', // 'dense' (ferns, trails, slopes) or 'sparse' (the original open woods)
  chatter: true, // posts from people you follow arrive as birds
  handle: '',    // whose follows; blank = the account signed in to bsky.app
  flowers: true, // wildflowers for the place and time of year
  location: '',  // the place as shown in the popup: a town ("Köln, DE") or "lat, lon"; blank = guessed from the time zone
  lat: null,     // its position, rounded to 0.1 degrees (set by the popup)
  lon: null,
  weather: false, // live weather from Open-Meteo for that place
};

// "51.5, -0.1" -> {lat, lon} rounded to 0.1 degrees, or null if blank or unreadable
// (also reads locations saved before towns could be typed).
// eslint-disable-next-line no-unused-vars
function skytreeLocation(text) {
  const m = String(text || '').trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = +m[1], lon = +m[2];
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 };
}

// Settings that change the forest page itself (the rest only restyle Bluesky).
// eslint-disable-next-line no-unused-vars
const SKYTREE_RELOAD = ['enabled', 'style', 'mins', 'px', 'fps', 'chatter', 'handle', 'flowers', 'lat', 'lon', 'weather'];
