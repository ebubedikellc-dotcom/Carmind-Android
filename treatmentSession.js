function deviceId() {
  const key = "cm-device-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export async function redeemTreatmentFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("treatment");
  if (!token) return null;
  const server = String(import.meta.env.VITE_CONTROL_SERVER_URL || "").replace(/\/$/, "");
  if (!server) return { active: false, message: "Treatment server is not configured for this build." };
  try {
    const response = await fetch(`${server}/api/treatment/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, deviceId: deviceId() }),
    });
    const result = await response.json();
    url.searchParams.delete("treatment");
    history.replaceState({}, "", url);
    if (!response.ok) return { active: false, message: result.error || "Treatment link could not be accepted." };
    sessionStorage.setItem("cm-treatment-session", result.sessionToken);
    return { active: true, expiresAt: result.expiresAt, scope: result.scope || [] };
  } catch {
    return { active: false, message: "Carmind could not reach the treatment server." };
  }
}
