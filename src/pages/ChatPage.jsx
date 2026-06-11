import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useParams, useLocation } from "react-router-dom";
import FloatingRoses from "../components/FloatingRoses";
import EmojiPicker from "emoji-picker-react";

export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const isAdmin = id === "admin";
  const [senderName, setSenderName] = useState(
    isAdmin ? "Neemah" :
    location.state?.bridesmaid?.name ||
    sessionStorage.getItem("bridesmaidName") || ""
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(!isAdmin);
  const [adminPw, setAdminPw] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [notifPermission, setNotifPermission] = useState("default");
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevMsgCount = useRef(0);
  const emojiRef = useRef(null);

  // Fetch bridesmaid name if not in state
  useEffect(() => {
    if (!isAdmin && !senderName) {
      import("../firebase/config").then(({ getBridesmaidByPhone }) => {
        getBridesmaidByPhone(id).then(data => {
          if (data?.name) setSenderName(data.name);
        });
      });
    }
  }, [id, isAdmin, senderName]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  async function requestNotifPermission() {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
    }
  }

  // Track page visibility
  useEffect(() => {
    function onVisible() { setIsVisible(!document.hidden); if (!document.hidden) setNewMsgCount(0); }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Listen to messages
  useEffect(() => {
    if (!adminAuthed) return;
    const q = query(collection(db, "groupchat"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // New message badge + browser notification
      if (prevMsgCount.current > 0 && msgs.length > prevMsgCount.current) {
        const newest = msgs[msgs.length - 1];
        if (newest.sender !== senderName) {
          if (document.hidden) {
            setNewMsgCount(c => c + 1);
            // Browser notification
            if (notifPermission === "granted") {
              new Notification(`${newest.isAdmin ? "👰🏽" : "🌹"} ${newest.sender}`, {
                body: newest.text,
                icon: "/vite.svg",
                badge: "/vite.svg",
              });
            }
          }
        }
      }
      prevMsgCount.current = msgs.length;
      if (!document.hidden) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });
    return () => unsub();
  }, [adminAuthed, senderName, notifPermission]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "groupchat"), {
        text: input.trim(),
        sender: senderName,
        isAdmin,
        replyTo: replyTo ? { text: replyTo.text, sender: replyTo.sender } : null,
        createdAt: serverTimestamp(),
      });
      setInput("");
      setReplyTo(null);
      setShowEmoji(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  function handleEmojiClick(emojiData) {
    setInput(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  }

  function handleReply(msg) {
    setReplyTo(msg);
    inputRef.current?.focus();
  }

  if (isAdmin && !adminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "#FFB3C6" }}>
        <div className="rounded-3xl text-center"
          style={{ width: "100%", maxWidth: "340px", background: "rgba(255,255,255,0.92)", padding: "40px 36px", boxShadow: "0 8px 32px rgba(212,43,96,0.15)" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>💬</div>
          <h2 className="playfair italic mb-6" style={{ fontSize: "22px", color: "#D42B60" }}>Bridal Squad Chat</h2>
          <div className="flex flex-col items-center gap-4">
            <input type="password" placeholder="Admin password" value={adminPw}
              onChange={e => setAdminPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && adminPw === ADMIN_PASSWORD && setAdminAuthed(true)}
              className="text-center outline-none rounded-full"
              style={{ width: "220px", padding: "12px 24px", background: "#FFF0F5", border: "1.5px solid rgba(212,43,96,0.2)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }} />
            <button onClick={() => { if (adminPw === ADMIN_PASSWORD) setAdminAuthed(true); }}
              className="flex items-center gap-2 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: "#D42B60", padding: "12px 36px", fontSize: "14px" }}>
              <span>Enter</span><span style={{ fontSize: "16px" }}>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const isFirst = !prev || prev.sender !== msg.sender;
    const isMe = msg.sender === senderName;
    acc.push({ ...msg, isFirst, isMe });
    return acc;
  }, []);

  function formatTime(ts) {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="relative w-full overflow-hidden flex flex-col"
      style={{ background: "#FFB3C6", height: "100dvh" }}>

      <FloatingRoses />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(212,43,96,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <button onClick={() => window.history.back()}
          className="text-white/70 hover:text-white transition-colors"
          style={{ fontSize: "20px", lineHeight: 1 }}>←</button>
        <div className="flex-1 text-center">
          <h1 className="playfair italic text-white" style={{ fontSize: "18px", lineHeight: 1.2 }}>
            Muslim & Neemah 🌹
            {newMsgCount > 0 && (
              <span className="ml-2 rounded-full text-white text-xs font-bold inline-flex items-center justify-center"
                style={{ background: "#fff", color: "#D42B60", width: "20px", height: "20px", fontSize: "11px" }}>
                {newMsgCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>
            The Bridal Squad · {isAdmin ? "Neemah 👰🏽" : `${senderName} 🌹`}
          </p>
        </div>
        {/* Notification bell */}
        <button onClick={requestNotifPermission}
          title={notifPermission === "granted" ? "Notifications on" : "Enable notifications"}
          style={{ fontSize: "18px", opacity: notifPermission === "granted" ? 1 : 0.5 }}>
          🔔
        </button>
      </div>

      {/* Notification prompt banner */}
      {notifPermission === "default" && (
        <div className="relative z-10 flex items-center justify-between px-4 py-2"
          style={{ background: "rgba(212,43,96,0.85)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: "12px", color: "#fff" }}>🔔 Enable notifications to know when someone messages</p>
          <button onClick={requestNotifPermission}
            className="rounded-full text-white font-medium ml-3"
            style={{ background: "rgba(255,255,255,0.25)", padding: "4px 12px", fontSize: "11px", flexShrink: 0 }}>
            Allow
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4"
        style={{ display: "flex", flexDirection: "column", gap: "2px" }}
        onClick={() => setShowEmoji(false)}>
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center mt-20">
            <p className="playfair italic text-center"
              style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px" }}>
              No messages yet. Say something beautiful! 🌹
            </p>
          </div>
        )}

        {grouped.map((msg, i) => {
          const next = grouped[i + 1];
          const isLastInGroup = !next || next.sender !== msg.sender;
          return (
            <div key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.isMe ? "flex-end" : "flex-start",
                marginBottom: isLastInGroup ? "10px" : "2px",
              }}>
              {/* Sender name */}
              {msg.isFirst && !msg.isMe && (
                <p style={{
                  fontSize: "11px", fontWeight: 500,
                  color: msg.isAdmin ? "#fff" : "rgba(255,255,255,0.85)",
                  marginBottom: "3px", paddingLeft: "14px", letterSpacing: "0.02em",
                }}>
                  {msg.isAdmin ? "👰🏽 " : "🌹 "}{msg.sender}
                </p>
              )}

              {/* Bubble with long press to reply */}
              <div
                onDoubleClick={() => handleReply(msg)}
                style={{
                  maxWidth: "72%",
                  cursor: "pointer",
                  borderRadius: msg.isMe
                    ? (isLastInGroup ? "20px 20px 6px 20px" : "20px")
                    : (isLastInGroup ? "20px 20px 20px 6px" : "20px"),
                  background: msg.isMe ? "#D42B60" : "rgba(255,255,255,0.92)",
                  color: msg.isMe ? "#fff" : "#2C1810",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}>

                {/* Reply preview */}
                {msg.replyTo && (
                  <div style={{
                    padding: "8px 14px 6px",
                    background: msg.isMe ? "rgba(0,0,0,0.15)" : "rgba(212,43,96,0.08)",
                    borderLeft: `3px solid ${msg.isMe ? "rgba(255,255,255,0.5)" : "#D42B60"}`,
                    margin: "8px 8px 0",
                    borderRadius: "8px",
                  }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: msg.isMe ? "rgba(255,255,255,0.8)" : "#D42B60", marginBottom: "2px" }}>
                      {msg.replyTo.sender}
                    </p>
                    <p style={{ fontSize: "11px", color: msg.isMe ? "rgba(255,255,255,0.7)" : "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                      {msg.replyTo.text}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: "14px", lineHeight: 1.5, margin: 0, padding: "10px 16px" }}>
                  {msg.text}
                </p>
              </div>

              {/* Reply hint on hover */}
              {isLastInGroup && (
                <div className="flex items-center gap-1 mt-1"
                  style={{ paddingLeft: msg.isMe ? "0" : "4px", paddingRight: msg.isMe ? "4px" : "0" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
                    {formatTime(msg.createdAt)}
                  </p>
                  <button onClick={() => handleReply(msg)}
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
                    ↩ reply
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview bar */}
      {replyTo && (
        <div className="relative z-20 flex items-center justify-between px-4 py-2"
          style={{ background: "rgba(212,43,96,0.9)", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ borderLeft: "3px solid rgba(255,255,255,0.6)", paddingLeft: "10px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>
              Replying to {replyTo.sender}
            </p>
            <p style={{ fontSize: "12px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>
              {replyTo.text}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)}
            style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            ✕
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div ref={emojiRef} className="relative z-30"
          style={{ position: "absolute", bottom: "80px", left: "12px", right: "12px" }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height="320px"
            searchDisabled={false}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
            theme="light"
          />
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-20 px-3 py-3"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Emoji button */}
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setShowEmoji(v => !v); }}
            className="flex items-center justify-center rounded-full transition-all hover:scale-110 flex-shrink-0"
            style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.88)", fontSize: "20px" }}>
            😊
          </button>

          {/* Text input */}
          <div className="flex-1 rounded-3xl px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.92)", minHeight: "44px", display: "flex", alignItems: "center" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="w-full outline-none bg-transparent"
              style={{ fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#2C1810", border: "none" }}
            />
          </div>

          {/* Send button */}
          <button type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center justify-center rounded-full transition-all flex-shrink-0"
            style={{
              width: "44px", height: "44px",
              background: input.trim() ? "#D42B60" : "rgba(212,43,96,0.35)",
              transition: "background 0.2s, transform 0.15s",
              transform: input.trim() ? "scale(1.05)" : "scale(0.95)",
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}