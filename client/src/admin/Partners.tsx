import { FormEvent, useEffect, useState } from "react";
import { adminApi, Partner } from "../api/admin.api";
import { ApiRequestError } from "../api/client";

const blank = {
  firstName: "",
  lastName: "",
  mobile: "",
  dateOfBirth: "",
  city: "",
  address: "",
};
const message = (error: unknown) =>
  error instanceof ApiRequestError ? error.message : "Unable to save partner.";

export default function Partners() {
  const [items, setItems] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(blank);
  const [redeemingPartner, setRedeemingPartner] = useState<Partner | null>(
    null,
  );
  const [redeemPoints, setRedeemPoints] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    adminApi
      .partners()
      .then(setItems)
      .catch((reason) => setError(message(reason)));
  useEffect(() => {
    load();
  }, []);
  const edit = (partner: Partner) => {
    setEditing(partner);
    setForm({
      firstName: partner.firstName,
      lastName: partner.lastName,
      mobile: partner.mobile,
      dateOfBirth: partner.dateOfBirth.slice(0, 10),
      city: partner.city,
      address: partner.address || "",
    });
    setNotice("");
    setError("");
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^\d{10}$/.test(form.mobile))
      return setError("Mobile number must contain exactly 10 digits.");
    try {
      if (editing) await adminApi.updatePartner(editing._id, form);
      else await adminApi.createPartner(form);
      setNotice(
        editing
          ? "Partner updated."
          : "Partner created. The Reference ID is permanently locked.",
      );
      setEditing(null);
      setForm(blank);
      load();
    } catch (reason) {
      setError(message(reason));
    }
  };
  const beginRedemption = (partner: Partner) => {
    setRedeemingPartner(partner);
    setRedeemPoints("");
    setNotice("");
    setError("");
  };
  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    if (!redeemingPartner) return;
    const points = Number(redeemPoints);
    if (!Number.isFinite(points) || points <= 0)
      return setError("Enter points greater than zero.");
    try {
      setIsRedeeming(true);
      const partner = await adminApi.redeemPartnerPoints(
        redeemingPartner._id,
        points,
      );
      setItems((current) =>
        current.map((item) => (item._id === partner._id ? partner : item)),
      );
      setRedeemingPartner(null);
      setRedeemPoints("");
      setNotice(
        `${points} points redeemed. Current Points is now ${partner.points}.`,
      );
    } catch (reason) {
      setError(message(reason));
    } finally {
      setIsRedeeming(false);
    }
  };
  const remove = async (partner: Partner) => {
    if (
      !confirm(
        `Delete ${partner.referenceId}? This cannot restore the Reference ID.`,
      )
    )
      return;
    try {
      await adminApi.deletePartner(partner._id);
      load();
    } catch (reason) {
      setError(message(reason));
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <span className="section-label">Partner Program</span>
        <h1 className="mt-1 font-primary text-3xl text-[var(--color-teal)]">
          Partner Program
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Create and manage partner profiles and current points.
        </p>
      </div>
      {notice && (
        <p className="rounded border border-[var(--color-teal)]/30 bg-[var(--color-cream)] p-3 text-sm text-[var(--color-teal)]">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded border border-[var(--color-error)]/30 p-3 text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
      <form onSubmit={save} className="admin-form">
        <b>{editing ? "Edit Partner" : "Create Partner"}</b>
        {!editing && (
          <p className="col-span-full rounded border border-[var(--color-border)] bg-[var(--color-cream-light)] p-3 text-xs">
            Once this partner is created, the Reference ID will be permanently
            locked and cannot be changed. Please verify the details before
            continuing.
          </p>
        )}
        <label>
          Reference ID
          <input
            value={
              editing
                ? editing.referenceId
                : "Generated automatically after creation"
            }
            readOnly
            className="admin-input bg-[var(--color-cream-light)]"
          />
        </label>
        <label>
          First Name
          <input
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="admin-input"
          />
        </label>
        <label>
          Last Name
          <input
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="admin-input"
          />
        </label>
        <label>
          Mobile Number
          <input
            required
            inputMode="numeric"
            maxLength={10}
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            className="admin-input"
          />
        </label>
        <label>
          Date of Birth
          <input
            required
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            className="admin-input"
          />
        </label>
        <label>
          City
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="admin-input"
          />
        </label>
        <label>
          Address (Optional)
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="admin-input"
          />
        </label>
        <div className="col-span-full flex gap-3">
          <button className="admin-button">
            {editing ? "Update Partner" : "Create Partner"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(blank);
              }}
              className="cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((partner) => (
          <article
            key={partner._id}
            className="admin-row flex-col items-start gap-3"
          >
            <div>
              <b className="font-mono text-[var(--color-teal)]">
                {partner.referenceId}
              </b>
              <p className="font-semibold">
                {partner.firstName} {partner.lastName}
              </p>
              <small>
                {partner.mobile} - {partner.city}
              </small>
              <p className="mt-2 text-sm">
                Current Points: <b>{partner.points}</b>
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => edit(partner)} className="cursor-pointer">
                Edit
              </button>
              <button
                onClick={() => beginRedemption(partner)}
                className="cursor-pointer"
              >
                Redeem Points
              </button>
              <button
                onClick={() => void remove(partner)}
                className="cursor-pointer text-red-700"
              >
                Delete
              </button>
            </div>
            {redeemingPartner?._id === partner._id && (
              <form
                onSubmit={redeem}
                className="w-full border-t border-[var(--color-border)] pt-3"
              >
                <label className="block text-xs font-semibold text-[var(--color-text)]">
                  Redeem Points
                  <input
                    required
                    autoFocus
                    type="number"
                    min="0.01"
                    max={Number(partner.points)}
                    step="0.01"
                    value={redeemPoints}
                    onChange={(event) => setRedeemPoints(event.target.value)}
                    className="admin-input mt-1"
                    placeholder={`Maximum ${partner.points}`}
                  />
                </label>
                <div className="mt-3 flex gap-3">
                  <button
                    disabled={isRedeeming}
                    className="admin-button disabled:opacity-50"
                  >
                    {isRedeeming ? "Redeeming..." : "Confirm Redemption"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRedeemingPartner(null);
                      setRedeemPoints("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
