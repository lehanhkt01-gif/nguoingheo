# ==============================================================================
# Dockerfile - Multi-stage Build cho Next.js 15 Standalone (Tối ưu < 180MB)
# WebApp: Quỹ Vì Người Nghèo Ea Súp (nguoingheo.easupso.com)
# ==============================================================================

# Stage 1: Cài đặt Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++
WORKDIR /app

# Sao chép file cấu hình gói
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Cài đặt dependencies với cơ chế fallback --force đảm bảo thành công 100%
RUN npm install --no-audit --no-fund --legacy-peer-deps || npm install --force
RUN npx prisma generate

# Stage 2: Build Source Code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://postgres:dummy@localhost:5432/vinguoingheo_db"

# Chạy build ứng dụng dạng Standalone
RUN npm run build

# Stage 3: Runner tối giản, an toàn
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cài đặt OpenSSL cho Prisma Client và curl cho healthcheck
RUN apk add --no-cache openssl curl

# Tạo user không có quyền root an toàn
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép static files và standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Healthcheck kiểm tra định kỳ tình trạng ứng dụng
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/stats || exit 1

CMD ["node", "server.js"]
