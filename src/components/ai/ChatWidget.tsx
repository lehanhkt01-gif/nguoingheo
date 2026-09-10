"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, Bot, User, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "Số dư tài khoản BIDV 8630100930 hôm nay?",
  "Định mức hỗ trợ xây nhà Đại đoàn kết?",
  "20 thôn, buôn thuộc xã Ea Súp gồm những đâu?",
  "Cú pháp chuyển khoản ủng hộ VietQR?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin kính chào quý đồng bào và nhà hảo tâm! Tôi là Gem Mặt Trận Ea Súp - Trợ lý AI của Ban Vận động Quỹ Vì Người Nghèo xã Ea Súp. Tôi có thể hỗ trợ quý vị tra cứu số dư tài khoản BIDV 8630100930, định mức hỗ trợ và quy chế minh bạch 20 thôn buôn.",
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
        text: data.reply || "Dạ, tôi đã ghi nhận ý kiến. Xin vui lòng liên hệ trực tiếp UBMTTQ xã Ea Súp để được hỗ trợ tốt nhất.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Hiện tại kết nối AI đang bận. Mọi thắc mắc về sao kê BIDV 8630100930 xin tra cứu trực tiếp tại tab Sao Kê.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bật tắt nổi bật */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-700 via-brand-600 to-amber-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-amber-400/40"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Hỏi AI Tra Cứu Sao Kê 24/7
          </span>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-red-800 to-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Gem Mặt Trận Ea Súp</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <span className="text-[11px] text-amber-200/80">
                  Trợ lý AI • Sao kê BIDV 8630100930
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dải thông báo */}
          <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Dữ liệu đối soát trực tiếp từ CSDL & Casso Banking
            </span>
          </div>

          {/* Khung tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-red-700 text-amber-300 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-red-700 text-white rounded-tr-none shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-red-200" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">Gem đang tra cứu sao kê Ea Súp...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors"
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
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi về số dư, quy chế, danh sách 20 thôn buôn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-red-700 hover:bg-red-800 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
