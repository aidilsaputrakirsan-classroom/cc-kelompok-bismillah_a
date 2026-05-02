/**
 * StatusTimeline — Komponen timeline status laporan
 * Menampilkan progress status: menunggu → diproses → selesai
 * Digunakan di DetailLaporanPage
 */

const STATUS_COLORS = { menunggu: "#f59e0b", diproses: "#3b82f6", selesai: "#10b981" };
const STATUS_ICONS  = { menunggu: "⏳", diproses: "🔄", selesai: "✅" };

const styles = {
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--border)",
  },
  statusTimeline: {
    display: "flex",
    alignItems: "flex-start",
    gap: 0,
    position: "relative",
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  timelineDot: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.125rem",
    marginBottom: "0.5rem",
    zIndex: 1,
    position: "relative",
  },
  timelineLabel: {
    fontSize: "0.8125rem",
    textAlign: "center",
    textTransform: "capitalize",
  },
  timelineLine: {
    position: "absolute",
    top: 22,
    left: "calc(50% + 22px)",
    right: "calc(-50% + 22px)",
    height: 3,
    zIndex: 0,
  },
};

/**
 * @param {string} currentStatus - Status aktif saat ini (menunggu/diproses/selesai)
 */
export default function StatusTimeline({ currentStatus }) {
  const statuses = ["menunggu", "diproses", "selesai"];
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
      <h3 style={styles.sectionTitle}>📊 Status Laporan</h3>
      <div style={styles.statusTimeline}>
        {statuses.map((s, i) => {
          const isActive = i <= currentIndex;
          return (
            <div key={s} style={styles.timelineStep}>
              <div style={{
                ...styles.timelineDot,
                background: isActive ? STATUS_COLORS[s] : "#e2e8f0",
                color: isActive ? "white" : "#94a3b8",
              }}>
                {STATUS_ICONS[s]}
              </div>
              <div style={{
                ...styles.timelineLabel,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < 2 && (
                <div style={{
                  ...styles.timelineLine,
                  background: i < currentIndex ? STATUS_COLORS[statuses[i + 1]] : "#e2e8f0",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
