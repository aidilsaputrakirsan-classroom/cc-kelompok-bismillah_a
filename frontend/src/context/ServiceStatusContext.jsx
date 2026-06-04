import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

/**
 * ServiceStatusContext — Konteks global untuk memantau status ketersediaan layanan.
 *
 * Digunakan untuk:
 * - Mendeteksi auth service down (circuit breaker OPEN → error 503)
 * - Menampilkan banner global "Some features temporarily unavailable"
 * - Menyediakan retry logic terpusat
 *
 * Komponen mana pun bisa subscribe ke status ini via useServiceStatus()
 */

const ServiceStatusContext = createContext(null);

// ============================================================
// EVENT BUS — api.js akan dispatch event ini saat terjadi error
// ============================================================

/** Dipanggil oleh api.js saat mendapat 502/503/504 atau network error */
export function notifyServiceError(type = "service") {
  window.dispatchEvent(new CustomEvent("laporin:service-error", { detail: { type } }));
}

/** Dipanggil oleh api.js saat request berhasil (service pulih) */
export function notifyServiceRecovered() {
  window.dispatchEvent(new CustomEvent("laporin:service-recovered"));
}

// ============================================================
// PROVIDER
// ============================================================

export function ServiceStatusProvider({ children }) {
  const [authDown, setAuthDown] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const recoveryTimer = useRef(null);

  const markAuthDown = useCallback(() => setAuthDown(true), []);
  const markServiceDown = useCallback(() => setServiceDown(true), []);
  const clearStatus = useCallback(() => {
    setAuthDown(false);
    setServiceDown(false);
  }, []);

  // Dengarkan events dari api.js
  useEffect(() => {
    const onServiceError = (e) => {
      const { type } = e.detail || {};
      if (type === "auth") markAuthDown();
      else markServiceDown();
    };

    const onRecovered = () => {
      // Beri jeda singkat sebelum hilangkan banner (hindari flicker)
      if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
      recoveryTimer.current = setTimeout(clearStatus, 1500);
    };

    window.addEventListener("laporin:service-error", onServiceError);
    window.addEventListener("laporin:service-recovered", onRecovered);

    return () => {
      window.removeEventListener("laporin:service-error", onServiceError);
      window.removeEventListener("laporin:service-recovered", onRecovered);
      if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
    };
  }, [markAuthDown, markServiceDown, clearStatus]);

  return (
    <ServiceStatusContext.Provider
      value={{ authDown, serviceDown, markAuthDown, markServiceDown, clearStatus }}
    >
      {children}
    </ServiceStatusContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useServiceStatus() {
  const ctx = useContext(ServiceStatusContext);
  if (!ctx) throw new Error("useServiceStatus must be used inside ServiceStatusProvider");
  return ctx;
}
