import { useEffect, useState } from "react";
import { BadgeIndianRupee, Hash, UserRound } from "lucide-react";
import { apiRequest } from "../api/client";
import { useB2BSessionGuard } from "../hooks/useB2BSessionGuard";
import ProductPage from "./ProductPage";

type PartnerDetails = {
  firstName: string;
  lastName: string;
  referenceId: string;
  points: string;
};

export default function B2BCatalog() {
  useB2BSessionGuard();
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  const [partner, setPartner] = useState<PartnerDetails | null>(null);

  useEffect(() => {
    let active = true;
    const loadPartner = () =>
      apiRequest<PartnerDetails | null>("/b2b/partner")
        .then((details) => {
          if (active) setPartner(details);
        })
        .catch(() => {
          if (active) setPartner(null);
        });

    void loadPartner();
    const refreshTimer = window.setInterval(() => void loadPartner(), 30_000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <>
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setMetal("gold")}
              className={`rounded px-4 py-2 text-sm font-semibold ${metal === "gold" ? "bg-[var(--color-teal)] text-white" : "border border-[var(--color-border)]"}`}
            >
              Gold
            </button>
            <button
              onClick={() => setMetal("silver")}
              className={`rounded px-4 py-2 text-sm font-semibold ${metal === "silver" ? "bg-[var(--color-teal)] text-white" : "border border-[var(--color-border)]"}`}
            >
              Silver
            </button>
          </div>
          {partner && (
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs text-[var(--color-teal)]">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  <span className="text-[var(--color-text-muted)]">
                    Partner:
                  </span>{" "}
                  <b>
                    {partner.firstName} {partner.lastName}
                  </b>
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  <span className="text-[var(--color-text-muted)]">
                    Reference ID:
                  </span>{" "}
                  <b>{partner.referenceId}</b>
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeIndianRupee className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  <span className="text-[var(--color-text-muted)]">
                    Points:
                  </span>{" "}
                  <b>{partner.points}</b>
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
      <ProductPage key={metal} metal={metal} b2b />
    </>
  );
}
