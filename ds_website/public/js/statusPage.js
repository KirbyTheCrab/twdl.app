const REFRESH_MS = 30000;
const HISTORY_WINDOW_MS = 60 * 60 * 1000;
const HISTORY_KEY = "twdl-status-history-v1";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // LocalStorage may be unavailable in strict privacy contexts.
  }
}

function pruneHistory(history, nowTs) {
  return history
    .filter((point) => point && Number.isFinite(point.ts) && (nowTs - point.ts) <= HISTORY_WINDOW_MS)
    .slice(-130);
}

function addHistorySample(sample) {
  const nowTs = sample.ts;
  const history = pruneHistory(loadHistory(), nowTs);
  history.push(sample);
  const cleaned = pruneHistory(history, nowTs);
  saveHistory(cleaned);
  return cleaned;
}

function resolveThemeColor(cssVarName, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
  return value || fallback;
}

function renderSparkline(svgId, points, cssVarName, fallbackColor) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const color = resolveThemeColor(cssVarName, fallbackColor);

  const width = 320;
  const height = 88;
  const pad = 7;

  if (!points.length) {
    svg.innerHTML = "";
    return;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((value, idx) => {
    const x = pad + (idx * ((width - pad * 2) / Math.max(1, points.length - 1)));
    const normalized = (value - min) / range;
    const y = (height - pad) - (normalized * (height - pad * 2));
    return [x, y];
  });

  const polylinePoints = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPoints = [
    `${pad},${height - pad}`,
    ...coords.map(([x, y]) => `${x},${y}`),
    `${coords[coords.length - 1][0]},${height - pad}`,
  ].join(" ");

  const latest = coords[coords.length - 1];

  svg.innerHTML = `
    <polyline points="${areaPoints}" fill="${color}" fill-opacity="0.14" stroke="none"></polyline>
    <polyline points="${polylinePoints}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"></polyline>
    <circle cx="${latest[0]}" cy="${latest[1]}" r="3.2" fill="${color}"></circle>
  `;
}

function updateTrendUI(history) {
  const latencySeries = history
    .map((point) => point.latency)
    .filter((value) => Number.isFinite(value));
  const reliabilitySeries = history
    .map((point) => point.reliability)
    .filter((value) => Number.isFinite(value));

  renderSparkline("latency-sparkline", latencySeries, "--accent", "#2bc0ff");
  renderSparkline("reliability-sparkline", reliabilitySeries, "--ok", "#46d98c");

  const latestLatency = latencySeries[latencySeries.length - 1];
  const latestReliability = reliabilitySeries[reliabilitySeries.length - 1];

  setText(
    "latency-trend-current",
    Number.isFinite(latestLatency) ? `${Math.round(latestLatency)} ms` : "N/A"
  );
  setText(
    "reliability-trend-current",
    Number.isFinite(latestReliability) ? `${Math.round(latestReliability)}/100` : "N/A"
  );

  if (latencySeries.length) {
    const low = Math.min(...latencySeries);
    const high = Math.max(...latencySeries);
    setText("latency-trend-range", `Range: ${Math.round(low)}-${Math.round(high)} ms`);
    const avg = latencySeries.reduce((sum, value) => sum + value, 0) / latencySeries.length;
    setText("latency-average", `${Math.round(avg)} ms`);
  } else {
    setText("latency-trend-range", "Range: N/A");
    setText("latency-average", "N/A");
  }

  if (reliabilitySeries.length) {
    const low = Math.min(...reliabilitySeries);
    const high = Math.max(...reliabilitySeries);
    setText("reliability-trend-range", `Range: ${Math.round(low)}-${Math.round(high)}/100`);
  } else {
    setText("reliability-trend-range", "Range: N/A");
  }

  const fullyOnline = history.filter((point) => point.websiteOnline && point.botOnline).length;
  const availabilityPct = history.length ? Math.round((fullyOnline / history.length) * 100) : 0;
  setText("availability-rate", history.length ? `${availabilityPct}%` : "N/A");
  setText("trend-samples", String(history.length));
}

function fmtNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat().format(value);
}

function fmtSeconds(total) {
  if (typeof total !== "number" || Number.isNaN(total)) return "N/A";

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

function statusDot(isOnline) {
  return isOnline ? "online" : "offline";
}

function statusWord(isOnline) {
  return isOnline ? "Online" : "Offline";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setDot(id, isOnline) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("online", "offline");
  el.classList.add(statusDot(isOnline));
}

function computeReliabilityScore(payload) {
  const websiteOnline = payload?.website?.online ? 1 : 0;
  const botOnline = payload?.bot?.online ? 1 : 0;
  const latency = payload?.bot?.latencyMs;

  let latencyScore = 0.7;
  if (typeof latency === "number") {
    if (latency <= 80) latencyScore = 1;
    else if (latency <= 140) latencyScore = 0.9;
    else if (latency <= 200) latencyScore = 0.8;
    else if (latency <= 300) latencyScore = 0.65;
    else latencyScore = 0.45;
  }

  const weighted = (websiteOnline * 0.4) + (botOnline * 0.4) + (latencyScore * 0.2);
  return clamp(Math.round(weighted * 100), 0, 100);
}

async function loadStatus() {
  try {
    const res = await fetch("/api/status/metrics", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Status request failed: ${res.status}`);
    }

    const payload = await res.json();

    const websiteOnline = Boolean(payload?.website?.online);
    const botOnline = Boolean(payload?.bot?.online);

    setDot("site-dot", websiteOnline);
    setDot("bot-dot", botOnline);

    setText("site-status", statusWord(websiteOnline));
    setText("bot-status", statusWord(botOnline));

    setText("site-uptime", fmtSeconds(payload?.website?.uptimeSeconds));
    setText("bot-uptime", fmtSeconds(payload?.bot?.uptimeSeconds));

    setText("guild-count", fmtNumber(payload?.bot?.guildCount));
    setText("member-count", fmtNumber(payload?.bot?.memberCount));
    setText("cached-user-count", fmtNumber(payload?.bot?.cachedUserCount));
    setText("command-count", fmtNumber(payload?.bot?.commandCount));
    setText("event-count", fmtNumber(payload?.bot?.eventCount));
    const latencyText = typeof payload?.bot?.latencyMs === "number" ? `${payload.bot.latencyMs} ms` : "N/A";
    setText("latency", latencyText);
    setText("latency-secondary", latencyText);

    setText("memory-rss", fmtNumber(payload?.website?.memoryRssMb));
    setText("memory-heap", fmtNumber(payload?.website?.heapUsedMb));
    setText("node-version", payload?.website?.nodeVersion || "N/A");
    setText("platform", payload?.website?.platform || "N/A");

    const score = computeReliabilityScore(payload);
    setText("reliability-score", `${score}/100`);
    const meter = document.getElementById("health-meter-fill");
    if (meter) meter.style.width = `${score}%`;

    const history = addHistorySample({
      ts: Date.now(),
      websiteOnline,
      botOnline,
      latency: typeof payload?.bot?.latencyMs === "number" ? payload.bot.latencyMs : null,
      reliability: score,
    });
    updateTrendUI(history);

    setText("status-timestamp", `Last updated: ${new Date(payload?.generatedAt || Date.now()).toLocaleString()}`);
  } catch (error) {
    setText("status-timestamp", "Unable to fetch live status right now.");
    setDot("site-dot", false);
    setDot("bot-dot", false);
    setText("site-status", "Unavailable");
    setText("bot-status", "Unavailable");
    const history = addHistorySample({
      ts: Date.now(),
      websiteOnline: false,
      botOnline: false,
      latency: null,
      reliability: 0,
    });
    updateTrendUI(history);
  }
}

updateTrendUI(pruneHistory(loadHistory(), Date.now()));
loadStatus();
setInterval(loadStatus, REFRESH_MS);
