import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../api/client";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("This password-reset link is incomplete. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      setUser(await authApi.resetPassword(token, password));
      setSuccess("Your password has been reset. You are now signed in and will be redirected shortly.");
      window.setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to reset password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8">
        <p className="section-label">TBA</p>
        <h1 className="font-primary text-3xl text-[var(--color-teal)]">Choose a new password</h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">Use a new password with at least 8 characters. This reset link is valid for 15 minutes.</p>
        {!token && <p role="alert" className="text-sm text-red-700">This password-reset link is incomplete. Please request a new one.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}
        <input required minLength={8} disabled={!token || saving || Boolean(success)} className="admin-input" type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <input required minLength={8} disabled={!token || saving || Boolean(success)} className="admin-input" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        <button className="admin-button w-full" disabled={!token || saving || Boolean(success)}>{saving ? "Saving..." : "Reset password"}</button>
      </form>
    </main>
  );
}
