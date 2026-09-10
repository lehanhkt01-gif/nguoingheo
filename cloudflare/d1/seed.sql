-- ==============================================================================
-- SEED DATA: QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP
-- Dữ liệu thực tế: 20 Thôn Buôn, 334.000.000 đ thu, 33.000.000 đ chi, dư 301.000.000 đ
-- ==============================================================================

-- 1. NẠP DANH MỤC 20 THÔN, BUÔN XÃ EA SÚP
INSERT OR REPLACE INTO villages (id, name, type, head_of_ctmt, phone_number, poor_household_count, near_poor_count, total_disbursed) VALUES
(1, 'Thôn 1', 'THON', 'Đ/c Trần Văn Hùng', '0912345001', 12, 8, 8000000),
(2, 'Thôn 2', 'THON', 'Đ/c Lê Văn Đức', '0912345002', 9, 6, 0),
(3, 'Thôn 3', 'THON', 'Đ/c Phạm Thị Lan', '0912345003', 14, 11, 5000000),
(4, 'Thôn 4', 'THON', 'Đ/c Hoàng Văn Nam', '0912345004', 8, 5, 0),
(5, 'Thôn 5', 'THON', 'Đ/c Nguyễn Văn Cường', '0912345005', 16, 12, 8000000),
(6, 'Thôn 6', 'THON', 'Đ/c Vũ Thị Mai', '0912345006', 7, 4, 0),
(7, 'Thôn 7', 'THON', 'Đ/c Đỗ Văn Long', '0912345007', 11, 7, 0),
(8, 'Thôn 8', 'THON', 'Đ/c Bùi Văn Thành', '0912345008', 10, 6, 0),
(9, 'Thôn 9', 'THON', 'Đ/c Ngô Thị Hoa', '0912345009', 13, 9, 0),
(10, 'Thôn 10', 'THON', 'Đ/c Phan Văn Bình', '0912345010', 15, 10, 0),
(11, 'Thôn 11', 'THON', 'Đ/c Đinh Văn Sơn', '0912345011', 8, 5, 0),
(12, 'Thôn 12', 'THON', 'Đ/c Lý Văn Thông', '0912345012', 18, 14, 15000000),
(13, 'Thôn 13', 'THON', 'Đ/c Lương Thị Thu', '0912345013', 10, 8, 0),
(14, 'Thôn 14', 'THON', 'Đ/c Trịnh Văn Hải', '0912345014', 19, 15, 17000000),
(15, 'Thôn 15', 'THON', 'Đ/c Dương Văn Tân', '0912345015', 7, 6, 0),
(16, 'Thôn 16', 'THON', 'Đ/c Mai Văn Phúc', '0912345016', 9, 7, 0),
(17, 'Thôn 17', 'THON', 'Đ/c Tạ Thị Lệ', '0912345017', 12, 9, 0),
(18, 'Buôn A2', 'BUON', 'Đ/c Y Thu Mlô', '0912345018', 28, 20, 25000000),
(19, 'Buôn Drai', 'BUON', 'Đ/c Y Krô Bkrông', '0912345019', 32, 24, 8000000),
(20, 'Buôn Cổng', 'BUON', 'Đ/c Y BLiang Niê', '0912345020', 25, 18, 5000000);

-- 2. NẠP CÁC CHIẾN DỊCH TRỌNG ĐIỂM
INSERT OR REPLACE INTO campaigns (id, code, slug, title, description, category, village, beneficiary_name, target_amount, current_amount, disbursed_amount, status, image_url) VALUES
(1, 'CHUNG', 'quy-chung-20-thon-buon', 'Quỹ Vì Người Nghèo Xã Ea Súp (Chung 20 thôn buôn)', 'Nguồn quỹ chung hỗ trợ an sinh xã hội, sửa chữa nhà, cứu trợ đột xuất tại 20 thôn, buôn.', 'CHUNG', 'Toàn xã', 'Nhân dân khó khăn', 500000000, 334000000, 33000000, 'ACTIVE', 'hero-charity-bg.jpg'),
(2, 'NDDK01', 'xay-nha-ba-y-thi-buon-drai', 'Xây nhà Đại đoàn kết cho hộ bà Y Thị - Buôn Drai', 'Hộ neo đơn, nhà vách nứa dột nát. Định mức xã 8 triệu đồng kết hợp đối ứng.', 'NHA_DAI_DOAN_KET', 'Buôn Drai', 'Bà Y Thị', 80000000, 48500000, 8000000, 'ACTIVE', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'),
(3, 'NDDK02', 'xoa-nha-tam-ong-nguyen-van-sang-thon-5', 'Xóa nhà tạm hộ ông Nguyễn Văn Sáng (Thôn 5)', 'Gia đình khó khăn có người khuyết tật, nhà xuống cấp nghiêm trọng.', 'NHA_DAI_DOAN_KET', 'Thôn 5', 'Ông Nguyễn Văn Sáng', 70000000, 35000000, 0, 'ACTIVE', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'),
(4, 'SK01', 'trao-tang-bo-giong-sinh-ke', 'Trao tặng Bò giống sinh kế cho 10 hộ nghèo', 'Định mức 5 triệu đồng/hộ mua bò cái sinh sản giúp bà con thoát nghèo bền vững.', 'SINH_KE', 'Thôn 12 & 14', '10 Hộ nghèo Thôn 12 & 14', 50000000, 32000000, 0, 'ACTIVE', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'),
(5, 'TET2026', 'qua-tet-binh-ngo-vi-nguoi-ngheo', 'Chương trình Tết Bính Ngọ vì người nghèo', 'Trao tặng 500 suất quà Tết trị giá 500.000đ/suất cho hộ nghèo, gia đình chính sách.', 'TET', 'Toàn xã', '500 Hộ nghèo', 250000000, 185500000, 0, 'ACTIVE', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'),
(6, 'CT01', 'cuu-tro-chau-h-hen-mlo-buon-a2', 'Cứu trợ khẩn cấp chi phí mổ tim cháu H''Hên Mlô', 'Chi phí phẫu thuật tim cấp cứu tại BV Nhi Đồng 2 cho cháu nhỏ hộ nghèo Buôn A2.', 'CUU_TRO', 'Buôn A2', 'Cháu H''Hên Mlô', 25000000, 25000000, 25000000, 'COMPLETED', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80');

-- 3. NẠP GIAO DỊCH DÒNG TIỀN MẪU
INSERT OR REPLACE INTO transactions (id, casso_id, bank_tid, type, amount, running_balance, description, transaction_date, donor_name, is_anonymous, campaign_code, receipt_number, proof_image_url, proof_notes) VALUES
(1, 100001, 'BIDV_FT262391001', 'IN', 5000000, 298000000, 'VNN NDDK01 CONG TY CP CAO SU DAK LAK UNG HO NHA DAI DOAN KET', '2026-09-10 09:15:00', 'Công ty CP Cao Su Đắk Lắk', 0, 'NDDK01', NULL, NULL, NULL),
(2, 100002, 'BIDV_FT262391002', 'IN', 1000000, 299000000, 'VNN TET NGUYEN VAN AN UNG HO NGUOI NGHEO', '2026-09-10 10:20:00', 'Nguyễn Văn An', 0, 'TET2026', NULL, NULL, NULL),
(3, 100003, 'BIDV_FT262391003', 'IN', 500000, 299500000, 'VNN CT MOT NHA HAO TAM AN DANH UNG HO PHAU THUAT TIM', '2026-09-10 11:05:00', 'Nhà hảo tâm ẩn danh', 1, 'CT01', NULL, NULL, NULL),
(4, 100004, 'BIDV_FT262391004', 'OUT', 8000000, 326000000, 'CHI GIAI NGAN HO TRO XAY NHA DAI DOAN KET HO BA Y THI BUON DRAI DOT 1', '2026-09-09 14:30:00', 'UBMTTQ Xã Ea Súp', 0, 'NDDK01', 'PC-2026-0042', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', 'Hóa đơn VAT xi măng, tôn kèm Biên bản khởi công có chữ ký Trưởng ban CTMT Buôn Drai Y Krô Bkrông.'),
(5, 100005, 'BIDV_FT262391005', 'OUT', 25000000, 301000000, 'CHI HO TRO CHI PHI MO TIM CAP CUU CHAU H HEN MLO BUON A2', '2026-09-08 08:45:00', 'UBMTTQ Xã Ea Súp', 0, 'CT01', 'PC-2026-0041', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', 'Biên nhận tạm ứng viện phí BV Nhi Đồng 2 kèm đơn đề nghị khẩn cấp có xác nhận UBND xã.');

-- 4. NẠP VĂN BẢN PHÁP LÝ
INSERT OR REPLACE INTO scan_documents (id, doc_number, title, category, issue_date, issuer, signer, r2_url, summary) VALUES
(1, '13/QĐ-MTTQ-BTT', 'Quy chế Vận động, Quản lý và Sử dụng Quỹ "Vì người nghèo" xã Ea Súp', 'QUY_CHE', '2026-01-14', 'Ban Thường trực UBMTTQ VN xã Ea Súp', 'Lê Hồng Hạnh', '/api/v1/export/docx', 'Quy định định mức xây nhà 8tr/nhà, bò sinh kế 5tr/hộ, cứu trợ 1-5tr/ca và quy chế minh bạch tài khoản BIDV 8630100930.'),
(2, '12/QĐ-MTTQ-BTT', 'Quyết định Thành lập Ban Vận động Quỹ "Vì người nghèo" xã Ea Súp', 'QUYET_DINH', '2026-01-14', 'Ban Thường trực UBMTTQ VN xã Ea Súp', 'Lê Hồng Hạnh', '/api/v1/export/docx', 'Thành lập Ban vận động gồm: Trưởng ban Lê Hồng Hạnh, Phó ban Nguyễn Bá Bân, Phó ban TT Nguyễn Thị Miên.'),
(3, '30/2020/NĐ-CP', 'Báo cáo Tài chính Công khai Quỹ Vì Người Nghèo thể thức hành chính chuẩn', 'BAO_CAO_ND30', '2026-09-10', 'Ban Thường trực UBMTTQ VN xã Ea Súp', 'Lê Hồng Hạnh', '/api/v1/export/docx', 'Báo cáo công khai 100% dòng tiền khớp lệnh BIDV gửi Đảng ủy, HĐND xã và Mặt trận huyện.');
