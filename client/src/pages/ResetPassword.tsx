import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../api/client";

export default function ResetPassword() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const { setUser } = useAuth();
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (e: FormEvent) => { e.preventDefault(); const token = params.get("token"); if (!token) return setError("The reset link is missing its token."); if (password !== confirmPassword) return setError("Passwords do not match."); setSaving(true); setError(""); try { setUser(await authApi.resetPassword(token, password)); navigate("/"); } catch (err) { setError(err instanceof ApiRequestError ? err.message : "Unable to reset password."); } finally { setSaving(false); } };
  return <main className="min-h-screen grid place-items-center bg-[var(--color-bg)] p-4"><form onSubmit={submit} className="w-full max-w-md p-8 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-4"><p className="section-label">TBA</p><h1 className="font-primary text-3xl text-[var(--color-teal)]">Choose a new password</h1>{error&&<p className="text-sm text-red-700">{error}</p>}<input required minLength={8} className="admin-input" type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)}/><input required minLength={8} className="admin-input" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/><button className="admin-button w-full" disabled={saving}>{saving?"Saving…":"Reset password"}</button></form></main>;
}
