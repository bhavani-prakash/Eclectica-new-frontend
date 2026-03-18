import React, { useState } from "react";
import axios from "axios";
import { API } from "../config/api.js";

export default function PermissionLetter() {
  const [rollnumber, setRollnumber] = useState("");
  const [events,     setEvents]     = useState([]);   // fetched after roll lookup
  const [event,      setEvent]      = useState("");
  const [step,       setStep]       = useState(1);    // 1 = enter roll, 2 = pick event
  const [lookupErr,  setLookupErr]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);

  // Step 1 — look up registrations for roll number
  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupErr("");
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/events-for-roll`, {
        params: { rollnumber: rollnumber.trim() },
      });
      if (data.success && data.events.length) {
        setEvents(data.events);
        setEvent(data.events[0].event);
        setStep(2);
      } else {
        setLookupErr("No registrations found for this roll number.");
      }
    } catch (err) {
      setLookupErr(err.response?.data?.message || "Could not find registrations. Please check your roll number.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — download PDF
  const handleDownload = async (e) => {
    e.preventDefault();
    if (!event) return;
    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/api/permission-letter`,
        { rollnumber: rollnumber.trim(), event },
        { responseType: "blob", timeout: 30000 }
      );

      // Check if server returned an error JSON blob
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const json = JSON.parse(text);
        alert(json.message || "Failed to generate letter.");
        return;
      }

      // Trigger browser download
      const url      = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link     = document.createElement("a");
      link.href      = url;
      link.download  = `PermissionLetter_${rollnumber.trim()}_${event.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate. Please try again.";
      alert(msg);
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setRollnumber("");
    setEvents([]);
    setEvent("");
    setLookupErr("");
  };

  const statusColor = (s) =>
    s === "verified" ? "#4ade80" : s === "free" ? "#4ade80" : "#fbbf24";

  return (
    <div>
      <section className="hero">
        <h1 className="fest-name">
          <span className="big-letter">E</span>CLECTIC<span className="big-letter">A</span>
        </h1>
        <div className="year">2k26</div>
        <h2>Permission Letter</h2>
        <p>Download your permission letter to show your Head of Department.</p>
        <p className="contact-note">Issues? Call us: +91 8125035960</p>
      </section>

      <section className="form-section">
        <div className="reg-form" style={{ maxWidth: 520 }}>

          {step === 1 && (
            <>
              <h3 style={{ color: "#f4d03f", marginBottom: 20, fontSize: "1.1rem" }}>
                📋 Enter Your Roll Number
              </h3>
              <form onSubmit={handleLookup}>
                <label>Roll Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 23691A0424"
                  required
                  value={rollnumber}
                  onChange={e => setRollnumber(e.target.value)}
                  autoFocus
                />
                {lookupErr && (
                  <p style={{ color: "#f87171", fontSize: "0.87rem", marginTop: -12, marginBottom: 14 }}>
                    ⚠️ {lookupErr}
                  </p>
                )}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Looking up…" : "Find My Registrations →"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <button
                  onClick={reset}
                  style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  ← Back
                </button>
                <h3 style={{ color: "#f4d03f", fontSize: "1.1rem", margin: 0 }}>
                  Select Event
                </h3>
              </div>

              <p style={{ color: "#aaa", fontSize: "0.88rem", marginBottom: 18 }}>
                Roll No: <strong style={{ color: "#fff" }}>{rollnumber}</strong> —{" "}
                {events.length} registration{events.length > 1 ? "s" : ""} found
              </p>

              {/* Event cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {events.map(ev => (
                  <div
                    key={ev.event}
                    onClick={() => setEvent(ev.event)}
                    style={{
                      padding: "14px 16px",
                      border: `1px solid ${event === ev.event ? "#f4d03f" : "rgba(212,175,55,0.2)"}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      background: event === ev.event ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.04)",
                      transition: "all 0.2s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: event === ev.event ? "#f4d03f" : "#ddd" }}>
                      {ev.event}
                    </span>
                    <span style={{
                      fontSize: "0.78rem", fontWeight: 600, padding: "3px 10px",
                      borderRadius: 20, background: "rgba(255,255,255,0.07)",
                      color: statusColor(ev.status),
                    }}>
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div style={{
                background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 8, padding: "12px 14px", marginBottom: 22, fontSize: "0.85rem", color: "#bbb",
              }}>
                📄 The letter will include your name, roll number, college and event details along with a QR code for verification.
              </div>

              <form onSubmit={handleDownload}>
                <button type="submit" className="btn-submit" disabled={generating || !event}>
                  {generating ? "⏳ Generating PDF…" : "⬇️ Download Permission Letter"}
                </button>
              </form>

              {generating && (
                <p className="loading-note">Please wait, generating your PDF…</p>
              )}
            </>
          )}
        </div>
      </section>

      <footer>© 2026 ECLECTICA — ECE Dept, MITS Deemed University</footer>
    </div>
  );
}
