const server = String(import.meta.env.VITE_CONTROL_SERVER_URL || "").replace(/\/$/, "");

export function serverConfigured() { return Boolean(server); }

async function request(path, payload, options = {}) {
  if (!server) throw new Error("server-not-configured");
  const response = await fetch(`${server}${path}`, {
    method: payload === undefined ? "GET" : "POST",
    headers: payload === undefined ? undefined : {"Content-Type":"application/json"},
    body: payload === undefined ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(options.timeout || 15000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `server-${response.status}`);
  }
  return options.raw ? response : response.json();
}

export const serverApi = {
  status: () => request("/api/integrations/status"),
  publicConfig: () => request("/api/public/config"),
  translate: (text, sourceLanguage, targetLanguage) => request("/api/translate", {text, sourceLanguage, targetLanguage}),
  converse: (message, context) => request("/api/ai/respond", {message, context}),
  route: (origin, destination, options = {}) => request("/api/maps/route", {origin, destination, ...options}),
  youtube: (query) => request("/api/media/youtube", {query}),
  spotify: (query) => request("/api/media/spotify", {query}),
  checkout: (plan, currency, amount, customerEmail) => request("/api/payments/checkout", {plan, currency, amount, customerEmail}),
  speech: (text, language) => request("/api/tts", {text, language}, {raw:true, timeout:30000}),
};
