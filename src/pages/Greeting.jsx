import React from "react";

export default function Greeting() {
  return (
    <div className="greeting-page">
      <h2>🎉 Registration Successful!</h2>
      <p>
        Thank you for registering for <strong>ECLECTICA 2K26</strong>.<br /><br />
        A confirmation email has been sent to your inbox.<br />
        <strong>Note:</strong> Check your spam / junk folder if you don't see it.
      </p>
      <a href="https://eclectica2k26.netlify.app/" className="btn-home">← Back to Home</a>
       <a href="/permission-letter" style={{ marginTop: 14, display: "inline-block", color: "#d4af37", fontSize: "0.9rem", textDecoration: "underline" }}>
        📄 Download Permission Letter
      </a>
    </div>
  );
}
