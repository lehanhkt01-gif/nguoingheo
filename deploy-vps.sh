#!/bin/bash
# ==============================================================================
# KỊCH BẢN TỰ ĐỘNG CÀI ĐẶT & TRIỂN KHAI 1-CHẠM TRÊN CLOUD SERVER VPS (THƯ MỤC /var/www/nguoingheo)
# Ứng dụng: Quỹ Vì Người Nghèo Xã Ea Súp (nguoingheo.easupso.com)
# Cấu hình máy chủ mục tiêu: CPU 04 Core, RAM 08 GB, SSD 80 GB, Ubuntu 22.04/24.04 LTS
# ==============================================================================

set -e

# Màu sắc thông báo
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}  KHỞI CHẠY TRIỂN KHAI: QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP (nguoingheo.easupso.com)${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[LỖI] Vui lòng chạy script này với quyền root: sudo bash deploy-vps.sh${NC}"
  exit 1
fi

# 2. Cập nhật hệ điều hành
echo -e "\n${YELLOW}[1/7] Đang cập nhật gói hệ điều hành Ubuntu...${NC}"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw unzip ca-certificates gnupg lsb-release

# 3. Cài đặt Docker Engine & Docker Compose Plugin mới nhất
echo -e "\n${YELLOW}[2/7] Đang cài đặt Docker Engine & Docker Compose mới nhất...${NC}"
if ! command -v docker &> /dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}Docker đã được cài đặt thành công!${NC}"
else
  echo -e "${GREEN}Docker đã được cài đặt sẵn trên máy chủ.${NC}"
fi

# 4. Cấu hình tường lửa UFW (Bảo vệ an ninh máy chủ)
echo -e "\n${YELLOW}[3/7] Đang cấu hình tường lửa UFW (Chỉ mở cổng 22, 80, 443)...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Port'
ufw allow 80/tcp comment 'HTTP Web'
ufw allow 443/tcp comment 'HTTPS SSL'
ufw --force enable
echo -e "${GREEN}Tường lửa UFW đã kích hoạt thành công!${NC}"

# 5. Khởi tạo thư mục dự án tại /var/www/nguoingheo và Clone mã nguồn
APP_DIR="/var/www/nguoingheo"
echo -e "\n${YELLOW}[4/7] Thiết lập thư mục triển khai tại ${APP_DIR}...${NC}"
mkdir -p "${APP_DIR}"

if [ -d "${APP_DIR}/.git" ]; then
  echo -e "Đã tồn tại Git repository. Đang cập nhật mã nguồn..."
  cd "${APP_DIR}"
  git pull origin main || true
else
  echo -e "Đang clone mã nguồn từ GitHub vào ${APP_DIR}..."
  if [ -z "$(ls -A ${APP_DIR})" ]; then
    git clone https://github.com/lehanhkt01-gif/nguoingheo.git "${APP_DIR}" || true
  fi
  cd "${APP_DIR}"
fi

# 6. Chuẩn bị file môi trường và chứng chỉ SSL
echo -e "\n${YELLOW}[5/7] Thiết lập file cấu hình môi trường & SSL...${NC}"
if [ ! -f "${APP_DIR}/.env" ]; then
  if [ -f "${APP_DIR}/.env.example" ]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    echo -e "${GREEN}Đã tạo file .env từ .env.example. Vui lòng kiểm tra và cập nhật các khóa API!${NC}"
  fi
fi

# Tạo thư mục SSL cho Nginx
mkdir -p "${APP_DIR}/docker/nginx/ssl"
if [ ! -f "${APP_DIR}/docker/nginx/ssl/fullchain.pem" ]; then
  echo -e "Đang khởi tạo chứng chỉ SSL tự ký tạm thời (khuyến nghị dùng Cloudflare SSL Full / Origin Certificate)..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "${APP_DIR}/docker/nginx/ssl/privkey.pem" \
    -out "${APP_DIR}/docker/nginx/ssl/fullchain.pem" \
    -subj "/C=VN/ST=DakLak/L=EaSup/O=UBMTTQ Xa Ea Sup/CN=nguoingheo.easupso.com"
fi

# 7. Khởi chạy toàn bộ hệ thống bằng Docker Compose
echo -e "\n${YELLOW}[6/7] Đang đóng gói và khởi chạy Docker Compose (5 services)...${NC}"
docker compose down || true
docker compose up -d --build

# 8. Thực hiện Migration & Khởi tạo dữ liệu mẫu
echo -e "\n${YELLOW}[7/7] Khởi tạo cơ sở dữ liệu và seed data 20 thôn buôn Ea Súp...${NC}"
echo "Đợi cơ sở dữ liệu PostgreSQL sẵn sàng..."
sleep 8

docker compose exec -T web npx prisma migrate deploy || true
docker compose exec -T web npm run prisma:seed || true

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN}  🎉 TRIỂN KHAI THÀNH CÔNG NỀN TẢNG QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP!  ${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo -e "• Thư mục cài đặt VPS: ${YELLOW}/var/www/nguoingheo${NC}"
echo -e "• Tên miền truy cập:   ${BLUE}https://nguoingheo.easupso.com${NC}"
echo -e "• Trang Báo cáo sao kê: ${BLUE}https://nguoingheo.easupso.com/sao-ke${NC}"
echo -e "• Cổng Quản trị Cán bộ: ${BLUE}https://nguoingheo.easupso.com/admin/login${NC}"
echo -e "  (Tài khoản: ${YELLOW}lehonghanh${NC} / Mật khẩu: ${YELLOW}EaSup@2026${NC})"
echo -e "• Endpoint Casso Webhook: ${BLUE}https://nguoingheo.easupso.com/api/v1/webhook/casso${NC}"
echo -e "------------------------------------------------------------------------------"
echo -e "Lưu ý Cloudflare DNS: Trỏ bản ghi A 'nguoingheo.easupso.com' về IP VPS này và bật Proxy đám mây cam."
