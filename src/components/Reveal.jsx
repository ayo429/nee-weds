import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingRoses from "./FloatingRoses";

export default function Reveal({ bridesmaid, onEnter }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
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

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6">
        <AnimatePresence>
          {step >= 1 && (
            <>
              {/* Arc photo */}
              <motion.div
                key="photo"
                initial={{ scale: 0.5, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, type: "spring", bounce: 0.4 }}
                className="relative mb-6"
                style={{
                  width: "200px",
                  height: "220px",
                }}>
                {/* Outer glow ring */}
                <div style={{
                  position: "absolute", inset: "-4px",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  background: "rgba(255,255,255,0.3)",
                  zIndex: 0,
                }} />
                {/* Rose gold border ring */}
                <div style={{
                  position: "absolute", inset: "-2px",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  border: "2.5px solid rgba(255,255,255,0.7)",
                  zIndex: 2,
                  pointerEvents: "none",
                }} />
                {/* Photo */}
                {bridesmaid.photoUrl ? (
                  <img
                    src={bridesmaid.photoUrl}
                    alt={bridesmaid.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    background: "linear-gradient(160deg, #D42B60, #8B1A3A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "64px", position: "relative", zIndex: 1,
                  }}>
                    🌹
                  </div>
                )}
              </motion.div>

              {/* Tag line above name */}
              <motion.p
                key="tag"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{
                  fontSize: "11px", letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
                  marginBottom: "8px", fontFamily: "'DM Sans', sans-serif"
                }}>
                you are invited
              </motion.p>

              {/* Name */}
              <motion.h1
                key="name"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.6, type: "spring", bounce: 0.45 }}
                className="playfair italic text-white text-center"
                style={{ fontSize: "clamp(40px, 12vw, 58px)", textShadow: "0 4px 24px rgba(0,0,0,0.15)", lineHeight: 1.1, marginBottom: "10px" }}>
                {bridesmaid.name}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                key="sub"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="playfair italic text-center"
                style={{ color: "rgba(255,255,255,0.78)", fontSize: "15px", marginBottom: "6px" }}>
                it's my time to pop the question
              </motion.p>

              {/* Hearts */}
              <motion.div
                key="hearts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex gap-2 mb-10">
                {["❤️", "🌹", "❤️"].map((e, i) => (
                  <span key={i} style={{
                    fontSize: "20px",
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
            className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
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