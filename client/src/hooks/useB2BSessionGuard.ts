import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

/** Verifies the server-side B2B session once when the protected page is entered. */
export function useB2BSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if ((location.state as { b2bMock?: boolean } | null)?.b2bMock || window.sessionStorage.getItem("tba-b2b-preview-access") === "true") return;
    let active = true;
    void apiRequest("/b2b/status").catch(() => { if (active) navigate("/b2b/access", { replace: true }); });
    return () => { active = false; };
  }, [location.state, navigate]);
}