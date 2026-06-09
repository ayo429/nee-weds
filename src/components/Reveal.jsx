import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingRoses from "./FloatingRoses";

export default function Reveal({ bridesmaid, onEnter }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Always restart from step 0 when component mounts
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [bridesmaid?.name]);

  if (!bridesmaid) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "#FFB3C6" }}>

      <FloatingRoses />

      {/* Curtains */}
      <motion.div
        className="absolute top-0 left-0 h-full z-30"
        style={{ width: "50%", background: "#D42B60" }}
        animate={{ x: step >= 1 ? "-100%" : "0%" }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
      />
      <motion.div
        className="absolute top-0 right-0 h-full z-30"
        style={{ width: "50%", background: "#D42B60" }}
        animate={{ x: step >= 1 ? "100%" : "0%" }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
      />

      {/* Name burst */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <AnimatePresence>
          {step >= 1 && (
            <>
              {/* Ring */}
              <motion.div
                key="ring"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.5 }}
                className="flex items-center justify-center rounded-full mb-5"
                style={{
                  width: "150px", height: "150px",
                  border: "2px solid rgba(255,255,255,0.55)"
                }}>
                <div className="flex items-center justify-center rounded-full"
                  style={{
                    width: "116px", height: "116px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    fontSize: "48px"
                  }}>
                  🌹
                </div>
              </motion.div>

              {/* Name */}
              <motion.h1
                key="name"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6, type: "spring", bounce: 0.45 }}
                className="playfair italic text-white text-center"
                style={{ fontSize: "56px", textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
                {bridesmaid.name}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                key="sub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="playfair italic text-white/80 text-base mt-2">
                your special day awaits
              </motion.p>

              {/* Hearts */}
              <motion.div
                key="hearts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                className="flex gap-2 mt-4">
                {["❤️", "🌹", "❤️"].map((e, i) => (
                  <span key={i} style={{
                    fontSize: "22px",
                    display: "inline-block",
                    animation: `heartbeat 1.2s ease-in-out ${i * 0.15}s infinite`
                  }}>{e}</span>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Enter button */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            key="enterbtn"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-16 left-0 right-0 flex justify-center z-20">
            <button
              onClick={onEnter}
              className="flex items-center gap-2 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                background: "#fff",
                color: "#D42B60",
                fontSize: "15px",
                padding: "14px 40px",
                letterSpacing: "0.08em",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}>
              <span>Enter my page</span>
              <span style={{ fontSize: "18px" }}>→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}