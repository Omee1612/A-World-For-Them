import React, { useState, useEffect, useRef } from 'react';

// Implements the same logic as react-carbon-footprint using the browser's
// PerformanceObserver API + Sustainable Web Design model constants from co2.js
// No external package needed.

// SWD model constants (from @tgwf/co2 / co2.js Sustainable Web Design model)
const KWH_PER_GB = 0.81;           // kWh per GB transferred
const CARBON_INTENSITY = 0.494;    // global avg gCO2/kWh
const BD_CARBON_INTENSITY = 0.600; // Bangladesh grid gCO2/kWh (coal-heavy)
const BYTES_PER_GB = 1e9;

const calcCO2 = (bytes, intensity = CARBON_INTENSITY) => {
  const gb = bytes / BYTES_PER_GB;
  const kwh = gb * KWH_PER_GB;
  return kwh * intensity * 1000; // return in grams
};

// Custom hook — same behaviour as useCarbonFootprint
const useCarbonFootprint = () => {
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!window.PerformanceObserver) return;

    let total = 0;

    // Catch resources already loaded before the observer was attached
    performance.getEntriesByType('resource').forEach(entry => {
      total += entry.transferSize || 0;
    });
    setBytesTransferred(total);

    observerRef.current = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        total += entry.transferSize || 0;
      });
      setBytesTransferred(total);
    });

    observerRef.current.observe({ type: 'resource', buffered: false });

    return () => observerRef.current?.disconnect();
  }, []);

  const gCO2 = calcCO2(bytesTransferred);
  return [gCO2, bytesTransferred];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatElapsed = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const getRating = (gCO2) => {
  if (gCO2 < 0.5)  return { label: 'Excellent', color: '#2e7d32', bg: '#e8f5e9', emoji: '🌿' };
  if (gCO2 < 2)    return { label: 'Good',      color: '#388e3c', bg: '#f1f8e9', emoji: '🌱' };
  if (gCO2 < 5)    return { label: 'Moderate',  color: '#f57c00', bg: '#fff3e0', emoji: '⚡' };
  if (gCO2 < 10)   return { label: 'High',      color: '#e65100', bg: '#fbe9e7', emoji: '🔥' };
  return             { label: 'Very High',       color: '#c62828', bg: '#ffebee', emoji: '🚨' };
};

const equivalencies = (gCO2) => [
  { icon: '🚗', label: 'Driving a car',      value: `${(gCO2 / 120).toFixed(4)} km`,   desc: 'Avg car emits ~120g CO₂/km' },
  { icon: '📱', label: 'Charging a phone',   value: `${(gCO2 / 8.22).toFixed(4)}x`,    desc: 'One full charge ≈ 8.22g CO₂' },
  { icon: '💡', label: 'LED bulb (1 hr)',    value: `${(gCO2 / 9).toFixed(4)}x`,        desc: '10W LED for 1 hour ≈ 9g CO₂' },
  { icon: '🌳', label: 'Tree absorption',    value: `${(gCO2 / (21000 / 365)).toFixed(5)} days`, desc: 'A tree absorbs ~21kg CO₂/year' },
];

// Mini SVG sparkline
const Sparkline = ({ data, color }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.gCO2), 0.001);
  const W = 400, H = 60;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.gCO2 / max) * (H - 10) - 5;
    return `${x},${y}`;
  }).join(' ');
  const lastX = W;
  const lastY = H - (data[data.length - 1].gCO2 / max) * (H - 10) - 5;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#grad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
    </svg>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const CarbonPage = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [history, setHistory] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const sessionStart = useRef(Date.now());

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Sample every 5 seconds for the chart
  useEffect(() => {
    setHistory(prev => {
      const entry = { time: elapsed, gCO2: parseFloat(gCO2.toFixed(5)) };
      const updated = [...prev, entry];
      return updated.slice(-24);
    });
  }, [Math.floor(elapsed / 5)]);

  const adjustedCO2 = calcCO2(bytesTransferred, BD_CARBON_INTENSITY);
  const rating = getRating(gCO2);
  const eq = equivalencies(gCO2);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1f0d, #1a2e1a)', padding: '48px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(61,107,79,0.3) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #2e7d32, #66bb6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 16px rgba(46,125,50,0.4)' }}>🌍</div>
            <div>
              <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', margin: 0 }}>Carbon Footprint</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>Real-time CO₂ emissions from your current browsing session</p>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${rating.color}33`, border: `1px solid ${rating.color}66`, borderRadius: 50, padding: '6px 18px' }}>
            <span>{rating.emoji}</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>Session Rating: {rating.label}</span>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 32 }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 20, marginBottom: 28 }}>
          {[
            {
              label: '🌱 CO₂ (Global Model)', value: gCO2.toFixed(4), unit: 'grams CO₂e',
              color: rating.color, bg: rating.bg, desc: 'Sustainable Web Design model',
            },
            {
              label: '🇧🇩 Adjusted for BD Grid', value: adjustedCO2.toFixed(4), unit: 'grams CO₂e',
              color: 'var(--terracotta)', bg: '#fff8f5', desc: 'BD grid: ~0.6 kg CO₂/kWh',
            },
            {
              label: '📡 Data Transferred', value: formatBytes(bytesTransferred), unit: 'network usage',
              color: '#1565c0', bg: '#e3f2fd', desc: 'API calls, images, scripts',
            },
            {
              label: '⏱️ Session Duration', value: formatElapsed(elapsed), unit: 'active time',
              color: '#7b5ea7', bg: '#f3e5f5', desc: 'Since you opened StrayPaws',
            },
          ].map(card => (
            <div key={card.label} className="card" style={{ padding: 24, textAlign: 'center', border: `2px solid ${card.color}30`, background: card.bg }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: card.color, marginBottom: 10 }}>{card.label}</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', color: card.color, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '0.9rem', color: card.color, marginTop: 4, fontWeight: 600 }}>{card.unit}</div>
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--slate)' }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        {history.length >= 2 && (
          <div className="card" style={{ padding: 28, marginBottom: 28 }}>
            <h4 style={{ marginBottom: 4 }}>📈 Emissions Over Time</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginBottom: 16 }}>Sampled every 5 seconds · {history.length} data points</p>
            <Sparkline data={history} color={rating.color} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate)', marginTop: 6 }}>
              <span>Session start</span><span>Now ({formatElapsed(elapsed)})</span>
            </div>
          </div>
        )}

        {/* Equivalencies */}
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h4 style={{ marginBottom: 4 }}>🔍 What does {gCO2.toFixed(4)}g CO₂ equal?</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginBottom: 20 }}>Putting your session's emissions into perspective</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
            {eq.map(e => (
              <div key={e.label} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{e.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)', marginBottom: 4 }}>{e.value}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--terracotta)', marginBottom: 4 }}>{e.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works + Tips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card" style={{ padding: 28 }}>
            <h4 style={{ marginBottom: 16 }}>⚙️ How This Works</h4>
            {[
              { icon: '🔭', title: 'PerformanceObserver API', desc: "The browser's built-in API tracks every network resource loaded — API responses, images, scripts, fonts." },
              { icon: '📐', title: 'Sustainable Web Design Model', desc: 'Bytes are converted to kWh (0.81 kWh/GB) then to CO₂ using carbon intensity of the electricity grid.' },
              { icon: '⚡', title: 'Energy Intensity', desc: 'Covers data centre energy, network transmission, and end-user device energy consumption.' },
              { icon: '🇧🇩', title: 'Bangladesh Adjustment', desc: "Uses BD's grid intensity (~0.6 kg CO₂/kWh) vs the global average (0.494 kg CO₂/kWh)." },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate)', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, #f1f8e9, #e8f5e9)', border: '1px solid #c8e6c9' }}>
            <h4 style={{ marginBottom: 16, color: '#2e7d32' }}>🌿 Tips to Reduce Your Footprint</h4>
            {[
              'Upload compressed images — WebP format cuts size by ~30%',
              'Avoid uploading very large photos unnecessarily',
              'Close unused tabs to reduce background network requests',
              'WiFi is generally greener than mobile data',
              'Fewer page navigations = less data = less CO₂',
              'Dark mode uses less energy on OLED/AMOLED screens',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ color: '#2e7d32', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#1b5e20', lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '14px 20px', background: '#f5f5f5', borderRadius: 'var(--radius-md)', border: '1px solid #e0e0e0' }}>
          <p style={{ fontSize: '0.78rem', color: '#757575', margin: 0, lineHeight: 1.7 }}>
            <strong>Note:</strong> These are estimates based on the Sustainable Web Design model and only cover network data transfer during this browser session. They exclude server-side energy, hardware manufacturing, and background processes. The Bangladesh grid adjustment uses published average carbon intensity data which may vary by time of day.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CarbonPage;
