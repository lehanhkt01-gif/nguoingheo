# 📋 NHẬT KÝ CẬP NHẬT & HƯỚNG DẪN TRIỂN KHAI VPS
**Hệ thống:** Cổng Thông Tin & Sao Kê Quỹ "Vì Người Nghèo" Xã Ea Súp  
**Tên miền chính thức:** `https://nguoingheo.easupso.com`  
**Kho lưu trữ GitHub:** `https://github.com/lehanhkt01-gif/nguoingheo.git`  
**Thư mục lưu trữ trên VPS:** `/var/www/nguoingheo`  
**Cập nhật lần cuối:** 19/10/2026  

---

## I. TỔNG HỢP CÁC TÍNH NĂNG ĐÃ NÂNG CẤP & CHỈNH SỬA

### 1. Tối ưu hóa giao diện Bảng điều khiển Quản trị (`/admin`)
- **Gỡ bỏ các nút và dòng chữ trùng lặp:**
  - Nút *"Đồng bộ thủ công với Casso"*.
  - Nút *"Quản lý Hoàn cảnh & Đợt trao quà"*.
  - Nút *"Xem trang người dân"*.
  - Dòng chữ *"Hệ thống đối soát & an sinh xã hội 20 thôn buôn"*.
  - Khối hiển thị thông tin cán bộ `[LH] Đ/c Lê Hồng Hạnh` trên thanh công cụ phụ (do Menu chính ở trên cùng đã có đầy đủ avatar và thông tin cán bộ).
- **Thanh điều hướng 3 Tab trực quan:**
  1. 📊 **Tổng quan tài chính & Sao kê:** 4 thẻ số dư tài khoản BIDV 8630100930, đồng bộ kép Casso Open API & Webhook V2, trợ lý Gemini AI, bảng sao kê tiền vào / tiền ra thời gian thực.
  2. 📰 **Đăng tin & Quản lý bài đăng:** Đăng bài mới, duyệt danh sách, xem chi tiết, xóa bài đăng.
  3. ⚙️ **Thiết lập quản trị & Cán bộ:** Quản lý danh sách cán bộ, thêm cán bộ mới, xóa cán bộ, đổi mật khẩu cho cán bộ đang đăng nhập.

---

### 2. Hệ thống Quản lý Cán bộ & Phân quyền RBAC
- **Vị trí tệp mã nguồn:**
  - Logic & Dữ liệu: `src/lib/officers.ts`
  - API Endpoint: `src/app/api/v1/admin/officers/route.ts`
  - API Xác thực: `src/app/api/admin/login/route.ts` & `src/app/api/admin/me/route.ts`
  - Nơi lưu trữ dữ liệu vĩnh viễn: `data/officers.json`
- **Chức năng chính:**
  - **Thêm cán bộ mới:** Nhập Họ tên, Chức vụ (Phó Ban, Cán bộ phụ trách...), Tên đăng nhập, Mật khẩu ban đầu (tối thiểu 6 ký tự), Số điện thoại, tích chọn quyền *(Đăng bài viết, Xóa bài viết)*.
  - **Xóa cán bộ:** Nút xóa có hộp thoại xác nhận; bảo vệ tuyệt đối tài khoản Admin tối cao (`admin_easup`).
  - **Đổi mật khẩu cho cán bộ:** Cán bộ đăng nhập vào tab *Thiết lập quản trị* có thể tự đổi mật khẩu mới cho tài khoản của mình. Mật khẩu mới lưu ngay vào `data/officers.json` và có hiệu lực cho mọi lần đăng nhập tiếp theo.

---

### 3. Phân hệ Đăng tin & Quản lý Thông tin Bài đăng An sinh
- **Vị trí tệp mã nguồn:**
  - Logic & Dữ liệu: `src/lib/posts.ts`
  - API Endpoint: `src/app/api/v1/admin/posts/route.ts`
  - Nơi lưu trữ dữ liệu vĩnh viễn: `data/posts.json`
- **Chức năng chính:**
  - **Soạn & Đăng bài viết mới:** Modal soạn thảo gồm Tiêu đề, Chuyên mục (*Tin tức Mặt trận, Hoàn cảnh cần giúp đỡ, Đợt trao quà an sinh, Thông báo quan trọng*), Địa bàn 20 thôn buôn hoặc toàn xã, Tóm tắt ngắn, Toàn văn nội dung, Đường dẫn ảnh đại diện/chứng từ. Tác giả tự động gắn theo cán bộ đang đăng nhập.
  - **Quản lý danh sách bài viết:** Xem dạng thẻ hiện đại có bộ lọc theo chuyên mục và ô tìm kiếm nhanh.
  - **Xem chi tiết & Xóa bài đăng:** Hỗ trợ đọc toàn văn và nút xóa bài đăng kèm xác nhận an toàn.

---

## II. BẢN ĐỒ VỊ TRÍ TỆP & CẤU TRÚC LƯU TRỮ

```
/var/www/nguoingheo/ (trên VPS)
├── .env                              # Cấu hình bí mật (Database, Casso, Gemini, BIDV...)
├── data/                             # Dữ liệu JSON lưu trữ bền vững (Mounted Volume)
│   ├── officers.json                 # Danh sách tài khoản, mật khẩu, phân quyền cán bộ
│   ├── posts.json                    # Dữ liệu tin tức bài đăng, thông báo an sinh
│   ├── campaigns_data.json           # Dữ liệu chiến dịch vận động
│   └── welfare_data.json             # Dữ liệu hoàn cảnh khó khăn & đợt trao quà
├── src/
│   ├── app/
│   │   ├── admin/page.tsx            # Bảng điều khiển quản trị 3 Tab
│   │   ├── api/admin/login/route.ts  # Xác thực đăng nhập cán bộ đa tài khoản
│   │   ├── api/admin/me/route.ts     # Trả về thông tin cán bộ theo phiên đăng nhập
│   │   └── api/v1/admin/
│   │       ├── officers/route.ts     # API Thêm, Xóa, Đổi mật khẩu cán bộ
│   │       └── posts/route.ts        # API Đăng bài, Xóa bài viết an sinh
│   └── lib/
│       ├── officers.ts               # Xử lý dữ liệu cán bộ quản lý
│       └── posts.ts                  # Xử lý dữ liệu bài đăng an sinh
├── docker-compose.yml                # File điều phối Docker (Web, Postgres, Redis, Nginx)
└── deploy-vps.sh                     # Script cài đặt tự động 1-chạm
```

---

## III. HƯỚNG DẪN CÂU LỆNH PULL & TRIỂN KHAI TRÊN VPS

### Cách 1: Cập nhật nhanh mã nguồn & Khởi động lại container (Khuyên dùng)
Đăng nhập SSH vào VPS của bạn với quyền `root`, sau đó chạy lần lượt các lệnh sau:

```bash
# 1. Di chuyển vào đúng thư mục dự án
cd /var/www/nguoingheo

# 2. Kéo mã nguồn mới nhất từ GitHub về
git pull origin main

# 3. Phân quyền ghi cho thư mục dữ liệu data/ (đảm bảo container ghi được file json)
chmod -R 777 data/

# 4. Build lại và khởi chạy lại container web trong nền (không làm gián đoạn database)
docker compose up -d --build web

# 5. Kiểm tra log khởi động của ứng dụng
docker compose logs -f --tail=50 web
```
*(Nhấn `Ctrl + C` để thoát khỏi màn hình xem log sau khi thấy ứng dụng báo `Ready in ...ms`).*

---

### Cách 2: Xử lý khi VPS báo xung đột code cục bộ (Conflict)
Nếu trên VPS đã có những sửa đổi file trước đó làm nghẽn lệnh `git pull`, chạy chuỗi lệnh sau để đồng bộ tuyệt đối theo GitHub:

```bash
cd /var/www/nguoingheo

# Lưu lại các thay đổi cục bộ hoặc reset sạch theo bản trên GitHub
git stash
git fetch origin main
git reset --hard origin/main

# Đảm bảo quyền thư mục dữ liệu
chmod -R 777 data/

# Rebuild container web
docker compose up -d --build web
```

---

### Cách 3: Chạy lại toàn bộ kịch bản triển khai tự động (Nếu cài mới)
```bash
cd /var/www/nguoingheo
sudo bash deploy-vps.sh
```

---

## IV. DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH

| Tên tài khoản | Mật khẩu mặc định | Họ và tên cán bộ | Chức vụ | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| `admin_easup` | `EaSup@Admin2026!` | Đ/c Lê Hồng Hạnh | Chủ tịch UBMTTQ Việt Nam xã Ea Súp | Quản trị tối cao (Toàn quyền) |
| `nguyenbaban` | `EaSup@2026` | Đ/c Nguyễn Bá Bân | Phó Ban Vận Động Quỹ | Đăng tin, Xóa tin |
| `nguyenthimien` | `EaSup@2026` | Đ/c Nguyễn Thị Miên | Phó Ban Thường Trực MTTQ | Đăng tin |

> [!TIP]
> Cán bộ có thể tự đổi mật khẩu cá nhân ngay tại tab **"Thiết lập quản trị & Cán bộ"** sau khi đăng nhập thành công.
