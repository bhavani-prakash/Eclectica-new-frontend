import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API } from "../config/api.js";

export default function Admin() {
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass,  setLoginPass]  = useState("");
  const [loginErr,   setLoginErr]   = useState("");

  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [filterEvent, setFilterEvent] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    try {
      const { data: res } = await axios.post(`${API}/admin/login`, { email: loginEmail, password: loginPass });
      if (res.success) {
        setLoggedIn(true);
        fetchData();
      } else {
        setLoginErr("Invalid credentials.");
      }
    } catch {
      setLoginErr("Invalid credentials.");
    }
  };

  // ── Fetch registrations ───────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`${API}/admin/dashboard`);
      if (res.success) setData(res.data);
    } catch {
      alert("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify payment ────────────────────────────────────────────────────────
  const verifyPayment = async (id) => {
    try {
      const { data: res } = await axios.put(`${API}/admin/verify/${id}`);
      if (res.success) {
        setData(prev => prev.map(r => r._id === id ? { ...r, paymentStatus: "verified" } : r));
      }
    } catch {
      alert("Failed to verify. Please try again.");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = data.length;
    const pending  = data.filter(r => r.paymentStatus === "pending").length;
    const verified = data.filter(r => r.paymentStatus === "verified").length;
    const free     = data.filter(r => r.paymentStatus === "free").length;
    return { total, pending, verified, free };
  }, [data]);

  const allEvents = useMemo(() => ["All", ...new Set(data.map(r => r.event))], [data]);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(r => {
      const matchEvent  = filterEvent  === "All" || r.event         === filterEvent;
      const matchStatus = filterStatus === "All" || r.paymentStatus === filterStatus;
      const matchSearch = !q || r.name.toLowerCase().includes(q) ||
        r.rollnumber.toLowerCase().includes(q) || r.college.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);
      return matchEvent && matchStatus && matchSearch;
    });
  }, [data, search, filterEvent, filterStatus]);

  const fmt = d => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="admin-card">
          <h2>🔐 Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email" placeholder="Admin email" required
              value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
            />
            <input
              type="password" placeholder="Password" required
              value={loginPass} onChange={e => setLoginPass(e.target.value)}
            />
            <button type="submit" className="btn-login">Login</button>
            {loginErr && <p className="error-msg">{loginErr}</p>}
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        <h2>📋 Registrations Dashboard</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-verify" onClick={fetchData} style={{ padding: "7px 16px" }}>↻ Refresh</button>
          <button className="btn-verify" onClick={() => setLoggedIn(false)} style={{ padding: "7px 16px", color: "#f87171", borderColor: "rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.1)" }}>Logout</button>
        </div>
      </div>
      <p className="dashboard-meta">ECLECTICA 2K26 — ECE Dept, MITS</p>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box"><div className="num">{stats.total}</div><div className="lbl">Total</div></div>
        <div className="stat-box"><div className="num">{stats.pending}</div><div className="lbl">Pending</div></div>
        <div className="stat-box"><div className="num">{stats.verified}</div><div className="lbl">Verified</div></div>
        <div className="stat-box"><div className="num">{stats.free}</div><div className="lbl">Free (Debate)</div></div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          placeholder="Search name, roll no, college…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
          {allEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="free">Free</option>
        </select>
        <span style={{ color: "#888", fontSize: "0.85rem" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {loading ? (
        <p className="no-data">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="no-data">No registrations found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>College</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Event</th>
                <th>Contact</th>
                <th>Email</th>
                <th>UTR</th>
                <th>Screenshot</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.rollnumber}</td>
                  <td style={{ maxWidth: 160, wordBreak: "break-word" }}>{r.college}</td>
                  <td>{r.department}</td>
                  <td>{r.year}</td>
                  <td><strong>{r.event}</strong></td>
                  <td>{r.contactnumber}</td>
                  <td style={{ fontSize: "0.8rem" }}>{r.email}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.utrNumber || "—"}</td>
                  <td>
                    {r.imageUrl
                      ? <a href={r.imageUrl} target="_blank" rel="noreferrer" className="screenshot-link">View 🔗</a>
                      : "—"}
                  </td>
                  <td>
                    <span className={`badge ${r.paymentStatus}`}>{r.paymentStatus}</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{fmt(r.createdAt)}</td>
                  <td>
                    {r.paymentStatus === "pending" ? (
                      <button className="btn-verify" onClick={() => verifyPayment(r._id)}>
                        ✓ Verify
                      </button>
                    ) : (
                      <span style={{ color: "#555", fontSize: "0.8rem" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
