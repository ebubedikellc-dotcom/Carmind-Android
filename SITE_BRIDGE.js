/* Optional CarMind website helper.
   Add this to carmindai.online once the web team is ready. The Android app also
   injects a compatible bridge automatically, so the app can already expose
   native commands to the website. */
(function () {
  const native = () => window.CarMindApp || null;
  window.CarMind = window.CarMind || {};
  window.CarMind.speak = text => native()?.speak(text);
  window.CarMind.listen = () => native()?.listen();
  window.CarMind.navigate = destination => native()?.action('navigate', { destination });
  window.CarMind.music = query => native()?.action('music', { query });
  window.CarMind.video = query => native()?.action('video', { query });
  window.CarMind.call = contact => native()?.action('call', { contact });
  window.CarMind.message = (contact, message) => native()?.action('message', { contact, message });
  window.CarMind.setAssistantName = name => native()?.setAssistantName(name);
  window.CarMind.setWakeListening = enabled => native()?.setContinuousListening(enabled);
})();

// v3 additions: route and car-mode controls.
window.CarMindRoute = window.CarMindRoute || {
  instruction: function(text) {
    if (window.CarMindApp) window.CarMindApp.action('route_instruction', { text: String(text || '') });
  },
  destination: function(destination) {
    if (window.CarMindApp) window.CarMindApp.action('set_destination', { destination: String(destination || '') });
  },
  announcePlaces: function(enabled) {
    if (window.CarMindApp) window.CarMindApp.action('announce_places', { enabled: !!enabled });
  },
  carMode: function(enabled) {
    if (window.CarMindApp) window.CarMindApp.action('car_mode', { enabled: !!enabled });
  }
};
