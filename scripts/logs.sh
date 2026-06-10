#!/bin/bash
# ============================================================
# Log Helper Script — LaporIn ITK Microservices
# ============================================================
# Mempermudah debugging dan monitoring log di Docker Compose.
#
# Usage:
#   ./scripts/logs.sh all            → Lihat semua log services
#   ./scripts/logs.sh errors         → Hanya log ERROR
#   ./scripts/logs.sh trace <id>     → Cari berdasarkan correlation ID
#   ./scripts/logs.sh metrics        → Fetch metrics dari semua services
#   ./scripts/logs.sh health         → Cek health semua services
# ============================================================

GATEWAY_URL="${GATEWAY_URL:-http://localhost}"

case "$1" in
  all)
    echo "📋 Showing all backend service logs..."
    docker compose logs -f auth-service report-service
    ;;

  errors)
    echo "❌ Showing ERROR logs only..."
    docker compose logs auth-service report-service 2>&1 | grep '"level":"ERROR"'
    ;;

  warnings)
    echo "⚠️  Showing WARNING + ERROR logs..."
    docker compose logs auth-service report-service 2>&1 | grep -E '"level":"(WARNING|ERROR)"'
    ;;

  trace)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/logs.sh trace <correlation-id>"
      echo "Example: ./scripts/logs.sh trace a1b2c3d4"
      exit 1
    fi
    echo "🔗 Tracing correlation ID: $2"
    docker compose logs auth-service report-service 2>&1 | grep "$2"
    ;;

  metrics)
    echo "📊 Fetching metrics from all services..."
    echo ""
    echo "━━━ Auth Service ━━━"
    curl -s "${GATEWAY_URL}/auth/metrics" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  ⚠️  Auth Service metrics unavailable"
    echo ""
    echo "━━━ Report Service ━━━"
    curl -s "${GATEWAY_URL}/reports/metrics" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  ⚠️  Report Service metrics unavailable"
    ;;

  health)
    echo "🏥 Checking health of all services..."
    echo ""
    echo -n "  Gateway:        "
    curl -s "${GATEWAY_URL}/health" 2>/dev/null || echo "❌ unreachable"
    echo ""
    echo -n "  Auth Service:   "
    curl -s "${GATEWAY_URL}/auth/health" 2>/dev/null || echo "❌ unreachable"
    echo ""
    echo -n "  Report Service: "
    curl -s "${GATEWAY_URL}/reports/health" 2>/dev/null || echo "❌ unreachable"
    echo ""
    ;;

  export)
    FILENAME="logs/all-services-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    echo "💾 Exporting logs to ${FILENAME}..."
    docker compose logs --no-color auth-service report-service > "${FILENAME}"
    echo "✅ Logs exported: ${FILENAME} ($(wc -l < "${FILENAME}") lines)"
    ;;

  *)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📋 LaporIn ITK — Log Helper Script"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: ./scripts/logs.sh <command>"
    echo ""
    echo "Commands:"
    echo "  all          Lihat log semua backend services (follow mode)"
    echo "  errors       Hanya tampilkan log level ERROR"
    echo "  warnings     Tampilkan log level WARNING + ERROR"
    echo "  trace <id>   Cari log berdasarkan correlation ID"
    echo "  metrics      Fetch /metrics dari semua services"
    echo "  health       Cek /health semua services"
    echo "  export       Export log ke file (logs/all-services-YYYYMMDD.log)"
    echo ""
    ;;
esac
