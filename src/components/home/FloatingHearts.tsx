"use client";

import { useEffect, useState } from "react";

interface HeartItem {
  id: number;
  left: number; // % from left
  size: number; // px (36px - 68px)
  duration: number; // seconds (7s - 13s)
  delay: number; // seconds
  sway: number; // px
  rotate: number; // deg
  maxOpacity: number;
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
    // 28 trái tim với hiệu ứng ẩn hiện lấp lánh, bay lơ lửng từ dưới lên giữa trang
    const heartCount = 28;
    const generated: HeartItem[] = [];

    for (let i = 0; i < heartCount; i++) {
      generated.push({
        id: i,
        // Rải đều toàn bộ chiều ngang trang (3% đến 96%)
        left: Math.round(((i + Math.random() * 0.8) / heartCount) * 93 + 3),
        // Kích thước lớn rõ ràng: 36px đến 68px
        size: Math.floor(Math.random() * 32) + 36,
        // Thời gian bay lơ lửng từ dưới lên giữa màn hình: 7.5s đến 13s
        duration: Math.round((7.5 + Math.random() * 5.5) * 10) / 10,
        // Độ trễ ngẫu nhiên từ 0s đến 11s
        delay: Math.round((Math.random() * 11) * 10) / 10,
        // Lượn sóng lơ lửng sang hai bên (-35px đến +35px)
        sway: Math.round((Math.random() * 70) - 35),
        // Góc xoay tự nhiên từ -18deg đến +18deg
        rotate: Math.round((Math.random() * 36) - 18),
        // Độ đậm cực đại khi "hiện": 0.75 đến 0.95
        maxOpacity: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
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
              <stop offset="50%" stopColor={g.mid} />
              <stop offset="100%" stopColor={g.end} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      <style>{`
        @keyframes floatAndShimmer {
          0% {
            /* Xuất phát dưới đáy trang */
            transform: translateY(105vh) translateX(0) scale(0.65);
            opacity: 0;
            filter: drop-shadow(0 0 0px rgba(244, 63, 94, 0));
          }
          /* Nhịp 1: Hiện lên rạng rỡ */
          15% {
            transform: translateY(92vh) translateX(var(--sway-px, 25px)) scale(1.08) rotate(var(--rot-deg, 12deg));
            opacity: var(--max-op, 0.9);
            filter: drop-shadow(0 4px 14px rgba(244, 63, 94, 0.55));
          }
          /* Nhịp 1 (ẩn): Mờ dần (ẩn đi) */
          28% {
            transform: translateY(82vh) translateX(calc(var(--sway-px, 25px) * -0.5)) scale(0.85) rotate(calc(var(--rot-deg, 12deg) * -0.6));
            opacity: 0.18;
            filter: drop-shadow(0 2px 6px rgba(244, 63, 94, 0.15));
          }
          /* Nhịp 2: Lại bừng sáng hiện rõ (nhịp đập trái tim) */
          44% {
            transform: translateY(72vh) translateX(calc(var(--sway-px, 25px) * -1)) scale(1.18) rotate(calc(var(--rot-deg, 12deg) * -0.9));
            opacity: var(--max-op, 0.95);
            filter: drop-shadow(0 6px 18px rgba(244, 63, 94, 0.7));
          }
          /* Nhịp 2 (ẩn): Lại ẩn mờ dịu đi */
          58% {
            transform: translateY(63vh) translateX(calc(var(--sway-px, 25px) * 0.4)) scale(0.88) rotate(calc(var(--rot-deg, 12deg) * 0.4));
            opacity: 0.22;
            filter: drop-shadow(0 2px 8px rgba(244, 63, 94, 0.18));
          }
          /* Nhịp 3: Hiện bừng sáng lung linh lần cuối */
          75% {
            transform: translateY(54vh) translateX(var(--sway-px, 25px)) scale(1.22) rotate(var(--rot-deg, 12deg));
            opacity: var(--max-op, 0.95);
            filter: drop-shadow(0 8px 24px rgba(244, 63, 94, 0.8));
          }
          /* Đến giữa trang: Mờ dần */
          88% {
            transform: translateY(48vh) translateX(0) scale(1.08) rotate(0deg);
            opacity: 0.35;
            filter: blur(2px) drop-shadow(0 4px 12px rgba(244, 63, 94, 0.3));
          }
          /* 100%: Tan biến hoàn toàn tại giữa trang (44vh) */
          100% {
            transform: translateY(44vh) translateX(0) scale(1.42);
            opacity: 0;
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
            ["--max-op" as any]: h.maxOpacity,
            ["--sway-px" as any]: `${h.sway}px`,
            ["--rot-deg" as any]: `${h.rotate}deg`,
            animation: `floatAndShimmer ${h.duration}s ease-in-out ${h.delay}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
            className="transition-transform"
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
              opacity="0.5"
              transform="rotate(-25 7.5 7.5)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
