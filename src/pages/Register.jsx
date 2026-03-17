import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API } from "../config/api.js";
import qrImage from "../assets/qr.jpeg";

const EVENT_FEES = {
  "Tech Quiz": 70, "Bug Hunters": 70, "Circuit Detective": 70,
  "Paper Presentation": 70, "Poster Presentation": 70,
  "Project Expo": 100, "Debate": 0,
  "Free Fire": 200, "BGMI": 200,
  "cineQuest": 50, "Balloon Spirit": 50, "Rope Rumble": 50, "Ball Heist": 50,
};

const TECH_EVENTS     = ["Tech Quiz","Bug Hunters","Circuit Detective","Paper Presentation","Poster Presentation","Project Expo","Debate"];
const NONTECH_EVENTS  = ["Free Fire","BGMI","cineQuest","Balloon Spirit","Rope Rumble","Ball Heist"];

export default function Register() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();

  // form state
  const [name,            setName]           = useState("");
  const [email,           setEmail]          = useState("");
  const [college,         setCollege]        = useState("");
  const [rollnumber,      setRollnumber]     = useState("");
  const [contactnumber,   setContact]        = useState("");
  const [whatsappnumber,  setWhatsapp]       = useState("");
  const [year,            setYear]           = useState("");
  const [department,      setDepartment]     = useState("");
  const [eventType,       setEventType]      = useState("");
  const [event,           setEvent]          = useState("");
  const [fee,             setFee]            = useState(0);
  const [utrNumber,       setUtr]            = useState("");
  const [screenshot,      setScreenshot]     = useState(null);
  const [preview,         setPreview]        = useState(null);
  const [loading,         setLoading]        = useState(false);

  // pre-fill from URL params (coming from Tech / NonTech pages)
  const urlEvent = params.get("event") ? decodeURIComponent(params.get("event")) : "";
  const urlType  = params.get("type")  || "";

  useEffect(() => {
    if (urlEvent && urlType) {
      setEvent(urlEvent);
      setEventType(urlType);
      setFee(EVENT_FEES[urlEvent] ?? 0);
    }
  }, []);

  const isFree   = event === "Debate";
  const isFromUrl = Boolean(urlEvent && urlType);
  const isRedirected = params.get("redirected") === "true";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    if (file.size > 12 * 1024 * 1024)   { alert("Image must be under 12 MB."); return; }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // basic validation
    if (!name.trim() || !email.trim() || !college.trim() || !rollnumber.trim() ||
        !contactnumber.trim() || !whatsappnumber.trim() || !year || !department.trim() ||
        !eventType || !event) {
      alert("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!isFree && !screenshot) {
      alert("Please upload your payment screenshot.");
      return;
    }
    if (!isFree && !utrNumber.trim()) {
      alert("Please enter the UTR / reference number.");
      return;
    }

    const formData = new FormData();
    formData.append("name",           name.trim());
    formData.append("email",          email.trim());
    formData.append("college",        college.trim());
    formData.append("rollnumber",     rollnumber.trim());
    formData.append("contactnumber",  contactnumber.trim());
    formData.append("whatsappnumber", whatsappnumber.trim());
    formData.append("year",           year);
    formData.append("department",     department.trim());
    formData.append("eventType",      eventType);
    formData.append("event",          event);
    if (!isFree && utrNumber.trim()) formData.append("utrNumber", utrNumber.trim());
    if (!isFree && screenshot)       formData.append("screenshot", screenshot);

    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/register`, formData, { timeout: 60000 });

      if (data.success) {
        if (data.alreadyRegistered) {
          alert("You are already registered for this event.");
        } else {
          navigate("/greeting");
        }
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      alert(msg || "Could not connect to server. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1 className="fest-name"><span className="big-letter">E</span>CLECTIC<span className="big-letter">A</span></h1>
        <div className="year">2k26</div>
        <h2>Registration Form</h2>
        <p>Fill in your details and register for Eclectica 2k26!</p>
        <p className="contact-note">Issues? Call us: +91 8125035960</p>
      </section>

      <section className="form-section">
        <form className="reg-form" onSubmit={handleSubmit}>

          {/* Redirect banner */}
          {isRedirected && (
            <div className="redirect-banner">
              ⚡ You've been redirected from the old registration site. Please complete your registration here.
            </div>
          )}

          {/* Selected event banner */}
          {event && (
            <div className="event-banner">
              <h3>📋 {event}</h3>
              <p>{isFree ? "Free Event — No payment required" : `Registration Fee: ₹${fee}`}</p>
            </div>
          )}

          <label>Full Name *</label>
          <input type="text" placeholder="Your full name" required value={name} onChange={e => setName(e.target.value)} />

          <label>College Email *</label>
          <input type="email" placeholder="your@email.com" required value={email} onChange={e => setEmail(e.target.value)} />

          <label>College Name *</label>
          <input type="text" placeholder="Your college name" required value={college} onChange={e => setCollege(e.target.value)} />

          <label>Roll Number *</label>
          <input type="text" placeholder="Your roll number" required value={rollnumber} onChange={e => setRollnumber(e.target.value)} />

          <label>Contact Number *</label>
          <input
            type="tel" placeholder="10-digit mobile number" required maxLength={10}
            value={contactnumber}
            onChange={e => setContact(e.target.value.replace(/\D/g, ""))}
          />

          <label>WhatsApp Number *</label>
          <input
            type="tel" placeholder="WhatsApp number" required maxLength={10}
            value={whatsappnumber}
            onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ""))}
          />

          <label>Year *</label>
          <select required value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <label>Department *</label>
          <input type="text" placeholder="e.g. ECE, CSE, EEE" required value={department} onChange={e => setDepartment(e.target.value)} />

          {/* Event Type — locked if coming from event pages */}
          <label>Event Type *</label>
          <select
            required value={eventType}
            disabled={isFromUrl}
            onChange={e => { setEventType(e.target.value); setEvent(""); setFee(0); }}
            style={isFromUrl ? { opacity: 0.7, cursor: "not-allowed" } : {}}
          >
            <option value="">Select Event Type</option>
            <option value="technical">Technical</option>
            <option value="non-technical">Non-Technical</option>
          </select>

          {/* Event — locked if coming from event pages */}
          {eventType && (
            <>
              <label>Event *</label>
              <select
                required value={event}
                disabled={isFromUrl}
                onChange={e => { setEvent(e.target.value); setFee(EVENT_FEES[e.target.value] ?? 0); setScreenshot(null); setPreview(null); setUtr(""); }}
                style={isFromUrl ? { opacity: 0.7, cursor: "not-allowed" } : {}}
              >
                <option value="">Select Event</option>
                {(eventType === "technical" ? TECH_EVENTS : NONTECH_EVENTS).map(ev => (
                  <option key={ev} value={ev}>{ev} — {EVENT_FEES[ev] === 0 ? "Free" : `₹${EVENT_FEES[ev]}`}</option>
                ))}
              </select>
            </>
          )}

          {/* Payment section */}
          {event && !isFree && (
            <div className="payment-box">
              <h4>💳 Payment — ₹{fee}</h4>
              <p>Scan the QR code below, pay ₹{fee}, then upload the screenshot and enter the UTR number.</p>
              <div className="qr-wrap">
                <img src={qrImage} alt="Payment QR" />
              </div>
              <p className="upi-name">Munaga Sreeram</p>

              <div className="file-input-wrapper" style={{ textAlign: "left", marginTop: "16px" }}>
                <label>Upload Payment Screenshot *</label>
                <input type="file" accept="image/*" required onChange={handleFile} />
                <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>JPG, PNG, WEBP — max 12 MB</p>
                {preview && <img src={preview} alt="preview" className="screenshot-preview" />}
              </div>

              <label style={{ display: "block", textAlign: "left", marginTop: "4px" }}>UTR / Reference Number *</label>
              <input
                type="text" placeholder="Enter transaction reference number"
                required value={utrNumber} onChange={e => setUtr(e.target.value)}
                style={{ width: "100%", padding: "11px 13px", marginBottom: 0, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
              />
              <p style={{ fontSize: "12px", color: "#888", marginTop: "4px", textAlign: "left" }}>Found in your UPI app under transaction details.</p>
            </div>
          )}

          {/* Free event note */}
          {event && isFree && (
            <div className="free-badge">✅ Debate is a free event — no payment needed!</div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Registration"}
          </button>

          {loading && <p className="loading-note">Please wait, do not close or refresh this page...</p>}

        </form>
      </section>

      <footer>© 2026 ECLECTICA — ECE Dept, MITS Deemed University</footer>
    </div>
  );
}
