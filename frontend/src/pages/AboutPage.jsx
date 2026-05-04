import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function AboutPage() {
  const team = [
    { name: "Aditya Laksamana P Butar Butar", nim: "10231006", role: "Lead Backend" },
    { name: "Firni Fauziah Ramadhini", nim: "10231038", role: "Lead Frontend" },
    { name: "Muhammad Novri Aziztra", nim: "10231066", role: "Lead DevOps" },
    { name: "Salsabila Putri Zahrani", nim: "10231086", role: "Lead QA & Docs" },
  ];

  const techStack = [
    { name: "FastAPI", layer: "Backend", icon: "⚡" },
    { name: "PostgreSQL", layer: "Database", icon: "🐘" },
    { name: "React 19", layer: "Frontend", icon: "⚛️" },
    { name: "Vite", layer: "Build Tool", icon: "🚀" },
    { name: "Docker", layer: "Container", icon: "🐳" },
    { name: "GitHub Actions", layer: "CI/CD", icon: "🔄" },
  ];

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <Link to="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          color: "#2563eb", textDecoration: "none", marginBottom: "1.5rem",
          fontSize: "0.95rem", fontWeight: 500,
        }}>
          ← Kembali ke Dashboard
        </Link>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          📋 About LaporIn ITK
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Sistem Pelaporan Digital Institut Teknologi Kalimantan — dibangun untuk
          mata kuliah Komputasi Awan.
        </p>

        {/* Tech Stack */}
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
          🏗️ Tech Stack
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem", marginBottom: "2.5rem",
        }}>
          {techStack.map((tech) => (
            <div key={tech.name} style={{
              padding: "1rem", borderRadius: "12px",
              border: "1px solid #e2e8f0", background: "#f8fafc",
            }}>
              <span style={{ fontSize: "1.5rem" }}>{tech.icon}</span>
              <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>{tech.name}</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{tech.layer}</div>
            </div>
          ))}
        </div>

        {/* Tim */}
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
          👥 Tim Pengembang — Kelompok Bismillah_A
        </h2>
        <table style={{
          width: "100%", borderCollapse: "collapse",
          border: "1px solid #e2e8f0", borderRadius: "8px",
          overflow: "hidden",
        }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Nama</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>NIM</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Peran</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m, i) => (
              <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 16px" }}>{m.name}</td>
                <td style={{ padding: "12px 16px" }}>{m.nim}</td>
                <td style={{ padding: "12px 16px" }}>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AboutPage;