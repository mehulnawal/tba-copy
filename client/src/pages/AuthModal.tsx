import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react"; // Imported Eye and EyeOff icons
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../api/auth.api";
import { ApiRequestError } from "../api/client";

interface LuxuryAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register" | "forgot";

export function AuthModal({ isOpen, onClose }: LuxuryAuthModalProps) {
  const navigate = useNavigate();
  const { login, register, setUser } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Visibility state for password

  // Reset password visibility when switching between login, register, or forgot
  useEffect(() => {
    setShowPassword(false);
  }, [authMode]);

  useEffect(() => {
    const loadScript = (id: string, src: string) => {
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    };
    
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) loadScript("google-identity-services", "https://accounts.google.com/gsi/client");
    if (import.meta.env.VITE_FACEBOOK_APP_ID) loadScript("facebook-jssdk", "https://connect.facebook.net/en_US/sdk.js");
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authMode === "forgot") {
        await authApi.forgotPassword(email);
        showToast("If an account exists, a secure reset link has been sent", "success");
        setAuthMode("login");
        return;
      }

      if (authMode === "login") {
        await login(email, password);
        showToast("Welcome back", "success");
      } else {
        await register(name, email, password);
        showToast("Account created successfully", "success");
      }

      onClose();
      navigate("/");
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Authentication failed. Please try again.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      showToast("Google login is not configured yet", "info");
      return;
    }
    if (!window.google?.accounts?.id) {
      showToast("Google sign-in is still loading. Please try again.", "info");
      return;
    }
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        if (!credential) return showToast("Google did not return an ID token.", "error");
        setIsSubmitting(true);
        try {
          setUser(await authApi.googleLogin(credential));
          showToast("Signed in with Google", "success");
          onClose();
          navigate("/");
        } catch (error) {
          showToast(error instanceof ApiRequestError ? error.message : "Google sign-in failed. Please try again.", "error");
        } finally { setIsSubmitting(false); }
      },
    });
    window.google.accounts.id.prompt();
  };

  const handleFacebookAuth = () => {
    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      showToast("Facebook login is not configured yet", "info");
      return;
    }
    if (!window.FB) {
      showToast("Facebook sign-in is still loading. Please try again.", "info");
      return;
    }
    window.FB.init({ appId: import.meta.env.VITE_FACEBOOK_APP_ID, cookie: true, xfbml: false, version: "v22.0" });
    window.FB.login(async (response) => {
      const accessToken = response.authResponse?.accessToken;
      if (!accessToken) return showToast("Facebook sign-in was cancelled or unavailable.", "error");
      setIsSubmitting(true);
      try {
        setUser(await authApi.facebookLogin(accessToken));
        showToast("Signed in with Facebook", "success");
        onClose();
        navigate("/");
      } catch (error) {
        showToast(error instanceof ApiRequestError ? error.message : "Facebook sign-in failed. Please try again.", "error");
      } finally { setIsSubmitting(false); }
    }, { scope: "public_profile,email" });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md overflow-hidden bg-[var(--color-bg)] border border-[var(--color-border)] p-8 shadow-2xl z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="font-secondary text-[11px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase block mb-1">
            TBA
          </span>
          <h2 className="text-2xl font-primary tracking-wide text-[var(--color-text)] font-light">
            {authMode === "login"
              ? "Welcome Back"
              : authMode === "register"
                ? "Create Account"
                : "Reset Password"}
          </h2>
          <p className="font-secondary text-xs text-[var(--color-text-muted)] mt-1.5">
            {authMode === "login"
              ? "Please sign in to secure your selected masterpieces."
              : authMode === "register"
                ? "Join the registry to manage your luxury collection."
                : "Enter your email to receive a secure reset link."}
          </p>
        </div>

        {authMode !== "forgot" && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex items-center justify-center gap-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] py-2.5 px-4 font-secondary text-xs text-[var(--color-text)] hover:bg-[var(--color-cream-light)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.98 1 12 1 7.35 1 3.42 3.67 1.5 7.57l3.73 2.89c.88-2.64 3.38-4.42 6.77-4.42z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.5z" />
                <path fill="#FBBC05" d="M5.23 10.46a7.03 7.03 0 0 1 0 3.08L1.5 16.43a11.96 11.96 0 0 1 0-8.86l3.73 2.89z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.39 0-5.89-1.78-6.77-4.42L1.5 16.79A11.96 11.96 0 0 0 12 23z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookAuth}
              className="flex items-center justify-center gap-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] py-2.5 px-4 font-secondary text-xs text-[var(--color-text)] hover:bg-[var(--color-cream-light)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        )}

        {authMode !== "forgot" && (
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-[var(--color-border-subtle)]" />
            <span className="absolute bg-[var(--color-bg)] px-3 font-secondary text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              Or Continue With
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "register" && (
            <div className="space-y-1.5">
              <label className="font-secondary text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexander Wright"
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] py-2.5 pl-10 pr-4 font-secondary text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-secondary text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@luxury.com"
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] py-2.5 pl-10 pr-4 font-secondary text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>
          </div>

          {authMode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="font-secondary text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] py-2.5 pl-10 pr-12 font-secondary text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {authMode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="font-secondary text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary text-xs uppercase tracking-widest py-3.5 mt-4 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group hover:opacity-90 disabled:opacity-60"
          >
            <span>
              {isSubmitting
                ? "Please wait..."
                : authMode === "login"
                  ? "Sign In"
                  : authMode === "register"
                    ? "Register Now"
                    : "Send Reset Link"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] text-center">
          <p className="font-secondary text-xs text-[var(--color-text-muted)]">
            {authMode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-[var(--color-text)] hover:underline font-medium ml-1 cursor-pointer focus:outline-none"
                >
                  Create one
                </button>
              </>
            ) : authMode === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-[var(--color-text)] hover:underline font-medium ml-1 cursor-pointer focus:outline-none"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-[var(--color-text)] hover:underline font-medium ml-1 cursor-pointer focus:outline-none"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}