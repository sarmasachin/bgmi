"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SetupStatus = {
  needsSetup: boolean;
  bootstrapEnabled: boolean;
};

type LoginAlert = {
  type: "error" | "warning" | "success";
  message: string;
  createdAt: number;
};

const ALERT_MS = 4200;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [alert, setAlert] = useState<LoginAlert | null>(null);
  const [leftMs, setLeftMs] = useState(0);
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

  useEffect(() => {
    if (!alert) {
      setLeftMs(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, ALERT_MS - (Date.now() - alert.createdAt));
      setLeftMs(left);
      if (left <= 0) setAlert(null);
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [alert]);

  const showSetup =
    mode === "setup" && (status?.needsSetup || status?.bootstrapEnabled);

  function showAlert(type: LoginAlert["type"], message: string) {
    setAlert({ type, message, createdAt: Date.now() });
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAlert(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        showAlert(
          "error",
          data.error || (res.status === 401 ? "Invalid credentials" : "Login failed")
        );
        return;
      }
      router.push("/admin");
    } catch {
      showAlert("error", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetup(event: FormEvent) {
    event.preventDefault();
    setAlert(null);
    if (password.length < 6) {
      showAlert("warning", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("warning", "Passwords do not match.");
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
        showAlert("error", data.error ?? "Could not save credentials.");
        return;
      }
      router.push("/admin");
    } catch {
      showAlert("error", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const timerSeconds = alert ? Math.max(1, Math.ceil(leftMs / 1000)) : 0;
  const progressPct = alert ? Math.max(0, (leftMs / ALERT_MS) * 100) : 0;

  return (
    <main className="admin-login-page">
      <form
        className="admin-login-card"
        onSubmit={showSetup ? handleSetup : handleLogin}
      >
        <h1 className="admin-login-title">
          {showSetup
            ? status?.needsSetup
              ? "Create admin account"
              : "Set admin email & password"
            : "Admin Login"}
        </h1>
        {showSetup ? (
          <p className="admin-login-hint">
            {status?.needsSetup
              ? "Set your Gmail and password to manage the site."
              : "Enter your Gmail, new password, and the bootstrap secret from server env."}
          </p>
        ) : null}

        {alert ? (
          <div
            className={`admin-login-alert admin-login-alert-${alert.type}`}
            role={alert.type === "error" ? "alert" : "status"}
          >
            <div className="admin-login-alert-row">
              <p className="admin-login-alert-message">{alert.message}</p>
              <span className="admin-login-alert-timer">{timerSeconds}s</span>
            </div>
            <span
              className="admin-login-alert-progress"
              style={{ width: `${progressPct}%` }}
              aria-hidden
            />
          </div>
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

        <button type="submit" className="admin-login-submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : showSetup
              ? status?.needsSetup
                ? "Create & login"
                : "Save & login"
              : "Login"}
        </button>

        {!showSetup && status?.bootstrapEnabled ? (
          <button
            type="button"
            className="admin-login-secondary"
            onClick={() => {
              setMode("setup");
              setAlert(null);
            }}
            disabled={busy}
          >
            Set email &amp; password
          </button>
        ) : null}

        {showSetup && status && !status.needsSetup ? (
          <button
            type="button"
            className="admin-login-secondary"
            onClick={() => {
              setMode("login");
              setBootstrapSecret("");
              setConfirmPassword("");
              setAlert(null);
            }}
            disabled={busy}
          >
            Back to login
          </button>
        ) : null}
      </form>
    </main>
  );
}
