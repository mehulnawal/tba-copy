import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

type Step = "password" | "mobile" | "otp";
const OTP_LENGTH = 6;

export default function B2BAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const continueWithPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!password.trim()) { setError("Password is required."); return; }
    try {
      await apiRequest("/b2b/access", { method: "POST", body: JSON.stringify({ password }) });
      window.sessionStorage.removeItem("tba-b2b-preview-access");
      navigate("/b2b/catalog", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to verify B2B access.");
    }
  };

  const sendOtp = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { setError("Enter a valid 10-digit mobile number."); return; }
    setError("");
    setNotice("OTP sent to your mobile number.");
    setOtp(Array(OTP_LENGTH).fill(""));
    setStep("otp");
  };

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const verifyOtp = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError("Enter the complete OTP."); return; }
    setError("");
    const storedLogs = JSON.parse(window.localStorage.getItem("tba-b2b-mock-access-log") || "[]") as Array<{ id: string; mobile: string; accessedAt: string; status: "Verified" }>;
    window.localStorage.setItem("tba-b2b-mock-access-log", JSON.stringify([{ id: `b2b-log-${Date.now()}`, mobile, accessedAt: new Date().toISOString(), status: "Verified" }, ...storedLogs]));
    window.sessionStorage.setItem("tba-b2b-preview-access", "true");
    navigate("/b2b/catalog", { replace: true, state: { b2bMock: true } });
  };

  const resendOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setNotice("A new OTP has been sent.");
    otpRefs.current[0]?.focus();
  };

  const heading = step === "password" ? "B2B Catalogue" : step === "mobile" ? "Verify your mobile" : "Enter OTP";
  const description = step === "password" ? "Enter the password shared by your account manager." : step === "mobile" ? "Use your mobile number to continue to the private trade catalogue." : "Enter the six-digit OTP sent to your mobile number.";

  return <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-5 py-10"><section className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 sm:p-8 shadow-[var(--shadow-lg)]"><div className="mb-7 space-y-2"><p className="section-label">Trade Access</p><h1 className="font-primary text-3xl text-[var(--color-teal)]">{heading}</h1><p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p></div>{error && <p role="alert" className="mb-5 rounded-[var(--radius-sm)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">{error}</p>}{notice && <p className="mb-5 rounded-[var(--radius-sm)] border border-[var(--color-teal)]/20 bg-[var(--color-cream)] p-3 text-sm text-[var(--color-teal)]">{notice}</p>}{step === "password" && <form onSubmit={(event) => void continueWithPassword(event)} className="space-y-5"><label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input mt-2" autoComplete="current-password" /></label><button className="admin-button w-full">Continue</button></form>}{step === "mobile" && <form onSubmit={sendOtp} className="space-y-5"><label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Mobile Number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))} className="admin-input mt-2" autoComplete="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="Enter 10-digit mobile number" /></label><button className="admin-button w-full">Send OTP</button></form>}{step === "otp" && <form onSubmit={verifyOtp} className="space-y-5"><div><span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">OTP</span><div className="mt-2 grid w-full grid-cols-6 gap-1.5 sm:gap-2">{otp.map((digit, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} value={digit} onChange={(event) => updateOtp(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-center text-lg font-semibold text-[var(--color-teal)] outline-none focus:border-[var(--color-teal)]" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`OTP digit ${index + 1}`} />)}</div></div><button className="admin-button w-full">Verify OTP</button><button type="button" onClick={resendOtp} className="w-full text-sm font-semibold text-[var(--color-teal)] underline underline-offset-4">Resend OTP</button></form>}</section></main>;
}
