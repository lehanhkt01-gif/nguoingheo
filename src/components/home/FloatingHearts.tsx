"use client";

import { useEffect, useState } from "react";

interface HeartItem {
  id: number;
  left: number; // % from left
  size: number; // px (lớn gấp 3 lần: 36px - 68px)
  duration: number; // seconds
  delay: number; // seconds
  sway: number; // px
  rotate: number; // deg
  opacity: number;
  gradId: string;
}

const GRADIENTS = [
  { id: "hgrad-1", start: "#f472b6", mid: "#fb7185", end: "#e11d48" }, // Hồng phấn sang đỏ hồng
  { id: "hgrad-2", start: "#f9a8d4", mid: "#f43f5e", end: "#be123c" }, // Hồng đào sang đỏ thắm
  { id: "hgrad-3", start: "#fda4af", mid: "#ec4899", end: "#db2777" }, // Hồng cánh sen rạng rỡ
  { id: "hgrad-4", start: "#fbcfe8", mid: "#f472b6", end: "#e11d48" }, // Pastel hồng ấm áp
  { id: "hgrad-5", start: "#ff758c", mid: "#ff7eb3", end: "#f43f5e" }, // Hồng ngọc ngọt ngào
];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  useEffect(() => {
    // Tạo 26 trái tim lớn gấp 3 lần, bay từ dưới lên giữa màn hình rồi tan biến
    const heartCount = 26;
    const generated: HeartItem[] = [];

    for (let i = 0; i < heartCount; i++) {
      generated.push({
        id: i,
        // Rải đều khắp màn hình (từ 3% đến 95%)
        left: Math.round(((i + Math.random() * 0.85) / heartCount) * 92 + 4),
        // Kích thước lớn gấp 3 lần: 36px đến 68px (so với 12-22px trước đây)
        size: Math.floor(Math.random() * 32) + 36,
        // Thời gian bay từ dưới lên đến giữa màn hình từ 6.5s đến 12s
        duration: Math.round((6.5 + Math.random() * 5.5) * 10) / 10,
        // Độ trễ ngẫu nhiên từ 0s đến 10s để các trái tim bay liên tục
        delay: Math.round((Math.random() * 10) * 10) / 10,
        // Lượn sóng nhẹ nhàng sang hai bên (-32px đến +32px)
        sway: Math.round((Math.random() * 64) - 32),
        // Góc xoay nhẹ từ -18deg đến +18deg
        rotate: Math.round((Math.random() * 36) - 18),
        // Độ rõ nét từ 0.6 đến 0.88
        opacity: Math.round((0.65 + Math.random() * 0.25) * 100) / 100,
        gradId: `grad-${i % GRADIENTS.length}`,
      });
    }

    setHearts(generated);
  }, []);

  if (hearts.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none"
      aria-hidden="true"
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          {GRADIENTS.map((g, idx) => (
            <linearGradient
              key={idx}
              id={`grad-${idx}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={g.start} />
              <stop offset="55%" stopColor={g.mid} />
              <stop offset="100%" stopColor={g.end} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      <style>{`
        @keyframes floatToMidAndDissolve {
          0% {
            /* Xuất phát từ dưới đáy màn hình */
            transform: translateY(105vh) translateX(0) scale(0.65) rotate(0deg);
            opacity: 0;
            filter: blur(0px) drop-shadow(0 4px 10px rgba(244, 63, 94, 0.25));
          }
          15% {
            /* Hiện rõ dần với nhịp đập phập phồng yêu thương */
            opacity: var(--target-opacity, 0.85);
            transform: translateY(88vh) translateX(var(--sway-px, 25px)) scale(0.95) rotate(var(--rot-deg, 12deg));
          }
          40% {
            /* Lượn sóng nhịp nhàng */
            opacity: var(--target-opacity, 0.85);
            transform: translateY(72vh) translateX(calc(var(--sway-px, 25px) * -1)) scale(1.06) rotate(calc(var(--rot-deg, 12deg) * -0.7));
          }
          65% {
            /* Tiếp tục bay lên đến nửa dưới */
            opacity: var(--target-opacity, 0.85);
            transform: translateY(58vh) translateX(var(--sway-px, 25px)) scale(1.02) rotate(var(--rot-deg, 12deg));
          }
          82% {
            /* Đến gần giữa màn hình: nở nhẹ, phát sáng lung linh chuẩn bị tan */
            opacity: var(--target-opacity, 0.8);
            transform: translateY(48vh) translateX(0) scale(1.18) rotate(0deg);
            filter: blur(1px) drop-shadow(0 6px 20px rgba(244, 63, 94, 0.65));
          }
          100% {
            /* Tan biến hoàn toàn tại giữa màn hình (42vh) */
            opacity: 0;
            transform: translateY(42vh) translateX(0) scale(1.42) rotate(calc(var(--rot-deg, 12deg) * 1.5));
            filter: blur(8px) drop-shadow(0 0 25px rgba(251, 113, 133, 0));
          }
        }
      `}</style>

      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute will-change-transform"
          style={{
            left: `${h.left}%`,
            bottom: 0,
            width: `${h.size}px`,
            height: `${h.size}px`,
            ["--target-opacity" as any]: h.opacity,
            ["--sway-px" as any]: `${h.sway}px`,
            ["--rot-deg" as any]: `${h.rotate}deg`,
            animation: `floatToMidAndDissolve ${h.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) ${h.delay}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
            className="transition-transform drop-shadow-md"
          >
            {/* Hình trái tim gradient 3D */}
            <path
              fill={`url(#${h.gradId})`}
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
            {/* Điểm sáng bóng highlight thủy tinh bóng bẩy */}
            <ellipse
              cx="7.5"
              cy="7.5"
              rx="3"
              ry="1.8"
              fill="#ffffff"
              opacity="0.45"
              transform="rotate(-25 7.5 7.5)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
