-- ==============================================================================
-- CLOUDFLARE D1 RELATIONAL DATABASE SCHEMA: QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP
-- Nền tảng: Cloudflare D1 (SQLite Edge Engine)
-- Tên miền: nguoingheo.easupso.com
-- ==============================================================================

-- 1. BẢNG CHIẾN DỊCH & HẠNG MỤC VẬN ĐỘNG
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,              -- NDDK01, NDDK02, SK01, TET2026, CT01, CHUNG
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('NHA_DAI_DOAN_KET', 'SUA_NHA', 'SINH_KE', 'CUU_TRO', 'TET', 'CHUNG')),
    village TEXT,                           -- Thuộc 1 trong 20 thôn buôn Ea Súp
    beneficiary_name TEXT,                  -- Tên chủ hộ thụ hưởng
    target_amount REAL NOT NULL DEFAULT 0,  -- Số tiền mục tiêu (VNĐ)
    current_amount REAL NOT NULL DEFAULT 0, -- Số tiền đã vận động được
    disbursed_amount REAL NOT NULL DEFAULT 0, -- Số tiền đã giải ngân
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'COMPLETED', 'CLOSED')),
    image_url TEXT,
    proof_urls TEXT,                        -- JSON string mảng URL trên Cloudflare R2
    start_date TEXT DEFAULT (datetime('now')),
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. BẢNG DANH MỤC 20 THÔN, BUÔN XÃ EA SÚP
CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,              -- Thôn 1 -> Thôn 17, Buôn A2, Buôn Drai, Buôn Cổng
    type TEXT NOT NULL CHECK(type IN ('THON', 'BUON')),
    head_of_ctmt TEXT,                      -- Trưởng ban Công tác Mặt trận
    phone_number TEXT,
    poor_household_count INTEGER DEFAULT 0, -- Số hộ nghèo
    near_poor_count INTEGER DEFAULT 0,      -- Số hộ cận nghèo
    total_disbursed REAL DEFAULT 0,         -- Tổng số tiền Quỹ đã trợ giúp tại thôn/buôn này
    created_at TEXT DEFAULT (datetime('now'))
);

-- 3. BẢNG GIAO DỊCH DÒNG TIỀN (SAO KÊ REAL-TIME BIDV 8630100930)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    casso_id INTEGER UNIQUE,                -- Mã giao dịch định danh từ Casso Banking API
    bank_tid TEXT NOT NULL UNIQUE,          -- Mã TID BIDV: BIDV_FT262391001,...
    type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')), -- IN (Thu tiền vào), OUT (Chi giải ngân)
    amount REAL NOT NULL,                   -- Số tiền (VNĐ)
    running_balance REAL,                   -- Số dư lũy kế tại thời điểm giao dịch
    description TEXT NOT NULL,              -- Nội dung chuyển khoản ngân hàng
    transaction_date TEXT NOT NULL,         -- Thời gian phát sinh giao dịch
    account_number TEXT NOT NULL DEFAULT '8630100930',
    bank_name TEXT NOT NULL DEFAULT 'BIDV',
    donor_name TEXT,                        -- Tên người ủng hộ
    is_anonymous INTEGER NOT NULL DEFAULT 0,-- 1: Ẩn danh, 0: Công khai
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_code TEXT,
    receipt_number TEXT,                    -- Số Phiếu thu / Phiếu chi (VD: PC-2026-0042)
    verified_by TEXT,                       -- Người ký xác nhận kiểm soát
    proof_image_url TEXT,                   -- Link hóa đơn scan trên Cloudflare R2
    proof_notes TEXT,                       -- Ghi chú biên bản mộc đỏ
    casso_synced_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. BẢNG HỒ SƠ MINH CHỨNG & HÓA ĐƠN SCAN (CLOUDFLARE R2 MAPPING)
CREATE TABLE IF NOT EXISTS disbursement_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    receipt_code TEXT NOT NULL,             -- PC-2026-0042
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('HOA_DON_VAT', 'BIEN_BAN_NGHIEM_THU', 'PHIEU_CHI', 'DON_XIN_HO_TRO')),
    r2_file_key TEXT NOT NULL,              -- Key lưu trên R2 (nguoingheo-proofs/...)
    r2_public_url TEXT NOT NULL,            -- URL CDN Cloudflare
    file_size_bytes INTEGER,
    mime_type TEXT DEFAULT 'image/jpeg',
    signer_name TEXT,                       -- Đ/c Lê Hồng Hạnh / Trưởng ban CTMT thôn
    signer_role TEXT,                       -- Chủ tịch UBMTTQ / Trưởng thôn
    verified_status TEXT DEFAULT 'VERIFIED' CHECK(verified_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. BẢNG VĂN BẢN PHÁP LÝ & QUY CHẾ
CREATE TABLE IF NOT EXISTS scan_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_number TEXT NOT NULL,               -- 13/QĐ-MTTQ-BTT, 12/QĐ-MTTQ-BTT
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('QUYET_DINH', 'QUY_CHE', 'BAO_CAO_ND30', 'KE_HOACH')),
    issue_date TEXT NOT NULL,
    issuer TEXT NOT NULL DEFAULT 'UBND - UBMTTQ Việt Nam xã Ea Súp',
    signer TEXT,
    r2_url TEXT NOT NULL,
    summary TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 6. BẢNG NHẬT KÝ KIỂM TOÁN (AUDIT LOG CHỐNG GIAN LẬN)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,                   -- INSERT_TRANSACTION, UPDATE_PROOF, CASSO_WEBHOOK
    actor TEXT NOT NULL DEFAULT 'SYSTEM',
    ip_address TEXT,
    payload TEXT,                           -- JSON dữ liệu trước/sau thay đổi
    created_at TEXT DEFAULT (datetime('now'))
);

-- 7. CHỈ MỤC TỐI ƯU TRUY VẤN (INDEXES)
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign ON transactions(campaign_code);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_proofs_receipt ON disbursement_proofs(receipt_code);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
