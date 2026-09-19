"use client";

import { useEffect, useState } from "react";

interface HeartItem {
  id: number;
  left: number; // % from left
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  sway: number; // px
  rotate: number; // deg
  opacity: number;
  color: string;
}

const PINK_PALETTE = [
  "#f472b6", // pink-400
  "#fb7185", // rose-400
  "#f9a8d4", // pink-300
  "#fda4af", // rose-300
  "#f43f5e", // rose-500
  "#ec4899", // pink-500
];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  useEffect(() => {
    // Tạo danh sách các trái tim hồng bay lơ lửng ngẫu nhiên, mượt mà
    const heartCount = 22;
    const generated: HeartItem[] = [];

    for (let i = 0; i < heartCount; i++) {
      generated.push({
        id: i,
        // Rải đều trên chiều ngang màn hình với độ lệch ngẫu nhiên nhẹ
        left: Math.round(((i + Math.random() * 0.8) / heartCount) * 96 + 2),
        // Kích thước to hơn rõ nét: từ 24px đến 42px
        size: Math.floor(Math.random() * 19) + 24,
        // Thời gian bay từ dưới lên từ 9s đến 18s để chuyển động thật êm ái
        duration: Math.floor(Math.random() * 9) + 10,
        // Độ trễ xuất hiện từ 0s đến 12s để các trái tim bay liên tục không ngắt quãng
        delay: Math.round((Math.random() * 12) * 10) / 10,
        // Độ lượn sóng ngang nhẹ nhàng từ -24px đến +24px
        sway: Math.round((Math.random() * 36) - 18),
        // Góc xoay nhẹ từ -20deg đến +20deg
        rotate: Math.round((Math.random() * 40) - 20),
        // Độ trong suốt nhẹ dịu từ 0.35 đến 0.65 để không che khuất chữ
        opacity: Math.round((0.35 + Math.random() * 0.3) * 100) / 100,
        color: PINK_PALETTE[i % PINK_PALETTE.length],
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
      <style>{`
        @keyframes floatHeartUp {
          0% {
            transform: translateY(106vh) translateX(0) scale(0.7) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: var(--target-opacity, 0.6);
          }
          50% {
            transform: translateY(52vh) translateX(var(--sway-px, 20px)) scale(1.08) rotate(var(--rot-deg, 15deg));
          }
          88% {
            opacity: var(--target-opacity, 0.6);
          }
          100% {
            transform: translateY(-8vh) translateX(calc(var(--sway-px, 20px) * -0.8)) scale(0.85) rotate(calc(var(--rot-deg, 15deg) * -1.2));
            opacity: 0;
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
            animation: `floatHeartUp ${h.duration}s cubic-bezier(0.35, 0.1, 0.25, 1) ${h.delay}s infinite`,
            filter: "drop-shadow(0 2px 6px rgba(244, 114, 182, 0.38))",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
            fill={h.color}
            className="transition-transform"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
