import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

/** Checks the server-side B2B session every two seconds so admin revocation removes access without a reload. */
export function useB2BSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if ((location.state as { b2bMock?: boolean } | null)?.b2bMock) return;
    let active = true;
    const verify = async () => {
      try { await apiRequest("/b2b/status"); }
      catch { if (active) navigate("/b2b/access", { replace: true }); }
    };
    void verify();
    const interval = window.setInterval(() => void verify(), 2000);
    return () => { active = false; window.clearInterval(interval); };
  }, [location.state, navigate]);
}