"use client";

import { useState } from "react";
import { CheckCircle, Eye, FileText, Image as ImageIcon, MapPin } from "lucide-react";

interface ProofItem {
  id: number;
  title: string;
  village: string;
  category: string;
  date: string;
  imageUrl: string;
  signer: string;
  description: string;
}

const SAMPLE_PROOFS: ProofItem[] = [
  {
    id: 1,
    title: "Khởi công xây nhà Đại đoàn kết hộ bà Y Thị",
    village: "Buôn Drai",
    category: "Nhà Đại đoàn kết",
    date: "09/09/2026",
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80",
    signer: "Trưởng ban CTMT Y Krô Bkrông",
    description: "Đại diện UBMTTQ xã và Trưởng ban CTMT Buôn Drai bàn giao đợt 1 kinh phí 8 triệu đồng cùng vật tư xây dựng.",
  },
  {
    id: 2,
    title: "Nghiệm thu bàn giao nhà Đại đoàn kết hộ ông Nguyễn Văn Sáng",
    village: "Thôn 5",
    category: "Nhà Đại đoàn kết",
    date: "15/08/2026",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
    signer: "Chủ tịch UBMTTQ Lê Hồng Hạnh & Trưởng thôn 5",
    description: "Căn nhà cấp 4 lợp tôn kiên cố hoàn thành sau 45 ngày thi công, trao biển chứng nhận nhà Đại đoàn kết.",
  },
  {
    id: 3,
    title: "Bàn giao 10 con Bò giống sinh kế cho hộ nghèo",
    village: "Thôn 12 & Thôn 14",
    category: "Hỗ trợ sinh kế",
    date: "20/07/2026",
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80",
    signer: "Phó Ban thường trực Nguyễn Thị Miên",
    description: "Các hộ gia đình đã ký cam kết chăm sóc phát triển đàn bò giống địa phương, có sổ theo dõi tiêm phòng định kỳ.",
  },
  {
    id: 4,
    title: "Trao tiền hỗ trợ phẫu thuật tim cho cháu H'Hên Mlô",
    village: "Buôn A2",
    category: "Cứu trợ khẩn cấp",
    date: "08/09/2026",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
    signer: "Chủ tịch UBND xã Nguyễn Bá Bân",
    description: "Trao tận tay viện phí 25 triệu đồng hỗ trợ cháu H'Hên nhập viện mổ tim theo đề nghị cấp bách của Buôn A2.",
  },
];

export default function ProofGallery() {
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);

  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Minh Chứng Thực Tế Tại 20 Thôn Buôn</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Thư Viện Ảnh & Biên Bản Nghiệm Thu Bàn Giao
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Hình ảnh thực tế quá trình khởi công, trao tặng và biên bản nghiệm thu có dấu mộc đỏ và chữ ký của Ban Công tác Mặt trận.
            </p>
          </div>
        </div>

        {/* Lưới ảnh minh chứng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_PROOFS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProof(item)}
              className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-semibold">
                  <Eye className="w-4 h-4" />
                  <span>Xem chi tiết nghiệm thu</span>
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-700 text-white shadow">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-red-700 font-medium">
                    <MapPin className="w-3 h-3" />
                    {item.village}
                  </span>
                  <span>{item.date}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Xác nhận: <strong>{item.signer}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Xem Minh Chứng */}
        {selectedProof && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="relative aspect-[16/10] bg-slate-900">
                <img
                  src={selectedProof.imageUrl}
                  alt={selectedProof.title}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setSelectedProof(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                    {selectedProof.category}
                  </span>
                  <span className="text-slate-500">Địa bàn: <strong>{selectedProof.village}</strong></span>
                  <span className="text-slate-500">• Ngày: {selectedProof.date}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {selectedProof.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedProof.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">Biên bản nghiệm thu & Quyết định liên quan:</div>
                  <div className="text-slate-600">
                    Ký xác nhận giám sát: <strong>{selectedProof.signer}</strong> (Đại diện Ban Vận Động & Ban CTMT khu dân cư).
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedProof(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
