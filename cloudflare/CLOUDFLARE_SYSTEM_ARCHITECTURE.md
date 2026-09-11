# 🏛️ KIẾN TRÚC HỆ THỐNG DATABASE & DỊCH VỤ CLOUDFLARE
## NỀN TẢNG MINH BẠCH QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP
**Tên miền chính thức:** `nguoingheo.easupso.com`  
**Cơ quan chủ quản:** Ban Thường trực Ủy ban MTTQ Việt Nam xã Ea Súp, tỉnh Đắk Lắk  
**Tài khoản tiếp nhận duy nhất:** BIDV `8630100930`

---

## 📊 1. SƠ ĐỒ TỔNG THỂ CÁC ỨNG DỤNG CLOUDFLARE

```mermaid
graph TD
    %% 1. Môi trường Internet & Clients bên ngoài
    subgraph Internet_Layer ["🌐 MÔI TRƯỜNG INTERNET & CLIENT BÊN NGOÀI"]
        User(["👥 Người Dân / Nhà Hảo Tâm<br/>(nguoingheo.easupso.com)"])
        Casso(["💳 Casso Banking Webhook<br/>(Ngân hàng BIDV 8630100930)"])
        AdminUser(["🛡️ Ban Vận Động / Kế Toán / 20 Thôn Buôn<br/>(Cổng Quản Trị RBAC)"])
    end

    %% Edge Security Gateway
    Cloudflare["🛡️ Cloudflare CDN & WAF<br/>(SSL/TLS Full Strict & DDoS Protection)"]

    %% 2. External Cloud Services (BÊN NGOÀI Docker)
    subgraph External_APIs ["☁️ External Cloud Services / Third-Party APIs"]
        Gemini["🤖 Google Gemini 2.5/Flash AI<br/>(Trợ Lý Gem Mặt Trận 24/7)"]
        Resend["📧 Resend Email API<br/>(One-Click Dispatcher SMTP: noreply@easupso.com)"]
    end

    %% 3. VPS Host Storage (BÊN NGOÀI Docker)
    Host_Storage[("💾 Host Storage: /var/backups/<br/>(Lưu trữ file pg_dump .sql.gz)")]
    Docker_Socket[("🐳 Docker Socket: /var/run/docker.sock")]

    %% 4. Docker Infrastructure trên VPS Server
    subgraph Docker_Infra ["🐳 DOCKER INFRASTRUCTURE (VPS CLOUD SERVER GDATA)"]
        Nginx["🌐 Nginx Reverse Proxy<br/>(:80 / :443 (HTTP/HTTPS))"]
        Web["🚀 Next.js 15 Standalone Web App<br/>(Port :3000 Node.js Alpine)"]
        Postgres[("🐘 PostgreSQL 16: vinguoingheo_db<br/>[Persistent Volume: postgres_data]")]
        Redis[("⚡ Redis 7 Cache & Rate Limit<br/>(Live Counter & Anti-spam)")]
        Backup["⏰ Cron Backup Service<br/>(Tự động snapshot 00:00 hằng ngày)"]
        Dozzle["📋 Dozzle (Log Viewer :8888)<br/>(Giám sát Container Logs Thời Gian Thực)"]
    end

    %% Dòng chảy dữ liệu thực tế
    User -->|Truy cập Web / Tra cứu sao kê / Quyên góp| Cloudflare
    Casso -->|POST Webhook qua HTTPS| Cloudflare
    AdminUser -->|HTTPS / Đăng nhập Quản trị| Cloudflare

    Cloudflare -->|Chuyển tiếp Traffic an toàn| Nginx

    Nginx -->|Proxy Pass HTTP :3000| Web
    Nginx -->|POST /api/v1/webhook/casso| Web

    Web -->|Prisma ORM Queries| Postgres
    Web -->|Bộ đếm Live Counter & Chống trùng lặp| Redis

    Web -.->|API Key / HTTPS| Gemini
    Web -.->|API Key / HTTPS| Resend

    Backup -->|pg_dump snapshot| Postgres
    Backup -->|Xuất file backup pg_dump| Host_Storage

    Docker_Socket -.->|Kết nối đọc log realtime| Dozzle
```

---

## 💎 2. VAI TRÒ CỤ THỂ CỦA TỪNG ỨNG DỤNG CLOUDFLARE

### 1. Cloudflare D1 (Cơ sở dữ liệu quan hệ Serverless SQL)
* **Vị trí file:** `cloudflare/d1/schema.sql` & `cloudflare/d1/seed.sql`
* **Nhiệm vụ:**
  * Lưu trữ quan hệ dữ liệu có cấu trúc: Bảng `villages` (20 thôn buôn), bảng `campaigns` (chiến dịch), bảng `transactions` (sao kê ngân hàng BIDV), bảng `disbursement_proofs` (minh chứng chi), bảng `audit_logs` (nhật ký kiểm toán).
  * Cho phép truy vấn siêu tốc tại các node mạng Edge của Cloudflare gần người dùng nhất mà không gây tải cho máy chủ VPS.

### 2. Cloudflare KV (Lưu trữ Key-Value siêu tốc)
* **Nhiệm vụ:**
  * Cache số liệu bộ đếm thời gian thực `live_fund_stats` (Tổng thu `334.000.000 đ`, đã giải ngân `33.000.000 đ`, dư `301.000.000 đ`).
  * Giảm tải 99% truy vấn database khi có hàng nghìn người cùng xem sao kê.
  * Chống tấn công lặp yêu cầu (Rate Limiting & Webhook Deduplication).

### 3. Cloudflare R2 (Lưu trữ chứng từ hóa đơn - Không tính phí băng thông ra)
* **Bucket name:** `nguoingheo-proofs`
* **Nhiệm vụ:**
  * Chứa các file ảnh scan mộc đỏ, phiếu chi `PC-2026-0042`, hóa đơn VAT vật liệu xây dựng nhà Đại đoàn kết, biên bản khởi công có chữ ký Trưởng ban CTMT các thôn/buôn.
  * Miễn phí hoàn toàn băng thông tải xuống (Egress Fees = $0).

### 4. Cloudflare Workers AI & Vectorize (Trí tuệ nhân tạo Trợ lý Mặt trận)
* **Model:** `@cf/meta/llama-3-8b-instruct`
* **Nhiệm vụ:**
  * Vận hành Chatbot `Gem Mặt Trận Ea Súp` trả lời tự động cho công dân về định mức chi theo QĐ 13/QĐ-MTTQ, địa bàn 20 thôn buôn, tra cứu giao dịch BIDV 24/7.

### 5. Cloudflare DNS & SSL Full (Bảo mật & Tên miền)
* **Bản ghi DNS:**
  * Bản ghi `A` trỏ `nguoingheo.easupso.com` về IP VPS với chế độ **Proxied (Đám mây cam bật)**.
* **SSL/TLS:** Thiết lập chế độ **Full (Strict)** để mã hóa đầu cuối 100% giữa Cloudflare và VPS.

---

## 🚀 3. HƯỚNG DẪN TRIỂN KHAI LÊN VPS (`/var/www/nguoingheo`)

Trên máy chủ VPS Ubuntu, chạy 1 dòng lệnh duy nhất để tải mã nguồn và cài đặt tự động:

```bash
# Đăng nhập SSH vào VPS
ssh root@<IP_VPS_CỦA_BẠN>

# Tải và chạy kịch bản triển khai tự động
curl -sSL https://raw.githubusercontent.com/lehanhkt01-gif/nguoingheo/main/deploy-vps.sh | sudo bash
```

Toàn bộ ứng dụng sẽ tự động được thiết lập tại thư mục: **`/var/www/nguoingheo`**.
