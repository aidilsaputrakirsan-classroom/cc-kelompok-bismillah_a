import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// ============================================================
// SERVICE CARD
// ============================================================

function ServiceCard({ name, icon, healthUrl, metricsUrl }) {
  const [health, setHealth] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const healthRes = await fetch(healthUrl);
      const healthJson = await healthRes.json();
      setHealth(healthJson);
    } catch {
      setHealth({ status: 'unreachable' });
    }

    if (metricsUrl) {
      try {
        const metricsRes = await fetch(metricsUrl);
        const metricsJson = await metricsRes.json();
        setMetricsData(metricsJson);
      } catch {
        setMetricsData(null);
      }
    }

    setLoading(false);
    setLastChecked(new Date());
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const STATUS_COLORS = {
    healthy:    { bg: '#dcfce7', border: '#16a34a', badge: '#16a34a', dot: '#22c55e' },
    degraded:   { bg: '#fef9c3', border: '#ca8a04', badge: '#ca8a04', dot: '#facc15' },
    unhealthy:  { bg: '#fee2e2', border: '#dc2626', badge: '#dc2626', dot: '#ef4444' },
    unreachable:{ bg: '#f1f5f9', border: '#64748b', badge: '#64748b', dot: '#94a3b8' },
  };

  const status = health?.status || 'unreachable';
  const colors = STATUS_COLORS[status] || STATUS_COLORS.unreachable;

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${Math.round(seconds)}d`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}j`;
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${colors.border}`,
      borderLeft: `5px solid ${colors.border}`,
      padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{name}</h3>
            {lastChecked && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Terakhir: {lastChecked.toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Pulse dot */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: colors.dot,
            boxShadow: `0 0 0 3px ${colors.dot}33`,
            animation: status === 'healthy' ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{
            background: colors.badge,
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {loading ? '...' : status}
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      {metricsData && !loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 4,
        }}>
          {[
            { label: 'Total Req', value: metricsData.total_requests ?? '—' },
            { label: 'Errors', value: metricsData.total_errors ?? '—', warn: metricsData.total_errors > 0 },
            { label: 'Error Rate', value: `${metricsData.error_rate_percent ?? 0}%`, warn: metricsData.error_rate_percent > 5 },
            { label: 'Avg Latency', value: metricsData.latency?.avg_ms ? `${metricsData.latency.avg_ms}ms` : '—' },
            { label: 'p95 Latency', value: metricsData.latency?.p95_ms ? `${metricsData.latency.p95_ms}ms` : '—', warn: metricsData.latency?.p95_ms > 500 },
            { label: 'Uptime', value: formatUptime(metricsData.uptime_seconds) },
          ].map(({ label, value, warn }) => (
            <div key={label} style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '10px 12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>{label}</div>
              <div style={{
                fontSize: 15,
                fontWeight: 800,
                color: warn ? '#dc2626' : '#1e293b',
              }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* No metrics (gateway) */}
      {!metricsUrl && !loading && (
        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
          Metrics tidak tersedia untuk service ini.
        </p>
      )}

      {/* Health details (dependencies) */}
      {health?.dependencies && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
            Dependencies
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(health.dependencies).map(([dep, info]) => (
              <span key={dep} style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 20,
                background: info.status === 'connected' || info.status === 'available' ? '#dcfce7' : '#fee2e2',
                color: info.status === 'connected' || info.status === 'available' ? '#16a34a' : '#dc2626',
                fontWeight: 600,
              }}>
                {dep}: {info.status}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STATUS PAGE
// ============================================================

export default function StatusPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      name: 'Auth Service',
      icon: '🔐',
      healthUrl: `${API_URL}/auth/health`,
      metricsUrl: `${API_URL}/auth/metrics`,
    },
    {
      name: 'Report Service',
      icon: '📋',
      healthUrl: `${API_URL}/reports/health`,
      metricsUrl: `${API_URL}/reports/metrics`,
    },
    {
      name: 'API Gateway',
      icon: '🚪',
      healthUrl: `${API_URL}/health`,
      metricsUrl: null,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        padding: '40px 20px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              borderRadius: 50,
              padding: '8px 20px 8px 10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              marginBottom: 20,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>📊</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                LaporIn ITK — System Status
              </span>
            </div>

            <h1 style={{
              margin: '0 0 8px',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}>
              Monitoring Dashboard
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
              Status real-time semua services — auto-refresh setiap 10 detik
            </p>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>
              🕐 {now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })}
            </p>
          </div>

          {/* Service Cards */}
          <div style={{ display: 'grid', gap: 16 }}>
            {services.map((svc) => (
              <ServiceCard key={svc.name} {...svc} />
            ))}
          </div>

          {/* Footer info */}
          <div style={{
            marginTop: 32,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            fontSize: 13,
            color: '#64748b',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 24px',
          }}>
            <span>🟢 <strong>healthy</strong> — berjalan normal</span>
            <span>🟡 <strong>degraded</strong> — berjalan sebagian</span>
            <span>🔴 <strong>unhealthy</strong> — ada masalah</span>
            <span>⚫ <strong>unreachable</strong> — tidak bisa dihubungi</span>
          </div>
        </div>
      </div>
    </>
  );
}
