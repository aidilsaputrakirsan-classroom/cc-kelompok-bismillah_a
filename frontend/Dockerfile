# ============================================================
# LaporIn ITK — Dockerfile (Frontend) - MULTI-STAGE BUILD
# Lead Frontend: Firni Fauziah Ramadhini
# Modul 6: Optimasi & Dokumentasi Multi-Container
# Target: image < 50 MB
# ============================================================

# ────────────────────────────────────────────────
# STAGE 1: builder — install deps & build React
# ────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files dulu (cache optimization)
COPY package.json package-lock.json* ./

# npm ci = clean install dari lock file (lebih cepat & reproducible)
RUN npm ci

# Copy seluruh source code
COPY . .

# Set API URL untuk production build
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build React → output di /app/dist/
RUN npm run build

# ────────────────────────────────────────────────
# STAGE 2: production — serve pakai Nginx
# Hanya berisi: nginx + file dist/ hasil build
# TIDAK ada: node_modules (300MB+), source code
# ────────────────────────────────────────────────
FROM nginx:alpine

# Copy hasil build dari stage 1
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy nginx config yang sudah production-ready
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]