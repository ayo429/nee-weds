import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import FloatingRoses from "./FloatingRoses";
import confetti from "canvas-confetti";

function Countdown({ weddingDate }) {
  const [time, setTime] = useState({});

  useEffect(() => {
    function calc() {
      const diff = new Date(weddingDate) - new Date();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [weddingDate]);

  return (
    <div className="flex justify-center gap-3 px-5 mb-4">
      {[["d", "Days"], ["h", "Hours"], ["m", "Mins"], ["s", "Secs"]].map(([k, label]) => (
        <div key={k}
          className="flex flex-col items-center justify-center rounded-2xl py-3 px-4"
          style={{
            minWidth: "68px",
            background: "rgba(0,0,0,0.28)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)"
          }}>
          <span className="playfair text-white text-3xl leading-none">{time[k] ?? "--"}</span>
          <span className="text-white/55 mt-1"
            style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PersonalPage({ bridesmaid }) {
  const [rsvp, setRsvp] = useState(
    bridesmaid.rsvp === "yes" || bridesmaid.rsvp === "no" ? bridesmaid.rsvp : ""
  );
  const [heartSent, setHeartSent] = useState(bridesmaid.heartSent || false);
  const [memeVisible, setMemeVisible] = useState(false);

  const weddingDate = "2026-12-14T10:00:00";

  async function handleRsvp(answer) {
    setRsvp(answer);
    if (answer === "no") {
      setMemeVisible(true);
    } else {
      setMemeVisible(false);
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 }, colors: ["#D42B60", "#FFB3C6", "#fff", "#FFD700", "#FF85A1"] });
      confetti({ particleCount: 100, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors: ["#D42B60", "#FFB3C6", "#fff"] });
      confetti({ particleCount: 100, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors: ["#D42B60", "#FFB3C6", "#fff"] });
    }
    try {
      await updateDoc(doc(db, "bridesmaid", bridesmaid.id), { rsvp: answer });
    } catch (e) { console.error(e); }
  }

  async function handleHeart() {
    setHeartSent(true);
    try {
      await updateDoc(doc(db, "bridesmaid", bridesmaid.id), { heartSent: true });
    } catch (e) { console.error(e); }
  }

  function handleRetry() {
    setMemeVisible(false);
    setRsvp("");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* Background */}
<div className="absolute inset-0 z-0">
  {rsvp === "yes" && bridesmaid.celebrationBgUrl ? (
    <img src={bridesmaid.celebrationBgUrl} alt="celebration"
      className="w-full h-full object-cover object-center"
      style={{ transition: "all 0.8s ease" }} />
  ) : bridesmaid.photoUrl ? (
    <img src={bridesmaid.photoUrl} alt={bridesmaid.name}
      className="w-full h-full object-cover object-top" />
  ) : (
    <div className="w-full h-full"
      style={{ background: "linear-gradient(160deg, #D42B60 0%, #8B1A3A 50%, #3A0A1A 100%)" }} />
  )}
  <div className="absolute inset-0"
    style={{ background: rsvp === "yes" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.45)", transition: "all 0.8s ease" }} />
</div>

      <FloatingRoses />

      {/* Page content — centered column */}
      <div className="relative z-10 flex flex-col items-center min-h-screen pb-8 pt-4">

        {/* Header */}
        <div className="text-center pt-8 pb-3 px-5 w-full">
          <h1 className="playfair italic text-white mt-2"
            style={{ fontSize: "clamp(36px, 9vw, 50px)", textShadow: "0 4px 24px rgba(0,0,0,0.4)", lineHeight: 1.1 }}>
            {bridesmaid.name}
          </h1>
          <p style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: "6px" }}>
            {bridesmaid.role}
          </p>
        </div>

        {/* Countdown */}
        <Countdown weddingDate={weddingDate} />

        {/* Cards container — max width centered */}
        <div className="w-full px-5 flex flex-col gap-5" style={{ maxWidth: "640px" }}>

          {/* Bride's message card */}
          <div className="rounded-3xl"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
            <div style={{ padding: "32px 36px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#FFB3C6", marginBottom: "16px", fontWeight: 500 }}>
                ✦ A message from the bride ✦
              </p>
              <p className="playfair italic text-white leading-loose" style={{ fontSize: "15px" }}>
                "{bridesmaid.message}"
              </p>
              <p className="playfair italic text-right mt-5" style={{ color: "#FFB3C6", fontSize: "13px" }}>
                — Neemah, with all my love 🌹
              </p>
              <div className="my-5" style={{ height: "0.5px", background: "rgba(255,255,255,0.12)" }} />
              <button
                onClick={handleHeart}
                disabled={heartSent}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: heartSent ? "#D42B60" : "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: heartSent ? "default" : "pointer",
                  letterSpacing: "0.04em",
                }}>
                <span style={{ fontSize: "16px" }}>{heartSent ? "✓" : "❤️"}</span>
                <span>{heartSent ? "Love sent!" : "Send love back"}</span>
              </button>
            </div>
          </div>

          {/* RSVP card */}
          <div className="rounded-3xl"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
            <div style={{ padding: "24px 36px" }} className="flex flex-col items-center text-center">

              {/* Question */}
              {rsvp === "" && !memeVisible && (
                <>
                  <span style={{ fontSize: "32px", marginBottom: "10px" }}>🌹</span>
                  <p className="playfair italic text-white mb-2" style={{ fontSize: "20px", lineHeight: 1.3 }}>
                    "Will you be my bridesmaid?"
                  </p>
                  <p className="playfair italic mb-6" style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>
                    — asked with all my heart, Neemah
                  </p>
                  <div className="flex gap-4 justify-center mt-2">
                    <button
                      onClick={() => handleRsvp("yes")}
                      className="rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95"
                      style={{ background: "#D42B60", fontSize: "14px", padding: "9px 36px", letterSpacing: "0.04em" }}>
                      Yes! ❤️
                    </button>
                    <button
                      onClick={() => handleRsvp("no")}
                      className="rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                      style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)", fontSize: "14px", padding: "9px 36px" }}>
                      No
                    </button>
                  </div>
                </>
              )}

              {/* YES */}
              {rsvp === "yes" && (
                <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
                  className="flex flex-col items-center gap-4">
                  <div style={{ fontSize: "32px", animation: "heartbeat 1s ease-in-out infinite" }}>
                    ❤️ 🌹 ❤️
                  </div>
                  <p className="playfair italic text-white leading-relaxed" style={{ fontSize: "19px", maxWidth: "300px" }}>
                    "She said YES! 🎉 Welcome to the most beautiful squad, my love. This day just got even more magical."
                  </p>
                  <div style={{ fontSize: "26px", animation: "heartbeat 1.2s ease-in-out 0.2s infinite" }}>
                    🌹 ❤️ 🌹
                  </div>
                </div>
              )}

              {/* NO — meme */}
              {memeVisible && (
                <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
                  className="flex flex-col items-center gap-4">
                  {bridesmaid.memeUrl ? (
                    <img
                      src={bridesmaid.memeUrl}
                      alt="meme"
                      className="rounded-2xl mx-auto"
                      style={{ width: "220px", height: "200px", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ fontSize: "64px" }}>😱</div>
                  )}
                  <p className="text-white font-medium" style={{ fontSize: "16px" }}>
                    "you wan shame me ke?"
                  </p>
                  <p className="playfair italic" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>
                    oya think about it again...
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-8 py-3 rounded-full font-medium transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", fontSize: "14px" }}>
                    OK fine, I changed my mind
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}