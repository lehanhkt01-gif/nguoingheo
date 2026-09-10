#!/bin/bash
# ==============================================================================
# SCRIPT THIẾT LẬP HỆ THỐNG CLOUDFLARE DATABASE & EDGE: NGUOINGHEO.EASUPSO.COM
# ==============================================================================

set -e

echo "=== KHỞI TẠO HỆ THỐNG CLOUDFLARE (D1, KV, R2, AI) CHO NGUOINGHEO.EASUPSO.COM ==="

# 1. Cài đặt hoặc kiểm tra Wrangler CLI
if ! command -v wrangler &> /dev/null; then
  echo "Đang cài đặt Cloudflare Wrangler CLI..."
  npm install -g wrangler
fi

# 2. Tạo Cơ sở dữ liệu Cloudflare D1
echo "1. Đang tạo cơ sở dữ liệu Cloudflare D1: nguoingheo_db..."
wrangler d1 create nguoingheo_db || true

# 3. Tạo Cloudflare KV Namespace
echo "2. Đang tạo Cloudflare KV Namespace: FUND_KV..."
wrangler kv:namespace create FUND_KV || true

# 4. Tạo Cloudflare R2 Bucket (Lưu trữ ảnh hóa đơn scan)
echo "3. Đang tạo Cloudflare R2 Bucket: nguoingheo-proofs..."
wrangler r2 bucket create nguoingheo-proofs || true

# 5. Chạy Migration tạo bảng & nạp dữ liệu mẫu vào D1
echo "4. Đang khởi tạo bảng D1 (schema.sql) và nạp seed data 20 thôn buôn..."
wrangler d1 execute nguoingheo_db --file=cloudflare/d1/schema.sql --remote || true
wrangler d1 execute nguoingheo_db --file=cloudflare/d1/seed.sql --remote || true

# 6. Triển khai Worker lên Cloudflare Edge
echo "5. Đang Deploy Cloudflare Worker API lên tên miền nguoingheo.easupso.com..."
wrangler deploy --config cloudflare/wrangler.toml || true

echo "=== HOÀN TẤT THIẾT LẬP HỆ THỐNG CLOUDFLARE ==="
