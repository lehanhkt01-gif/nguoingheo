import SocialWelfareList from "@/components/home/SocialWelfareList";
import { FileText, Download, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Văn Bản & Pháp Lý - Hồ Sơ Đã Giải Ngân | Quỹ Vì Người Nghèo Xã Ea Súp",
  description: "Hồ sơ các đợt trao quà, giải ngân có chứng từ nghiệm thu mộc đỏ và các căn cứ văn bản pháp quy của UBMTTQ Việt Nam xã Ea Súp.",
};

export default function VanBanPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 space-y-8 sm:space-y-12">
      {/* 1. Nút văn bản & pháp lý: Sử dụng toàn bộ nội dung Đã trao / Giải ngân */}
      <SocialWelfareList mode="GIFTS_ONLY" defaultTab="GIFTS" />

      {/* 2. CĂN CỨ PHÁP LÝ & QUY CHẾ VẬN HÀNH CHÍNH THỨC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6 border-t-2 border-slate-200">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>CĂN CỨ PHÁP LÝ &amp; QUY CHẾ VẬN HÀNH</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 uppercase">
            Hệ Thống Văn Bản Pháp Quy Quỹ &quot;Vì Người Nghèo&quot; Xã Ea Súp
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Các văn bản ban hành chính thức của Ban Thường trực UBMTTQ Việt Nam xã Ea Súp, quy định rõ nguyên tắc quản lý, đối soát và giải ngân nguồn quỹ.
          </p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Văn bản 1: QĐ 13 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                  QUYẾT ĐỊNH QUY CHẾ
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  Quyết định số 13/QĐ-MTTQ-BTT ngày 14/01/2026
                </h3>
                <span className="text-xs text-slate-500">
                  Ban hành: Ban Thường trực UBMTTQ Việt Nam xã Ea Súp • Ký ban hành: Chủ tịch Lê Hồng Hạnh
                </span>
              </div>
              <a
                href="/api/v1/export/docx?reportNumber=13/QĐ-MTTQ-BTT"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải toàn văn (.docx)</span>
              </a>
            </div>

            <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
              <p>
                <strong>Trích yếu:</strong> Ban hành Quy chế vận động, quản lý và sử dụng Quỹ &quot;Vì người nghèo&quot; xã Ea Súp, áp dụng thống nhất trên địa bàn 20 thôn buôn.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Các điểm cốt lõi trong quy chế:</div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tài khoản tiếp nhận duy nhất:</strong> 8630100930 mở tại BIDV Chi nhánh/PGD Ea Súp. Nghiêm cấm sử dụng tài khoản Kho bạc trong tiếp nhận ủng hộ trực tuyến.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Định mức chi xây dựng nhà Đại đoàn kết:</strong> 8.000.000 VNĐ/nhà từ nguồn Quỹ xã kết hợp các nguồn vốn đối ứng và ngày công lao động tại chỗ.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Định mức hỗ trợ sửa chữa nhà:</strong> 5.000.000 VNĐ/nhà.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Định mức hỗ trợ phát triển sản xuất:</strong> 5.000.000 VNĐ/hộ (mua bò giống, cây con giống).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cứu trợ đột xuất:</strong> Từ 1.000.000 đến 5.000.000 VNĐ/ca cấp bách.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Văn bản 2: QĐ 12 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">
                  QUYẾT ĐỊNH THÀNH LẬP
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  Quyết định số 12/QĐ-MTTQ-BTT ngày 14/01/2026
                </h3>
                <span className="text-xs text-slate-500">
                  Ban hành: Ban Thường trực UBMTTQ Việt Nam xã Ea Súp
                </span>
              </div>
              <a
                href="/api/v1/export/docx?reportNumber=12/QĐ-MTTQ-BTT"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải toàn văn (.docx)</span>
              </a>
            </div>

            <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
              <p>
                <strong>Trích yếu:</strong> Thành lập Ban Vận động Quỹ &quot;Vì người nghèo&quot; và Quỹ Cứu trợ xã Ea Súp gồm Thường trực Ban Vận động và 20 Trưởng ban Công tác Mặt trận thôn, buôn.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">Trưởng ban:</div>
                  <strong className="text-slate-900 block mt-0.5">Đ/c Lê Hồng Hạnh</strong>
                  <span className="text-[11px] text-slate-600">UV BTV Đảng ủy, Chủ tịch UBMTTQ xã</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">Phó ban:</div>
                  <strong className="text-slate-900 block mt-0.5">Đ/c Nguyễn Bá Bân</strong>
                  <span className="text-[11px] text-slate-600">Chủ tịch UBND xã Ea Súp</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">Phó ban thường trực:</div>
                  <strong className="text-slate-900 block mt-0.5">Đ/c Nguyễn Thị Miên</strong>
                  <span className="text-[11px] text-slate-600">Phó Chủ tịch UBMTTQ, Chủ tịch Hội ND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
