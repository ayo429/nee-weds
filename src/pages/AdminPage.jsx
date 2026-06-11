import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const EMPTY_FORM = {
  name: "", phone: "", role: "Bridesmaid", message: "",
  photoUrl: "", memeUrl: "", celebrationBgUrl: "", rsvp: "", heartSent: false
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [bridesmaids, setBridesmaids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function handleLogin(e) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      fetchBridesmaids();
    } else {
      setPwError("Incorrect password. Try again.");
    }
  }

  async function fetchBridesmaids() {
    setLoading(true);
    const snap = await getDocs(collection(db, "bridesmaid"));
    setBridesmaids(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const cleaned = form.phone.replace(/[\s\-\(\)\+]/g, "");
      const normalized = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;

      if (editId) {
        await updateDoc(doc(db, "bridesmaid", editId), {
          name: form.name, role: form.role, message: form.message,
          photoUrl: form.photoUrl, memeUrl: form.memeUrl,
          celebrationBgUrl: form.celebrationBgUrl,
        });
      } else {
        await addDoc(collection(db, "bridesmaid"), {
          ...form,
          id: normalized,
          heartSent: false, rsvp: "",
        });
        // Use phone as doc ID
        const snap = await getDocs(collection(db, "bridesmaid"));
        const newDoc = snap.docs.find(d => d.data().name === form.name && d.data().photoUrl === form.photoUrl);
        if (newDoc) {
          // re-add with proper ID
          await deleteDoc(newDoc.ref);
          const { id: _, ...rest } = { ...form, heartSent: false, rsvp: "" };
          const { setDoc } = await import("firebase/firestore");
          const docRef = doc(db, "bridesmaid", normalized);
          await setDoc(docRef, rest);
        }
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchBridesmaids();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "bridesmaid", id));
    setDeleteConfirm(null);
    fetchBridesmaids();
  }

  function handleEdit(b) {
    setForm({ ...b, phone: b.id });
    setEditId(b.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "#FFB3C6" }}>
        <div className="rounded-3xl text-center"
          style={{ width: "100%", maxWidth: "360px", background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 32px rgba(212,43,96,0.15)", padding: "40px 36px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>👰🏽</div>
          <h1 className="playfair italic mb-1" style={{ fontSize: "26px", color: "#D42B60" }}>
            Admin Dashboard
          </h1>
          <p className="playfair italic mb-8" style={{ fontSize: "13px", color: "#9B7B6A" }}>
            Muslim & Neemah Wedding
          </p>
          <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="text-center outline-none rounded-full"
              style={{ width: "240px", padding: "12px 24px", background: "#FFF0F5", border: "1.5px solid rgba(212,43,96,0.2)", fontSize: "16px", fontFamily: "'DM Sans', sans-serif" }}
            />
            {pwError && <p style={{ color: "#D42B60", fontSize: "12px" }}>{pwError}</p>}
            <button type="submit"
              className="flex items-center gap-2 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: "#D42B60", fontSize: "14px", padding: "12px 36px", letterSpacing: "0.06em" }}>
              <span>Enter</span><span style={{fontSize:"16px"}}>→</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: "#FFF0F5" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="playfair italic" style={{ fontSize: "32px", color: "#D42B60" }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: "12px", color: "#9B7B6A", marginTop: "2px" }}>
              Muslim & Neemah Wedding 🌹
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = "/chat/admin"}
              className="rounded-full font-medium transition-all hover:scale-105"
              style={{ background: "#FFF0F5", color: "#D42B60", border: "1px solid rgba(212,43,96,0.2)", padding: "8px 16px", fontSize: "12px", letterSpacing: "0.02em" }}>
              💬 Chat
            </button>
            <button
              onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditId(null); }}
              className="rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: "#D42B60", padding: "8px 16px", fontSize: "12px", letterSpacing: "0.02em" }}>
              + Add
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="rounded-3xl p-6 mb-8"
            style={{ background: "#fff", border: "1px solid rgba(212,43,96,0.15)", boxShadow: "0 4px 20px rgba(212,43,96,0.08)" }}>
            <h2 className="playfair italic mb-5" style={{ fontSize: "20px", color: "#D42B60" }}>
              {editId ? "Edit Bridesmaid" : "Add New Bridesmaid"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Barakah"
                    className="w-full outline-none rounded-xl px-4 py-2.5"
                    style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
                {!editId && (
                  <div>
                    <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Phone Number</label>
                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 08012345678"
                      className="w-full outline-none rounded-xl px-4 py-2.5"
                      style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }} />
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Personal Message</label>
                <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Write a personal message from the bride..."
                  rows={4}
                  className="w-full outline-none rounded-xl px-4 py-3"
                  style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Photo URL</label>
                  <input value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })}
                    placeholder="Cloudinary URL"
                    className="w-full outline-none rounded-xl px-4 py-2.5"
                    style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Celebration Photo URL</label>
                  <input value={form.celebrationBgUrl} onChange={e => setForm({ ...form, celebrationBgUrl: e.target.value })}
                    placeholder="Cloudinary URL"
                    className="w-full outline-none rounded-xl px-4 py-2.5"
                    style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B7B6A", display: "block", marginBottom: "6px" }}>Meme URL</label>
                <input value={form.memeUrl} onChange={e => setForm({ ...form, memeUrl: e.target.value })}
                  placeholder="Cloudinary URL"
                  className="w-full outline-none rounded-xl px-4 py-2.5"
                  style={{ background: "#FFF0F5", border: "1px solid rgba(212,43,96,0.2)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }} />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
                  className="rounded-full font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(212,43,96,0.08)", color: "#D42B60", padding: "10px 24px", fontSize: "13px" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-full text-white font-medium transition-all hover:scale-105"
                  style={{ background: "#D42B60", padding: "10px 28px", fontSize: "13px", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editId ? "Save Changes" : "Add Bridesmaid"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bridesmaids list */}
        {loading ? (
          <p className="playfair italic text-center" style={{ color: "#D42B60", fontSize: "18px" }}>Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {bridesmaids.map(b => (
              <div key={b.id} className="rounded-3xl p-5 flex items-center gap-4"
                style={{ background: "#fff", border: "1px solid rgba(212,43,96,0.12)", boxShadow: "0 2px 12px rgba(212,43,96,0.06)" }}>

                {/* Photo */}
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#FFF0F5" }}>
                  {b.photoUrl ? (
                    <img src={b.photoUrl} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "24px" }}>🌹</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="playfair italic" style={{ fontSize: "20px", color: "#2C1810" }}>{b.name}</p>
                  <p style={{ fontSize: "11px", color: "#9B7B6A", marginTop: "2px" }}>+{b.id}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className="rounded-full px-3 py-1 text-xs"
                      style={{ background: b.rsvp === "yes" ? "#D4EDDA" : b.rsvp === "no" ? "#F8D7DA" : "#FFF0F5", color: b.rsvp === "yes" ? "#155724" : b.rsvp === "no" ? "#721C24" : "#9B7B6A" }}>
                      {b.rsvp === "yes" ? "✓ Accepted" : b.rsvp === "no" ? "✗ Declined" : "⏳ Pending"}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs"
                      style={{ background: b.heartSent ? "#FFE0EC" : "#F5F5F5", color: b.heartSent ? "#D42B60" : "#9B7B6A" }}>
                      {b.heartSent ? "❤️ Love sent" : "No love yet"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(b)}
                    className="rounded-full font-medium transition-all hover:scale-105"
                    style={{ background: "#FFF0F5", color: "#D42B60", padding: "8px 16px", fontSize: "12px", border: "1px solid rgba(212,43,96,0.2)" }}>
                    Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(b.id)}
                    className="rounded-full font-medium transition-all hover:scale-105"
                    style={{ background: "#FFF0F5", color: "#c0392b", padding: "8px 16px", fontSize: "12px", border: "1px solid rgba(192,57,43,0.2)" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-5"
            style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="rounded-3xl p-8 text-center w-full"
              style={{ maxWidth: "360px", background: "#fff" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>😬</div>
              <p className="playfair italic mb-2" style={{ fontSize: "18px", color: "#2C1810" }}>Are you sure?</p>
              <p style={{ fontSize: "13px", color: "#9B7B6A", marginBottom: "24px" }}>
                This will permanently delete this bridesmaid.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)}
                  className="rounded-full font-medium"
                  style={{ background: "#F5F5F5", color: "#666", padding: "10px 24px", fontSize: "13px" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-full text-white font-medium"
                  style={{ background: "#c0392b", padding: "10px 24px", fontSize: "13px" }}>
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}