"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SetupStatus = {
  needsSetup: boolean;
  bootstrapEnabled: boolean;
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "setup">("login");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/auth/setup-status", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return { needsSetup: false, bootstrapEnabled: false };
        return (await res.json()) as SetupStatus;
      })
      .then((data) => {
        if (cancelled) return;
        setStatus(data);
        if (data.needsSetup) setMode("setup");
      })
      .catch(() => {
        if (!cancelled) setStatus({ needsSetup: false, bootstrapEnabled: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showSetup =
    mode === "setup" && (status?.needsSetup || status?.bootstrapEnabled);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error || (res.status === 401 ? "Invalid credentials" : "Login failed"));
        return;
      }
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetup(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(status?.bootstrapEnabled && !status.needsSetup
            ? { bootstrapSecret }
            : {}),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save credentials.");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function requestReset() {
    setResetMessage("");
    setError("");
    if (!email.trim()) {
      setResetMessage("Enter your email first.");
      return;
    }
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
      <form
        className="news-detail-card"
        onSubmit={showSetup ? handleSetup : handleLogin}
        style={{ maxWidth: 420 }}
      >
        <h1 style={{ marginBottom: 12 }}>
          {showSetup
            ? status?.needsSetup
              ? "Create admin account"
              : "Set admin email & password"
            : "Admin Login"}
        </h1>
        {showSetup ? (
          <p style={{ marginBottom: 12, color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            {status?.needsSetup
              ? "Set your Gmail and password to manage the site."
              : "Enter your Gmail, new password, and the bootstrap secret from server env."}
          </p>
        ) : null}

        <div className="form-group">
          <label htmlFor="adminEmail">Email (Gmail)</label>
          <input
            id="adminEmail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminPassword">Password</label>
          <input
            id="adminPassword"
            type="password"
            autoComplete={showSetup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={showSetup ? 6 : 4}
          />
        </div>

        {showSetup ? (
          <>
            <div className="form-group">
              <label htmlFor="adminPasswordConfirm">Confirm password</label>
              <input
                id="adminPasswordConfirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {status?.bootstrapEnabled && !status.needsSetup ? (
              <div className="form-group">
                <label htmlFor="adminBootstrap">Bootstrap secret</label>
                <input
                  id="adminBootstrap"
                  type="password"
                  autoComplete="off"
                  value={bootstrapSecret}
                  onChange={(e) => setBootstrapSecret(e.target.value)}
                  required
                />
              </div>
            ) : null}
          </>
        ) : null}

        {error ? <p style={{ color: "#ff7b7b", marginBottom: 10 }}>{error}</p> : null}

        <button type="submit" className="btn-calc" disabled={busy}>
          {busy
            ? "Please wait…"
            : showSetup
              ? status?.needsSetup
                ? "Create & login"
                : "Save & login"
              : "Login"}
        </button>

        {!showSetup ? (
          <>
            <button
              type="button"
              className="btn-reset"
              onClick={requestReset}
              style={{ marginTop: 8 }}
              disabled={busy}
            >
              Request Password Reset
            </button>
            {status?.bootstrapEnabled ? (
              <button
                type="button"
                className="btn-reset"
                onClick={() => {
                  setMode("setup");
                  setError("");
                  setResetMessage("");
                }}
                style={{ marginTop: 8 }}
                disabled={busy}
              >
                Set email &amp; password
              </button>
            ) : null}
          </>
        ) : status && !status.needsSetup ? (
          <button
            type="button"
            className="btn-reset"
            onClick={() => {
              setMode("login");
              setError("");
              setBootstrapSecret("");
              setConfirmPassword("");
            }}
            style={{ marginTop: 8 }}
            disabled={busy}
          >
            Back to login
          </button>
        ) : null}

        {resetMessage ? <p style={{ marginTop: 8 }}>{resetMessage}</p> : null}
      </form>
    </main>
  );
}
