"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }
    router.push("/admin");
  }

  async function requestReset() {
    setResetMessage("");
    const res = await fetch("/api/admin/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResetMessage("Reset request failed.");
      return;
    }
    setResetMessage(
      data.token
        ? `Reset token (dev): ${data.token}`
        : "If account exists, reset link was sent.",
    );
  }

  return (
    <main className="page-container" style={{ minHeight: "80vh", justifyContent: "center" }}>
      <form className="news-detail-card" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <h1 style={{ marginBottom: 12 }}>Admin Login</h1>
        <div className="form-group">
          <label htmlFor="adminEmail">Email</label>
          <input
            id="adminEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminPassword">Password</label>
          <input
            id="adminPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error ? <p style={{ color: "#ff7b7b", marginBottom: 10 }}>{error}</p> : null}
        <button type="submit" className="btn-calc">
          Login
        </button>
        <button type="button" className="btn-reset" onClick={requestReset} style={{ marginTop: 8 }}>
          Request Password Reset
        </button>
        {resetMessage ? <p style={{ marginTop: 8 }}>{resetMessage}</p> : null}
      </form>
    </main>
  );
}
