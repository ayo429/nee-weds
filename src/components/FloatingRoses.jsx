import { useEffect, useRef } from "react";

const ITEMS = [
  { emoji: "🌹", size: 28, left: 5, delay: 0, duration: 8 },
  { emoji: "❤️", size: 22, left: 12, delay: 1.2, duration: 7 },
  { emoji: "🌹", size: 32, left: 20, delay: 2.5, duration: 9 },
  { emoji: "❤️", size: 18, left: 28, delay: 0.5, duration: 6.5 },
  { emoji: "🌹", size: 26, left: 35, delay: 3, duration: 8.5 },
  { emoji: "❤️", size: 24, left: 42, delay: 1.8, duration: 7.5 },
  { emoji: "🌹", size: 30, left: 50, delay: 0.3, duration: 9 },
  { emoji: "❤️", size: 20, left: 58, delay: 2.2, duration: 6 },
  { emoji: "🌹", size: 28, left: 65, delay: 1, duration: 8 },
  { emoji: "❤️", size: 26, left: 72, delay: 3.5, duration: 7 },
  { emoji: "🌹", size: 22, left: 80, delay: 0.8, duration: 9.5 },
  { emoji: "❤️", size: 30, left: 88, delay: 2, duration: 7 },
  { emoji: "🌹", size: 24, left: 93, delay: 1.5, duration: 8 },
  { emoji: "❤️", size: 18, left: 8, delay: 4, duration: 6.5 },
  { emoji: "🌹", size: 32, left: 16, delay: 2.8, duration: 10 },
  { emoji: "❤️", size: 22, left: 24, delay: 0.6, duration: 7.5 },
  { emoji: "🌹", size: 26, left: 33, delay: 3.8, duration: 8 },
  { emoji: "❤️", size: 28, left: 45, delay: 1.4, duration: 9 },
  { emoji: "🌹", size: 20, left: 55, delay: 2.6, duration: 6.5 },
  { emoji: "❤️", size: 24, left: 63, delay: 0.2, duration: 8.5 },
  { emoji: "🌹", size: 28, left: 70, delay: 3.2, duration: 7 },
  { emoji: "❤️", size: 22, left: 78, delay: 1.6, duration: 9 },
  { emoji: "🌹", size: 26, left: 85, delay: 0.9, duration: 8 },
  { emoji: "❤️", size: 30, left: 96, delay: 2.4, duration: 7.5 },
  { emoji: "🌹", size: 18, left: 3, delay: 3.6, duration: 6 },
  { emoji: "❤️", size: 26, left: 38, delay: 1.1, duration: 8.5 },
  { emoji: "🌹", size: 24, left: 48, delay: 4.2, duration: 9 },
  { emoji: "❤️", size: 20, left: 60, delay: 0.7, duration: 7 },
  { emoji: "🌹", size: 28, left: 75, delay: 2.9, duration: 8 },
  { emoji: "❤️", size: 22, left: 91, delay: 1.3, duration: 6.5 },
];

export default function FloatingRoses() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {ITEMS.map((item, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-60px",
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animation: `floatDown ${item.duration}s ease-in-out ${item.delay}s infinite`,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {item.emoji}
        </span>
      ))}

      <style>{`
        @keyframes floatDown {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(110vh) rotate(25deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}