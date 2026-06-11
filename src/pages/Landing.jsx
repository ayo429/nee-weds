import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBridesmaidByPhone } from "../firebase/config";
import FloatingRoses from "../components/FloatingRoses";

export default function Landing() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  function handleOpen() {
    setOpened(true);
    setTimeout(() => setShowForm(true), 950);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
    const normalized = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;
    try {
      const bridesmaid = await getBridesmaidByPhone(normalized);
      if (bridesmaid) {
        navigate(`/bridesmaid/${normalized}`, { state: { bridesmaid } });
      } else {
        setError("We don't recognise that number, love. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "#FFB3C6" }}>

      <FloatingRoses />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-10">

        {/* Top text */}
        <div className="text-center mb-10">
          <p className="playfair italic text-white/80 text-sm tracking-widest mb-2">
            you are cordially invited
          </p>
          <h1 className="playfair italic text-white"
            style={{ fontSize: "clamp(36px, 8vw, 56px)", textShadow: "0 2px 16px rgba(180,40,80,0.22)", lineHeight: 1.1 }}>
            Muslim & Neemah
          </h1>
        </div>

        {/* ENVELOPE */}
        {!showForm && (
          <div style={{ animation: "floatenv 4s ease-in-out infinite" }}>
            <div className="relative bg-white rounded-md"
              style={{
                width: "min(340px, 88vw)",
                height: "220px",
                border: "1.5px solid rgba(220,100,130,0.18)",
                boxShadow: "0 8px 32px rgba(180,40,80,0.15)"
              }}>
              {/* Left fold */}
              <div className="absolute bottom-0 left-0" style={{ width: 0, height: 0, borderBottom: "110px solid #FFE0EC", borderRight: "170px solid transparent" }} />
              {/* Right fold */}
              <div className="absolute bottom-0 right-0" style={{ width: 0, height: 0, borderBottom: "110px solid #FFCEDD", borderLeft: "170px solid transparent" }} />
              {/* Flap */}
              <div className="absolute top-0 left-0 right-0" style={{
                width: 0, height: 0,
                borderLeft: "170px solid transparent",
                borderRight: "170px solid transparent",
                borderTop: opened ? "0px solid #FFCEDD" : "105px solid #FFCEDD",
                transformOrigin: "top center",
                transform: opened ? "rotateX(175deg)" : "rotateX(0deg)",
                transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 4
              }} />
              {/* Wax seal */}
              <button onClick={handleOpen}
                className="absolute flex flex-col items-center justify-center gap-1 cursor-pointer"
                style={{
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "68px", height: "68px",
                  background: "#D42B60", borderRadius: "50%",
                  border: "3.5px solid #fff",
                  boxShadow: "0 0 0 2px #D42B60, 0 3px 14px rgba(180,30,70,0.38)",
                  zIndex: 10,
                  transition: "transform 0.18s ease"
                }}>
                <span style={{ fontSize: "22px", lineHeight: 1 }}>🌹</span>
                <span className="text-white font-medium"
                  style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Open
                </span>
              </button>
            </div>
            <p className="playfair italic text-center text-white/75 text-xs mt-3 tracking-wide">
              press the wax seal to open
            </p>
          </div>
        )}

        {/* PHONE FORM */}
        {showForm && (
          <div className="flex flex-col items-center gap-5 w-full max-w-sm"
            style={{ animation: "fadeUp 0.5s ease both" }}>
            <p className="playfair italic text-white/90 text-sm text-center">
              enter your phone number to step inside
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">

              {/* Phone input — invisible background, just placeholder visible */}
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full text-center outline-none"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid rgba(255,255,255,0.6)",
                  color: "#fff",
                  fontSize: "16px",
                  padding: "12px 8px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  letterSpacing: "0.06em",
                  caretColor: "#fff",
                }}
              />

              {error && (
                <p className="playfair italic text-white/80 text-xs text-center px-2">
                  {error}
                </p>
              )}

              {/* Enter button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "#D42B60",
                  color: "#fff",
                  fontSize: "15px",
                  padding: "14px 40px",
                  letterSpacing: "0.08em",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 20px rgba(212,43,96,0.4)",
                }}>
                <span>{loading ? "Finding you..." : "Enter"}</span>
                {!loading && <span style={{ fontSize: "18px" }}>→</span>}
              </button>
            </form>

            <button
              onClick={() => { setShowForm(false); setOpened(false); setError(""); }}
              className="text-white/50 text-xs underline underline-offset-2 mt-1">
              ← back to envelope
            </button>
          </div>
        )}
      </div>

      {/* Discreet admin link */}
      <div className="absolute bottom-4 right-4 z-20">
        <a href="/admin"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0.08em" }}>
          admin
        </a>
      </div>

      <style>{`
        @keyframes floatenv {
          0%, 100% { transform: translateY(0) rotate(-0.7deg); }
          50% { transform: translateY(-13px) rotate(0.7deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.55); }
      `}</style>
    </div>
  );
}