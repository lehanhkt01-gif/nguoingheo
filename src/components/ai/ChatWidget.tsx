"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "Số dư quỹ BIDV 8630100930 hôm nay?",
  "Thành viên Ban chỉ đạo & SĐT liên hệ?",
  "Tổng số tiền đã thu và đã chi?",
  "Định mức hỗ trợ xây nhà Đại đoàn kết?",
  "Danh sách 20 thôn, buôn xã Ea Súp?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Kính chào quý đồng bào và nhà hảo tâm! Tôi là Gem Mặt Trận Ea Súp - Trợ lý AI của Quỹ Vì Người Nghèo xã Ea Súp. Tôi có thể giải đáp về số dư tài khoản BIDV 8630100930, số tiền thu/chi, chính sách hỗ trợ hộ nghèo, thông tin liên hệ Ban chỉ đạo và 20 thôn buôn.",
      time: "Vừa xong",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "Dạ, tôi đã ghi nhận câu hỏi. Xin liên hệ Đ/c Lê Hồng Hạnh (Chủ tịch UBMTTQ xã) qua SĐT 0888.023.023 để được hỗ trợ trực tiếp.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Hiện tại kết nối AI đang bận. Mọi thắc mắc về sao kê BIDV 8630100930 xin tra cứu trực tiếp tại tab Sao Kê hoặc liên hệ SĐT 0888.023.023.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50">
      {/* Nút bật tắt nổi bật tông hồng tươi sáng */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 sm:gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl shadow-rose-300/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-rose-300/40 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Hỏi AI Tra Cứu Sao Kê 24/7
          </span>
        </button>
      )}

      {/* Cửa sổ Chat - Tối ưu kích thước vừa vặn màn hình điện thoại */}
      {isOpen && (
        <div className="w-[calc(100vw-24px)] max-w-[360px] sm:max-w-[400px] h-[450px] sm:h-[520px] max-h-[75vh] sm:max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 p-3 sm:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  <span>Gem Mặt Trận Ea Súp</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <span className="text-[10px] sm:text-[11px] text-rose-100 block">
                  Trợ lý AI • Sao kê BIDV 8630100930
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng cửa sổ chat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Dải thông báo */}
          <div className="bg-rose-50 px-3 py-1 border-b border-rose-200 text-[10px] sm:text-[11px] text-rose-800 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Dữ liệu CSDL &amp; Casso BIDV 8630100930</span>
            </span>
          </div>

          {/* Khung tin nhắn */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 sm:space-y-3 bg-rose-50/20 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 sm:gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-[11px] sm:text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-rose-600 text-white rounded-tr-none shadow-xs"
                      : "bg-white text-slate-800 border border-rose-100 rounded-tl-none shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-rose-200" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] sm:text-[11px]">Gem đang tra cứu sao kê Ea Súp...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div className="p-2 sm:p-2.5 bg-white border-t border-rose-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="shrink-0 text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition-colors font-medium cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Chat */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 bg-white border-t border-rose-100 flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Hỏi về số dư, thu chi, 20 thôn buôn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-rose-200 px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
