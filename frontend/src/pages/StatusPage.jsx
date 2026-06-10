import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
const REFRESH_INTERVAL = 10000; // 10 detik

// ── Warna per status ──
const STATUS_COLOR = {
  healthy:    { bg: '#d1fae5', text: '#065f46', border: '#10b981', dot: '#10b981' },
  degraded:   { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', dot: '#f59e0b' },
  unhealthy:  { bg: '#fee2e2', text: '#991b1b', border: '#ef4444', dot: '#ef4444' },
  unreachable:{ bg: '#f1f5f9', text: '#475569', border: '#94a3b8', dot: '#94a3b8' },
};

// ─────────────────────────────────────────────────────────────
// MINI BAR CHART — visual error rate (horizontal progress bar)
// ─────────────────────────────────────────────────────────────
function ErrorRateBar({ errorRate = 0, totalRequests = 0 }) {
  const successRate = Math.max(0, 100 - errorRate);
  const capped = Math.min(errorRate, 100);
  const barColor =
    errorRate === 0  ? '#10b981' :
    errorRate < 5   ? '#f59e0b' :
    '#ef4444';

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500,
      }}>
        <span>Error Rate</span>
        <span style={{ color: barColor, fontWeight: 700 }}>{errorRate.toFixed(1)}%</span>
      </div>

      {/* Bar track */}
      <div style={{ height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: `${successRate}%`, height: '100%',
          background: '#10b981',
          borderRadius: capped > 0 ? '99px 0 0 99px' : 99,
          transition: 'width 0.6s ease',
        }} />
        {capped > 0 && (
          <div style={{
            position: 'absolute', left: `${successRate}%`, top: 0,
            width: `${capped}%`, height: '100%',
            background: barColor,
            borderRadius: '0 99px 99px 0',
            transition: 'width 0.6s ease',
          }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#10b981', display: 'inline-block' }} />
          Sukses {totalRequests > 0 ? Math.round(totalRequests * successRate / 100) : 0} req
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: barColor, display: 'inline-block' }} />
          Error {totalRequests > 0 ? Math.round(totalRequests * capped / 100) : 0} req
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LATENCY MINI BARS (p50 / p95 / p99)
// ─────────────────────────────────────────────────────────────
function LatencyBars({ latency }) {
  if (!latency) return null;
  const max = Math.max(latency.p99_ms || 0, 1);
  const bars = [
    { label: 'p50', value: latency.p50_ms || 0, color: '#2563eb' },
    { label: 'p95', value: latency.p95_ms || 0, color: '#7c3aed' },
    { label: 'p99', value: latency.p99_ms || 0, color: '#ef4444' },
  ];
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
        Latency Percentiles
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{b.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min((b.value / max) * 100, 100)}%`,
                height: '100%', background: b.color, borderRadius: 99,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ width: 46, fontSize: 10, color: b.color, fontWeight: 700, textAlign: 'right' }}>
              {b.value}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICE CARD
// ─────────────────────────────────────────────────────────────
function ServiceCard({ name, icon, healthUrl, metricsUrl }) {
  const [health, setHealth]   = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(healthUrl);
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ status: 'unreachable' });
    }

    if (metricsUrl) {
      try {
        const res = await fetch(metricsUrl);
        const data = await res.json();
        setMetrics(data);
      } catch {
        setMetrics(null);
      }
    }
    setLoading(false);
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const status = health?.status || 'unreachable';
  const colors = STATUS_COLOR[status] || STATUS_COLOR.unreachable;

  const formatUptime = (sec) => {
    if (!sec) return '—';
    if (sec < 60) return `${Math.round(sec)}d`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    return `${Math.round(sec / 3600)}j ${Math.round((sec % 3600) / 60)}m`;
  };

  return (
    <div
      className="status-service-card"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 99,
              background: colors.dot, display: 'inline-block',
              animation: status === 'healthy' ? 'statusPulse 2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: '1.25rem' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {name}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: colors.bg, color: colors.text,
              padding: '3px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {loading ? '…' : status}
            </span>
            {metricsUrl && (
              <button
                onClick={() => setExpanded(v => !v)}
                title={expanded ? 'Sembunyikan detail' : 'Tampilkan detail'}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, cursor: 'pointer', padding: '2px 8px',
                  fontSize: 11, color: 'var(--text-secondary)', transition: 'all 0.2s',
                }}
              >
                {expanded ? '▲' : '▼'}
              </button>
            )}
          </div>
        </div>

        {/* Quick stats grid */}
        {metrics && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8, marginTop: 14,
          }}>
            {[
              { label: 'Total Req',    value: metrics.total_requests ?? '—' },
              { label: 'Errors',       value: metrics.total_errors ?? '—', warn: (metrics.total_errors ?? 0) > 0 },
              { label: 'Avg Latency', value: `${metrics.latency?.avg_ms ?? 0}ms` },
              { label: 'Uptime',      value: formatUptime(metrics.uptime_seconds) },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '0.9375rem', fontWeight: 700,
                  color: s.warn ? '#ef4444' : 'var(--text-primary)',
                }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable detail */}
      {expanded && metrics && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 20px 16px',
          animation: 'fadeInStatus 0.2s ease',
        }}>
          <ErrorRateBar
            errorRate={metrics.error_rate_percent ?? 0}
            totalRequests={metrics.total_requests ?? 0}
          />
          <LatencyBars latency={metrics.latency} />

          {metrics.endpoints && Object.keys(metrics.endpoints).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                Per-Endpoint Stats
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Endpoint', 'Req', 'Err', 'Avg (ms)'].map(h => (
                        <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.endpoints).slice(0, 5).map(([ep, st]) => (
                      <tr key={ep} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '4px 6px', fontFamily: 'monospace', fontSize: 10 }}>{ep}</td>
                        <td style={{ padding: '4px 6px' }}>{st.count}</td>
                        <td style={{ padding: '4px 6px', color: st.errors > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {st.errors}
                        </td>
                        <td style={{ padding: '4px 6px' }}>{st.avg_latency_ms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTO-REFRESH INDICATOR dengan countdown arc SVG
// ─────────────────────────────────────────────────────────────
function RefreshIndicator({ lastChecked, onRefresh, refreshing }) {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  useEffect(() => {
    setCountdown(REFRESH_INTERVAL / 1000);
    const timer = setInterval(() => {
      setCountdown(c => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastChecked]);

  const radius = 8;
  const circ   = 2 * Math.PI * radius;
  const pct    = countdown / (REFRESH_INTERVAL / 1000);
  const dash   = circ * pct;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '10px 16px',
      boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap',
    }}>
      {/* Countdown arc */}
      <svg width={22} height={22} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx={11} cy={11} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={2.5} />
        <circle
          cx={11} cy={11} r={radius} fill="none"
          stroke="var(--primary)" strokeWidth={2.5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear' }}
        />
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
          Auto-refresh dalam <span style={{ color: 'var(--primary)' }}>{countdown}d</span>
        </div>
        {lastChecked && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
            Terakhir diperbarui: <strong>{lastChecked.toLocaleTimeString('id-ID')}</strong>
          </div>
        )}
      </div>

      <button
        id="status-manual-refresh-btn"
        onClick={onRefresh}
        disabled={refreshing}
        style={{
          background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: 6, padding: '5px 12px',
          fontSize: 11, fontWeight: 600,
          cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.6 : 1,
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
        }}
      >
        <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
          🔄
        </span>
        Refresh
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERALL STATUS BANNER
// ─────────────────────────────────────────────────────────────
function OverallStatusBanner() {
  // Placeholder — bisa dikembangkan dengan state callback dari ServiceCard
  return (
    <div style={{
      background: '#f1f5f9', color: '#475569',
      borderRadius: 'var(--radius)', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 20, fontSize: '0.9375rem', fontWeight: 600,
      border: '1px solid #e2e8f0',
      animation: 'fadeInStatus 0.4s ease',
    }}>
      <span style={{ fontSize: '1.25rem' }}>🔎</span>
      Memeriksa status semua layanan…
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICE CONFIG
// ─────────────────────────────────────────────────────────────
const SERVICE_CONFIG = [
  {
    name: 'Auth Service',
    icon: '🔐',
    healthUrl:  `${API_URL}/auth/health`,
    metricsUrl: `${API_URL}/auth/metrics`,
  },
  {
    name: 'Item Service',
    icon: '📦',
    healthUrl:  `${API_URL}/items/health`,
    metricsUrl: `${API_URL}/items/metrics`,
  },
  {
    name: 'API Gateway',
    icon: '🚪',
    healthUrl:  `${API_URL}/health`,
    metricsUrl: null,
  },
];

// ─────────────────────────────────────────────────────────────
// STATUS PAGE — main component
// ─────────────────────────────────────────────────────────────
export default function StatusPage() {
  const [lastChecked, setLastChecked] = useState(new Date());
  const [refreshKey, setRefreshKey]   = useState(0);
  const [refreshing, setRefreshing]   = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setLastChecked(new Date());
    setTimeout(() => setRefreshing(false), 1200);
  };

  useEffect(() => {
    const timer = setInterval(() => setLastChecked(new Date()), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div
        className="container"
        style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 860 }}
      >

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)', flexShrink: 0,
            }}>📊</div>
            <div>
              <h1 id="status-page-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                System Status
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Real-time monitoring semua microservices LaporIn ITK
              </p>
            </div>
          </div>
        </div>

        {/* ── Overall banner ── */}
        <OverallStatusBanner />

        {/* ── Auto-refresh indicator ── */}
        <RefreshIndicator
          lastChecked={lastChecked}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* ── Service cards ── */}
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {SERVICE_CONFIG.map(svc => (
            <ServiceCard key={`${svc.name}-${refreshKey}`} {...svc} />
          ))}
        </div>

        {/* ── Timestamp footer ── */}
        <div style={{
          marginTop: 28, padding: '14px 18px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          display: 'flex', flexWrap: 'wrap', gap: 8,
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            🕐 Terakhir dicek:{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>
              {lastChecked.toLocaleString('id-ID')}
            </strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Auto-refresh setiap <strong>10 detik</strong>
          </div>
        </div>

      </div>

      {/* ── Inline keyframe animations ── */}
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.6); }
        }
        @keyframes fadeInStatus {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .status-service-card:hover {
          box-shadow: var(--shadow-lg) !important;
          transform: translateY(-2px) !important;
        }
        @media (max-width: 540px) {
          .status-service-card div[style*="gridTemplateColumns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
