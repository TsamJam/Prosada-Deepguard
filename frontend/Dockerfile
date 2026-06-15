FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Debug: lihat semua output build
RUN echo "=== Isi /app ===" && ls -la /app && \
    echo "=== Isi .output (jika ada) ===" && ls -la /app/.output 2>/dev/null || true && \
    echo "=== Isi dist (jika ada) ===" && ls -la /app/dist 2>/dev/null || true

FROM nginx:alpine
# Salin nginx.conf dulu
COPY nginx.conf /etc/nginx/conf.d/default.conf

# COPY semua dari builder ke nginx
COPY --from=builder /app /app-build

# Lihat isinya dari nginx container
RUN ls -la /app-build

EXPOSE 80