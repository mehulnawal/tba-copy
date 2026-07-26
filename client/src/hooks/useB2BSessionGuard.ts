import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

/** Checks the server-side B2B session every two seconds so admin revocation removes access without a reload. */
export function useB2BSessionGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const verify = async () => {
      try { await apiRequest("/b2b/status"); }
      catch { if (active) navigate("/b2b/access", { replace: true }); }
    };
    void verify();
    const interval = window.setInterval(() => void verify(), 2000);
    return () => { active = false; window.clearInterval(interval); };
  }, [navigate]);
}