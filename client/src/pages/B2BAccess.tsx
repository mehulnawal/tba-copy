import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { retryMsg91Otp, sendMsg91Otp, verifyMsg91Otp } from "../utils/msg91Otp";

type Step = "password" | "mobile" | "otp";
const OTP_LENGTH = 6;
const RESEND_DELAY_SECONDS = 20;

export default function B2BAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(() => Array(OTP_LENGTH).fill(""));
  const [otpRequestId, setOtpRequestId] = useState<string>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const continueWithPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!password.trim()) { setError("Enter your B2B access password."); return; }
    setError(""); setNotice(""); setIsCheckingPassword(true);
    try {
      await apiRequest("/b2b/validate-password", { method: "POST", body: JSON.stringify({ password }) });
      setNotice("Password verified. Enter your Indian mobile number to continue.");
      setStep("mobile");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Incorrect B2B access password. Please try again.");
    } finally { setIsCheckingPassword(false); }
  };

  const sendOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { setError("Enter a valid 10-digit Indian mobile number."); return; }
    setError(""); setNotice(""); setIsSendingOtp(true);
    try {
      setOtpRequestId(await sendMsg91Otp(`91${mobile}`));
      setOtp(Array(OTP_LENGTH).fill(""));
      setResendSeconds(RESEND_DELAY_SECONDS);
      setNotice("OTP sent to your mobile number.");
      setStep("otp");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send OTP. Please try again."); }
    finally { setIsSendingOtp(false); }
  };

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[index] = digit; setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError("Enter the complete OTP."); return; }
    setError(""); setIsVerifyingOtp(true);
    try {
      const accessToken = await verifyMsg91Otp(otp.join(""), otpRequestId);
      await apiRequest("/b2b/access", { method: "POST", body: JSON.stringify({ password, mobile, accessToken }) });
      navigate("/b2b/catalog", { replace: true });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to verify B2B access."); }
    finally { setIsVerifyingOtp(false); }
  };

  const resendOtp = async () => {
    setOtp(Array(OTP_LENGTH).fill("")); setError(""); setNotice(""); setIsSendingOtp(true);
    try { setOtpRequestId(await retryMsg91Otp(otpRequestId)); setResendSeconds(RESEND_DELAY_SECONDS); setNotice("A new OTP has been sent."); otpRefs.current[0]?.focus(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to resend OTP. Please try again."); }
    finally { setIsSendingOtp(false); }
  };

  const heading = step === "password" ? "B2B Catalogue" : step === "mobile" ? "Verify your mobile" : "Enter OTP";
  const description = step === "password" ? "Enter the password shared by your account manager." : step === "mobile" ? "Use your Indian mobile number to continue to the private trade catalogue." : "Enter the six-digit OTP sent to your mobile number.";

  return <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-5 py-10"><section className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 sm:p-8 shadow-[var(--shadow-lg)]"><div className="mb-7 space-y-2"><p className="section-label">Trade Access</p><h1 className="font-primary text-3xl text-[var(--color-teal)]">{heading}</h1><p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p></div>{error && <p role="alert" className="mb-5 rounded-[var(--radius-sm)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">{error}</p>}{notice && <p className="mb-5 rounded-[var(--radius-sm)] border border-[var(--color-teal)]/20 bg-[var(--color-cream)] p-3 text-sm text-[var(--color-teal)]">{notice}</p>}{step === "password" && <form onSubmit={(event) => void continueWithPassword(event)} className="space-y-5"><label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input mt-2" autoComplete="current-password" /></label><button className="admin-button w-full" disabled={isCheckingPassword}>{isCheckingPassword ? "Checking password..." : "Continue"}</button></form>}{step === "mobile" && <form onSubmit={(event) => void sendOtp(event)} className="space-y-5"><label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Mobile Number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))} className="admin-input mt-2" autoComplete="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="98765 43210" /></label><button className="admin-button w-full" disabled={isSendingOtp}>{isSendingOtp ? "Sending OTP..." : "Send OTP"}</button></form>}{step === "otp" && <form onSubmit={(event) => void verifyOtp(event)} className="space-y-5"><div><span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">OTP</span><div className="mt-2 grid w-full grid-cols-6 gap-1.5 sm:gap-2">{otp.map((digit, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} value={digit} onChange={(event) => updateOtp(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-center text-lg font-semibold text-[var(--color-teal)] outline-none focus:border-[var(--color-teal)]" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`OTP digit ${index + 1}`} />)}</div></div><button className="admin-button w-full" disabled={isVerifyingOtp}>{isVerifyingOtp ? "Verifying..." : "Verify OTP"}</button><button type="button" onClick={() => void resendOtp()} disabled={isSendingOtp || resendSeconds > 0} className="w-full text-sm font-semibold text-[var(--color-teal)] underline underline-offset-4 disabled:opacity-60">{isSendingOtp ? "Sending..." : resendSeconds > 0 ? `Resend OTP in 0:${String(resendSeconds).padStart(2, "0")}` : "Resend OTP"}</button></form>}</section></main>;
}