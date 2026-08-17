import React, { FormEvent, useEffect, useState, useMemo, useCallback } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { adminApi, type AdminUser, type BannerPayload, type Coupon, type ManagedUser, type B2BAccessStatus, type PricingConfig } from "../api/admin.api";
import type { Banner } from "../api/banner.api";
import type { Announcement } from "../api/announcement.api";
import { ApiRequestError, apiRequest } from "../api/client";
import type { Category } from "../types";
import Products from "./Products";
import DiamondCategories from "./DiamondCategories";
import Reviews from "./Reviews";
import { ClipboardList, FolderTree, Gem, Image, Lock, Megaphone, Menu, Scale, ShoppingBag, Sparkles, Star, Ticket, UsersRound, X } from "lucide-react";

// --- HELPERS ---
const errorMessage = (error: unknown) =>
  error instanceof ApiRequestError ? error.message : "An unexpected error occurred. Please try again.";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// --- UI COMPONENTS ---
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  if (!message) return null;
  const badgeClasses =
    type === "success"
      ? "bg-[var(--color-teal)] text-[var(--color-white)] border-[var(--color-teal)]"
      : type === "error"
        ? "bg-[var(--color-error)] text-[var(--color-white)] border-[var(--color-error)]"
        : "bg-[var(--color-bg-secondary)] text-[var(--color-charcoal)] border-[var(--color-border)]";

  return (
    <div className={`fixed bottom-6 right-6 z-[var(--z-float)] flex items-center gap-3 px-5 py-3.5 rounded-[var(--radius-md)] border shadow-[var(--shadow-lg)] text-sm font-secondary transition-all duration-300 ${badgeClasses}`}>
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification" className="opacity-70 hover:opacity-100 transition-opacity ml-2 font-bold cursor-pointer"><X size={16} /></button>
    </div>
  );
}

function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "success" | "warning" | "danger" | "neutral" | "gold" }) {
  const styles = {
    success: "bg-[var(--color-teal)]/10 text-[var(--color-teal)] border-[var(--color-teal)]/20",
    warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    danger: "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
    neutral: "bg-[var(--color-border)]/40 text-[var(--color-text-muted)] border-[var(--color-border)]",
    gold: "bg-[var(--color-cream)] text-[var(--color-teal-dark)] border-[var(--color-cream)]",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-[var(--radius-full)] text-xs font-semibold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)]">
      <div className="text-4xl mb-3 text-[var(--color-teal-light)]">{icon || <Sparkles aria-hidden="true" />}</div>
      <h3 className="text-lg font-primary text-[var(--color-teal)]">{title}</h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1 font-secondary">{description}</p>
    </div>
  );
}

function LoadingState({ title = "Loading content..." }: { title?: string }) {
  return (
    <div className="p-6 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] space-y-4" aria-busy="true" aria-label={title}>
      <div className="skeleton h-5 w-1/3" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-12 w-5/6" />
      <p className="text-xs font-secondary tracking-widest text-[var(--color-text-muted)] uppercase">{title}</p>
    </div>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
      <div>
        <h1 className="text-3xl font-primary tracking-tight text-[var(--color-teal)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1 font-secondary">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// --- LOGIN ---
function Login({ onLogin }: { onLogin: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const admin = await adminApi.login(email, password);
      onLogin(admin);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-[var(--color-bg)] p-6 font-secondary">
      <div className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-lg)] space-y-6">
        <div className="text-center space-y-2">
          <span className="section-label">Maison Control Panel</span>
          <h1 className="text-2xl font-primary text-[var(--color-teal)]">Portal Authentication</h1>
          <div className="teal-divider mx-auto my-2"></div>
        </div>
        {error && <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs rounded-[var(--radius-md)]">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Email address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maisonjewellery.com"
              className="admin-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="admin-input"
            />
          </div>
          <button disabled={loading} className="admin-button w-full cursor-pointer disabled:opacity-50">
            {loading ? "Authenticating Session..." : "Sign in to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}

// --- LAYOUT ---
function Layout({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/admin", label: "Overview", icon: Gem, end: true },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
    { to: "/admin/coupons", label: "Coupons", icon: Ticket },
    { to: "/admin/products", label: "Products", icon: Gem },
    { to: "/admin/diamond-categories", label: "Diamond Categories", icon: Gem },
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/users", label: "Customers", icon: UsersRound },
    { to: "/admin/banners", label: "Banners", icon: Image },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/metal-rates", label: "Metal Rates", icon: Scale },
    { to: "/admin/b2b-access", label: "B2B Access", icon: Lock },
    { to: "/admin/b2b-access-log", label: "B2B Access Log", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col md:flex-row font-secondary">
      <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <span className="font-primary font-bold text-[var(--color-teal)] tracking-wider">HAUTE JEWELRY</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[var(--color-teal)] font-bold">
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      <aside
        className={`fixed md:relative z-[var(--z-sticky)] inset-y-0 left-0 w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transform transition-transform duration-300 flex flex-col justify-between ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div>
          <div className="p-6 border-b border-[var(--color-border)] hidden md:block">
            <span className="section-label">Administration</span>
            <h2 className="text-xl font-primary text-[var(--color-teal)] mt-1">Maison Control</h2>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                end={item.end}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `admin-nav flex items-center gap-3 transition-all ${isActive ? "active" : ""}`}
              >
                <item.icon aria-hidden="true" className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-cream-light)]/40">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-[var(--color-teal)]">{admin.name}</p>
              <p className="text-[var(--color-text-muted)] capitalize">{admin.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white border border-[var(--color-error)]/30 rounded-[var(--radius-sm)] transition-colors cursor-pointer font-semibold uppercase tracking-wider"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="banners" element={<Banners />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="metal-rates" element={<MetalRates />} />
          <Route path="b2b-access" element={<B2BAccessManagement />} />
          <Route path="b2b-access-log" element={<B2BAccessLog />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="diamond-categories" element={<DiamondCategories />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, users: 0, coupons: 0 });

  useEffect(() => {
    Promise.allSettled([
      apiRequest<any>("/admin/orders?limit=25"),
      adminApi.users(),
      adminApi.coupons(),
    ]).then(([o, u, c]) => {
      setStats({
        orders: o.status === "fulfilled" ? (o.value?.orders?.length || o.value?.length || 0) : 0,
        users: u.status === "fulfilled" ? u.value.length : 0,
        coupons: c.status === "fulfilled" ? c.value.length : 0,
      });
    });
  }, []);

  const cards = [
    { label: "Active Orders", value: stats.orders, icon: ShoppingBag, desc: "Recent completed & pending purchases" },
    { label: "Total Customers", value: stats.users, icon: UsersRound, desc: "Registered platform users" },
    { label: "Active Promos", value: stats.coupons, icon: Ticket, desc: "Live discounts and campaigns" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Executive Overview" subtitle="High-level platform activity and content status" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-sm)] space-y-2">
            <div className="flex items-center justify-between text-[var(--color-text-muted)]">
              <span className="text-xs uppercase font-semibold tracking-wider">{card.label}</span>
              <card.icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="text-4xl font-primary text-[var(--color-teal)]">{card.value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COUPONS ---
function Coupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [edit, setEdit] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [minimumCartValue, setMinimumCartValue] = useState<string>("0");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [activeStatus, setActiveStatus] = useState<boolean>(true);

  const load = useCallback(() =>
    adminApi.coupons().then(setItems).catch((e) => setToast({ message: errorMessage(e), type: "error" })), []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (edit) {
      setCode(edit.code || "");
      setDiscountType(edit.discountType || "percentage");
      setDiscountValue(edit.discountValue !== undefined ? String(edit.discountValue) : "");
      setMinimumCartValue(edit.minimumCartValue !== undefined ? String(edit.minimumCartValue) : "0");
      setExpiryDate(edit.expiryDate ? new Date(edit.expiryDate).toISOString().slice(0, 16) : "");
      setUsageLimit(edit.usageLimit !== null && edit.usageLimit !== undefined ? String(edit.usageLimit) : "");
      setActiveStatus(edit.activeStatus ?? true);
    } else {
      resetForm();
    }
  }, [edit]);

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinimumCartValue("0");
    setExpiryDate("");
    setUsageLimit("");
    setActiveStatus(true);
  };

  const handleCancel = () => {
    setEdit(null);
    resetForm();
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const numDiscount = Number(discountValue);
    const numMinCart = Number(minimumCartValue);
    const parsedUsageLimit = usageLimit.trim() !== "" ? Number(usageLimit) : null;

    if (!trimmedCode) return setToast({ message: "Coupon code is required.", type: "error" });
    if (isNaN(numDiscount) || numDiscount <= 0) return setToast({ message: "Discount value must be greater than 0.", type: "error" });
    if (discountType === "percentage" && numDiscount > 100) return setToast({ message: "Percentage discount cannot exceed 100%.", type: "error" });
    if (isNaN(numMinCart) || numMinCart < 0) return setToast({ message: "Minimum cart value cannot be negative.", type: "error" });
    if (parsedUsageLimit !== null && (isNaN(parsedUsageLimit) || parsedUsageLimit < 1)) return setToast({ message: "Usage limit must be at least 1 or left blank.", type: "error" });
    if (!expiryDate) return setToast({ message: "Expiry date is required.", type: "error" });

    const expDateObj = new Date(expiryDate);
    if (isNaN(expDateObj.getTime())) return setToast({ message: "Invalid expiry date.", type: "error" });

    const payload = {
      code: trimmedCode,
      discountType,
      discountValue: numDiscount,
      minimumCartValue: numMinCart,
      expiryDate: expDateObj.toISOString(),
      usageLimit: parsedUsageLimit,
      activeStatus,
    };

    try {
      setIsSaving(true);
      if (edit) {
        await adminApi.updateCoupon(edit._id, payload);
        setToast({ message: "Coupon Updated Successfully", type: "success" });
      } else {
        await adminApi.createCoupon(payload);
        setToast({ message: "Coupon Created Successfully", type: "success" });
      }
      setEdit(null);
      resetForm();
      await load();
    } catch (err) {
      setToast({ message: errorMessage(err), type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      setDeletingId(id);
      await adminApi.deleteCoupon(id);
      setToast({ message: "Coupon Deleted Successfully", type: "success" });
      await load();
    } catch (err) {
      setToast({ message: errorMessage(err), type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(
    () => items.filter((c) => c.code.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Promotional Coupons" subtitle="Create and manage checkout promotional codes" />

      <form onSubmit={save} className="admin-form">
        <b>{edit ? "Edit Coupon Details" : "Create New Coupon"}</b>
        <label>
          Coupon Code
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER10"
            className="admin-input font-mono"
          />
        </label>

        <label>
          Discount Type
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "flat")}
            className="admin-input"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (INR)</option>
          </select>
        </label>

        <label>
          Discount Value
          <input
            required
            type="number"
            min="0"
            step="any"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "percentage" ? "10" : "500"}
            className="admin-input"
          />
        </label>

        <label>
          Min Order Value (INR)
          <input
            required
            type="number"
            min="0"
            step="any"
            value={minimumCartValue}
            onChange={(e) => setMinimumCartValue(e.target.value)}
            className="admin-input"
          />
        </label>

        <label>
          Expiry Date
          <input
            required
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="admin-input"
          />
        </label>

        <label>
          Usage Limit (Optional)
          <input
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            className="admin-input"
          />
        </label>

        <div className="col-span-full flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={activeStatus}
              onChange={(e) => setActiveStatus(e.target.checked)}
              className="rounded border-[var(--color-border)] text-[var(--color-teal)] focus:ring-0"
            />
            Active Status
          </label>

          <div className="flex gap-2">
            {edit && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-charcoal)] text-xs rounded-[var(--radius-sm)] hover:bg-[var(--color-cream-light)] cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button disabled={isSaving} className="admin-button cursor-pointer disabled:opacity-50">
              {isSaving ? "Saving..." : edit ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code..."
          className="admin-input max-w-xs"
        />

        {filteredItems.length === 0 ? (
          <EmptyState title="No coupons found" description="Try creating a new coupon code or adjust your search filter." icon={<Sparkles aria-hidden="true" />} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((c) => {
              const isExpired = new Date(c.expiryDate).getTime() < Date.now();
              const badgeVariant = isExpired ? "danger" : c.activeStatus ? "success" : "neutral";
              const badgeLabel = isExpired ? "Expired" : c.activeStatus ? "Active" : "Inactive";

              return (
                <div key={c._id} className="admin-row flex flex-col justify-between">
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-[var(--color-teal)]">{c.code}</span>
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-charcoal)] mt-1">
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3 w-full">
                    <p>Min Order: <span className="font-semibold text-[var(--color-charcoal)]">{formatCurrency(c.minimumCartValue)}</span></p>
                    <p>Usage: <span className="font-semibold text-[var(--color-charcoal)]">{c.usedCount ?? 0} / {c.usageLimit ?? "Unlimited"}</span></p>
                    <p>Expires: <span className="font-semibold text-[var(--color-charcoal)]">{formatDate(c.expiryDate)}</span></p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--color-border)] justify-end w-full">
                    <button onClick={() => setEdit(c)} className="cursor-pointer">Edit</button>
                    <button
                      disabled={deletingId === c._id}
                      onClick={() => handleDelete(c._id)}
                      className="text-red-700 cursor-pointer"
                    >
                      {deletingId === c._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- BANNERS ---
function Banners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const load = useCallback(() => adminApi.banners().then(setItems).catch((e) => setToast({ message: errorMessage(e), type: "error" })), []);
  useEffect(() => { void load(); }, [load]);

  const save = async (p: BannerPayload) => {
    try {
      editing ? await adminApi.updateBanner(editing._id, p) : await adminApi.createBanner(p);
      setEditing(null);
      setToast({ message: "Banner slot saved successfully", type: "success" });
      void load();
    } catch (e) {
      setToast({ message: errorMessage(e), type: "error" });
    }
  };

  const shift = async (b: Banner, delta: number) => {
    await adminApi.updateBanner(b._id, { order: b.order + delta });
    void load();
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Homepage Banners" subtitle="Manage storefront promotional hero slots" />

      <BannerForm value={editing} onCancel={() => setEditing(null)} onSave={save} />

      {items.length === 0 ? (
        <EmptyState title="No banners found" description="Upload banner image files to showcase on your homepage." icon={<Sparkles aria-hidden="true" />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((b) => (
            <div key={b._id} className="admin-row flex flex-col space-y-3">
              <img src={b.image} loading="lazy" decoding="async" alt={`Banner ${b.order}`} className="w-full h-44 object-cover rounded-[var(--radius-md)] border border-[var(--color-border)]" />
              <div className="flex items-center justify-between text-xs w-full">
                <span className="text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Slot Order: <b className="text-[var(--color-teal)]">{b.order}</b></span>
                <Badge variant={b.isActive ? "success" : "neutral"}>{b.isActive ? "Active" : "Disabled"}</Badge>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-3 w-full">
                <button onClick={() => shift(b, -1)} className="cursor-pointer">Move up Order</button>
                <button onClick={() => shift(b, 1)} className="cursor-pointer">Move down Order</button>
                <button onClick={() => adminApi.setBannerActive(b._id, !b.isActive).then(load)} className="cursor-pointer">
                  {b.isActive ? "Disable" : "Enable"}
                </button>
                <button onClick={() => setEditing(b)} className="cursor-pointer">Edit</button>
                <button
                  onClick={() => confirm("Delete this banner?") && adminApi.deleteBanner(b._id).then(load)}
                  className="text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerForm({ value, onSave, onCancel }: { value: Banner | null; onSave: (p: BannerPayload) => void; onCancel: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState(value?.order || 1);

  useEffect(() => {
    setFile(null);
    setOrder(value?.order || 1);
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (file) onSave({ file, order });
      }}
      className="admin-form max-w-xl"
    >
      <b>{value ? `Editing Banner Slot ${value.order}` : "Upload New Banner Slot"}</b>
      <label>
        Order Slot
        <select value={order} onChange={(e) => setOrder(Number(e.target.value))} className="admin-input">
          <option value={1}>Slot 1</option>
          <option value={2}>Slot 2</option>
          <option value={3}>Slot 3</option>
        </select>
      </label>
      <label>
        Banner File
        <input
          required={!value}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="admin-input"
        />
      </label>
      <div className="col-span-full flex gap-2 justify-end">
        {value && <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] text-xs rounded-[var(--radius-sm)] cursor-pointer">Cancel</button>}
        <button disabled={!file && !value} className="admin-button cursor-pointer disabled:opacity-50">
          Save Slot
        </button>
      </div>
    </form>
  );
}

// --- ANNOUNCEMENTS ---
function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [edit, setEdit] = useState<Announcement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const load = useCallback(() => adminApi.announcements().then(setItems).catch((e) => setToast({ message: errorMessage(e), type: "error" })), []);
  useEffect(() => { void load(); }, [load]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const p = { message: String(f.get("message")), order: Number(f.get("order")) };
    try {
      edit ? await adminApi.updateAnnouncement(edit._id, p) : await adminApi.createAnnouncement(p);
      setEdit(null);
      setToast({ message: "Announcement Saved", type: "success" });
      void load();
    } catch (err) {
      setToast({ message: errorMessage(err), type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Site Announcements" subtitle="Manage header announcement bars and alerts" />

      <form key={edit ? edit._id : "new"} onSubmit={save} className="admin-form max-w-xl">
        <b>{edit ? "Edit Announcement" : "Create Announcement"}</b>
        <label className="col-span-full">
          Message
          <input required name="message" defaultValue={edit?.message} placeholder="Announcement Message" className="admin-input" />
        </label>
        <label className="col-span-full">
          Display Order
          <input required name="order" type="number" defaultValue={edit?.order ?? 0} placeholder="Display Order" className="admin-input" />
        </label>
        <div className="col-span-full flex justify-end gap-2">
          {edit && <button type="button" onClick={() => setEdit(null)} className="px-4 py-2 border border-[var(--color-border)] text-xs rounded-[var(--radius-sm)] cursor-pointer">Cancel</button>}
          <button className="admin-button cursor-pointer">Save Announcement</button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No announcements found" description="Create notice bar messages for your customers." icon={<Sparkles aria-hidden="true" />} />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="admin-row justify-between">
              <div>
                <p className="text-sm text-[var(--color-charcoal)] font-semibold">{a.message}</p>
                <small>Display Order: {a.order}</small>
              </div>
              <div className="flex gap-2">
                <button onClick={() => adminApi.setAnnouncementActive(a._id, !a.isActive).then(load)} className="cursor-pointer">
                  {a.isActive ? "Disable" : "Enable"}
                </button>
                <button onClick={() => setEdit(a)} className="cursor-pointer">Edit</button>
                <button
                  onClick={() => confirm("Delete announcement?") && adminApi.deleteAnnouncement(a._id).then(load)}
                  className="text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- B2B ACCESS ---
function B2BAccessManagement() {
  const [status, setStatus] = useState<B2BAccessStatus | null>(null);
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const load = useCallback(() => adminApi.b2bAccessStatus().then(setStatus).catch(error => setToast({ message: errorMessage(error), type: "error" })), []);
  useEffect(() => { void load(); }, [load]);
  const generate = () => setPassword(crypto.randomUUID().replace(/-/g, "").slice(0, 16));
  const save = async (event: FormEvent) => { event.preventDefault(); try { const next = await adminApi.setB2BPassword(password); setStatus(next); setToast({ message: "B2B password activated. Existing B2B sessions are now invalid.", type: "success" }); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } };
  const revoke = async () => { if (!confirm("Revoke B2B access now? This invalidates every active B2B session.")) return; try { const next = await adminApi.revokeB2BPassword(); setStatus(next); setPassword(""); setToast({ message: "B2B access revoked for all sessions.", type: "success" }); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } };
  if (!status) return <LoadingState title="Checking B2B access status..." />;
  return <div className="space-y-8">{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}<PageHeader title="B2B Access Password" subtitle="One shared password protects the read-only Gold trade catalogue." /><div className="admin-form max-w-2xl"><div className="flex items-center justify-between"><div><b>Current access</b><p className="mt-1 text-xs text-[var(--color-text-muted)]">Last changed: {status.lastChanged ? new Date(status.lastChanged).toLocaleString() : "Never"}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">Last verified mobile: {status.lastAccessMobile || "No verified access yet"}</p></div><Badge variant={status.active ? "success" : "danger"}>{status.active ? "Active" : "Revoked"}</Badge></div><form onSubmit={save} className="space-y-4 border-t border-[var(--color-border)] pt-5"><label className="block">Shared B2B password<div className="mt-2 flex gap-2"><input required minLength={8} type="text" value={password} onChange={event => setPassword(event.target.value)} placeholder="Set or generate a password" className="admin-input flex-1" /><button type="button" onClick={generate} className="px-4 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs font-semibold cursor-pointer">Generate</button></div></label><button className="admin-button cursor-pointer">Activate / replace password</button></form>{status.active && <button onClick={() => void revoke()} className="border border-[var(--color-error)]/40 text-[var(--color-error)] rounded-[var(--radius-sm)] px-4 py-2 text-xs font-semibold cursor-pointer">Revoke current password</button>}</div></div>;
}

// --- B2B ACCESS LOG ---
function B2BAccessLog() {
  const [entries, setEntries] = useState<import("../api/admin.api").B2BAccessLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void adminApi.b2bAccessLogs().then(setEntries).catch(reason => setError(errorMessage(reason))); }, []);
  if (error) return <div className="space-y-8"><PageHeader title="B2B Access Log" subtitle="Successful B2B password and OTP verifications." /><p className="rounded-[var(--radius-sm)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">{error}</p></div>;
  if (!entries) return <LoadingState title="Loading B2B access log..." />;
  return <div className="space-y-8"><PageHeader title="B2B Access Log" subtitle="Successful B2B password and OTP verifications." /><div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="border-b border-[var(--color-border)] bg-[var(--color-cream)]/40 text-xs uppercase tracking-wider text-[var(--color-text-muted)]"><tr><th className="px-5 py-4 font-semibold">Mobile Number</th><th className="px-5 py-4 font-semibold">Accessed At</th><th className="px-5 py-4 font-semibold">OTP Status</th></tr></thead><tbody className="divide-y divide-[var(--color-border)]">{entries.length ? entries.map((entry) => <tr key={entry.id} className="text-sm"><td className="px-5 py-4 font-medium text-[var(--color-text)]">{entry.mobile}</td><td className="px-5 py-4 text-[var(--color-text-muted)]">{new Date(entry.accessedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-5 py-4"><Badge variant="success">Verified</Badge></td></tr>) : <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">No successful B2B access has been recorded yet.</td></tr>}</tbody></table></div></div></div>;
}

// --- METAL RATES ---
function MetalRates() {
  const [rates, setRates] = useState<{ b2c: any; b2b: any } | null>(null); const [tab, setTab] = useState<"b2c" | "b2b">("b2c"); const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null); const load = useCallback(() => apiRequest<any>("/admin/metal-rates").then(setRates).catch(e => setToast({ message: errorMessage(e), type: "error" })), []); useEffect(() => { void load() }, [load]); if (!rates) return <LoadingState title="Retrieving B2C and B2B metal rates..." />; const current = rates[tab], b2b = tab === "b2b"; const save = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const body: Record<string, number | string> = { sheet: tab.toUpperCase() }; if (!b2b) { body.gold24kt = Number(f.get("gold24kt")); body.silver = Number(f.get("silver")) } ["makingRatePerGram", "certificateRatePerGram", "silverMoissaniteMakingRate", "silverPolkiMakingRate", "moissaniteRatePerCarat"].forEach(k => body[k] = Number(f.get(k))); try { setRates(await apiRequest<any>("/admin/metal-rates", { method: "PUT", body: JSON.stringify(body) })); setToast({ message: `${tab.toUpperCase()} metal rates updated.`, type: "success" }) } catch (error) { setToast({ message: errorMessage(error), type: "error" }) } }; const field = (key: string, label: string, locked = false) => <label key={key} className="uppercase">{label}<input className="admin-input disabled:cursor-not-allowed disabled:bg-stone-100" name={key} type="number" min="0" step="any" defaultValue={current[key] ?? ""} disabled={locked} readOnly={locked} /></label>; return <div className="space-y-8">{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}<PageHeader title="Metal Rates" subtitle="Separate B2C and B2B rate sheets. Gold and Silver are shared from B2C." /><div className="flex gap-2 border-b border-[var(--color-border)]"><button type="button" onClick={() => setTab("b2c")} className={`px-4 py-2 text-sm font-semibold ${!b2b ? "border-b-2 border-[var(--color-teal)] text-[var(--color-teal)]" : "text-[var(--color-text-muted)]"}`}>B2C Metal Rates</button><button type="button" onClick={() => setTab("b2b")} className={`px-4 py-2 text-sm font-semibold ${b2b ? "border-b-2 border-[var(--color-teal)] text-[var(--color-teal)]" : "text-[var(--color-text-muted)]"}`}>B2B Metal Rates</button></div><form key={tab} onSubmit={save} className="admin-form max-w-2xl"><b>Baseline Rate Configuration</b>{field("gold24kt", "Gold 24kt rate / 10g", b2b)}{field("silver", "Fine silver rate (per gram)", b2b)}{b2b && <p className="col-span-full -mt-2 text-xs text-[var(--color-text-muted)]">Gold and Silver are synced from B2C - edit them in the B2C tab.</p>}{field("makingRatePerGram", "Universal Gold making rate / gram")}{field("certificateRatePerGram", "Certificate charge / carat")}<div className="col-span-full border-t border-[var(--color-border)] pt-5"><b>Silver Category Making Rates</b></div>{field("silverMoissaniteMakingRate", "Silver-Moissanite making rate / gram")}{field("silverPolkiMakingRate", "Silver-Polki making rate / gram")}{field("moissaniteRatePerCarat", "Moissanite rate per carat")}<div className="col-span-full flex items-center justify-between border-t border-[var(--color-border)] pt-4"><span className="text-xs text-[var(--color-text-muted)]">Last metal-rate update: {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : "N/A"}</span><button className="admin-button cursor-pointer">Save {tab.toUpperCase()} rates</button></div></form></div>;
}
// --- CATEGORIES ---
const CATEGORY_SHORT_CODES = [['NL', 'Necklace'], ['BR', 'Bracelet'], ['LR', 'Ring'], ['ER', 'Earring'], ['PD', 'Pendant'], ['BG', 'Bangle'], ['MT', 'Diamond Maangtika'], ['MG', 'Diamond Mangalsutra'], ['SLVM', 'Silver Moissanite'], ['SLVP', 'Silver Polki']] as const;

function Categories() {
  const [items, setItems] = useState<Category[]>([]); const [isSubCategory, setIsSubCategory] = useState(false); const [selectedParentId, setSelectedParentId] = useState(""); const [editing, setEditing] = useState<Category | null>(null); const [categoryName, setCategoryName] = useState(""); const [categoryShortCode, setCategoryShortCode] = useState(""); const [homepageCoverImage, setHomepageCoverImage] = useState(""); const [isUploadingCover, setIsUploadingCover] = useState(false); const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const load = useCallback(() => adminApi.categories().then(setItems).catch((e) => setToast({ message: errorMessage(e), type: "error" })), []); useEffect(() => { void load(); }, [load]);
  const mainCategories = items.filter((category) => category.categoryKind === "metal-root"); const parentCategories = items.filter((category) => category.categoryKind === "metal-root" || category.categoryKind === "type"); const parentId = (category: Category) => typeof category.parent === "string" ? category.parent : category.parent?._id; const resetForm = () => { setEditing(null); setIsSubCategory(false); setSelectedParentId(""); setCategoryName(""); setCategoryShortCode(""); setHomepageCoverImage(""); };
  const previewMetal = selectedParentId ? items.find((category) => category._id === selectedParentId)?.metal : (categoryName.trim().toLowerCase() === "silver" ? "silver" : "gold"); const fallbackShortCode = categoryName.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase().padEnd(2, "X"); const skuPreview = `TBA-${previewMetal === "silver" ? "SLV" : "GLD"}-${categoryShortCode || fallbackShortCode}-XXX`;
  const save = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const parent = isSubCategory ? selectedParentId : null; if (isUploadingCover) { setToast({ message: "Wait for the cover image upload to finish", type: "error" }); return; } if (isSubCategory && !parent) { setToast({ message: "Select a main category", type: "error" }); return; } const payload = { name: categoryName.trim(), parent, isActive: f.get("isActive") === "on", showOnHomepage: f.get("showOnHomepage") === "on", homepageCoverImage: homepageCoverImage.trim(), shortCode: categoryShortCode }; if (payload.showOnHomepage && !payload.homepageCoverImage) { setToast({ message: "Upload or enter a homepage cover image before saving", type: "error" }); return; } const candidateMetal = parent ? items.find((category) => category._id === parent)?.metal : payload.name.toLowerCase(); const duplicate = items.some((category) => category._id !== editing?._id && category.name.trim().toLowerCase() === payload.name.toLowerCase() && (parentId(category) || null) === parent && category.metal === candidateMetal); if (duplicate) { setToast({ message: "A category with this name already exists under the selected parent.", type: "error" }); return; } try { if (editing) await adminApi.updateCategory(editing._id, payload); else await adminApi.createCategory(payload); form.reset(); resetForm(); setToast({ message: editing ? "Category Updated Successfully" : "Category Created Successfully", type: "success" }); await load(); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } };
  const startEdit = (category: Category) => { setEditing(category); const id = parentId(category); setIsSubCategory(Boolean(id)); setSelectedParentId(id || ""); setCategoryName(category.name); setCategoryShortCode(category.shortCode || ""); setHomepageCoverImage(category.homepageCoverImage || ""); }; const toggle = async (category: Category) => { try { await adminApi.updateCategory(category._id, { isActive: !category.isActive }); await load(); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } }; const toggleHomepage = async (category: Category) => { try { await adminApi.updateCategory(category._id, { showOnHomepage: !category.showOnHomepage }); await load(); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } }; const uploadCover = async (file?: File) => { if (!file) return; setIsUploadingCover(true); try { const { url } = await adminApi.uploadImage(file); setHomepageCoverImage(url); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } finally { setIsUploadingCover(false); } }; const remove = async (id: string) => { if (!confirm("Delete category?")) return; try { await adminApi.deleteCategory(id); await load(); } catch (error) { setToast({ message: errorMessage(error), type: "error" }); } }; const canDelete = (category: Category) => category.categoryKind !== "metal-root" && !items.some((item) => parentId(item) === category._id);
  const renderRow = (category: Category, nested = false) => <div key={category._id} className={`admin-row justify-between ${nested ? "ml-6 border-l-2 border-[var(--color-border)] pl-4" : ""}`}><div><p className="text-sm font-semibold text-[var(--color-charcoal)]">{nested && <span className="mr-2 text-[var(--color-text-muted)]" aria-hidden="true">-</span>}{category.name}</p><small>{nested ? "Sub Category" : "Main Category"} &bull; {category.homepageCoverImage ? "Homepage cover ready" : "No homepage cover"} | SKU code: {category.shortCode || category.name.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase().padEnd(2, "X")}</small></div><div className="flex items-center gap-2"><Badge variant={category.isActive ? "success" : "neutral"}>{category.isActive ? "Active" : "Inactive"}</Badge><button onClick={() => startEdit(category)} className="cursor-pointer">Edit</button><button onClick={() => void toggle(category)} className="cursor-pointer">Toggle</button>{canDelete(category) && <button onClick={() => void remove(category._id)} className="text-red-700 cursor-pointer">Delete</button>}</div></div>;
  return <div className="space-y-8">{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}<PageHeader title="Product Categories" subtitle="Structure catalogue navigation and filters" /><form onSubmit={save} className="admin-form max-w-xl"><b>{editing ? "Edit Category" : "Create New Category"}</b><label>Category Type<select value={isSubCategory ? "sub" : "main"} onChange={(e) => { const sub = e.target.value === "sub"; setIsSubCategory(sub); if (!sub) setSelectedParentId(""); }} className="admin-input"><option value="main">Main Category</option><option value="sub">Sub Category</option></select></label>{isSubCategory && <label>Parent Category<select required value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)} className="admin-input"><option value="">Select parent category</option>{parentCategories.filter((category) => category._id !== editing?._id).map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>}<label>Category Name<input required name="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category Name" className="admin-input" /></label><label>SKU Short Code<select name="shortCode" value={categoryShortCode} onChange={(e) => setCategoryShortCode(e.target.value)} className="admin-input"><option value="">Use category-name fallback</option>{CATEGORY_SHORT_CODES.map(([code, label]) => <option key={code} value={code}>{code} &ndash; {label}</option>)}</select><small>When blank, SKUs use the first two letters of the category name.</small></label><div className="col-span-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"><span className="text-[var(--color-text-muted)]">SKU preview: </span><span className="font-mono font-semibold">{skuPreview}</span></div>{isSubCategory && <><label>Homepage Cover Image Link<input value={homepageCoverImage} onChange={(e) => setHomepageCoverImage(e.target.value)} placeholder="Paste image URL" className="admin-input" /></label><label>Upload Homepage Cover Image<input type="file" accept="image/*" onChange={(e) => void uploadCover(e.target.files?.[0])} className="admin-input" disabled={isUploadingCover} /></label>{isUploadingCover && <small>Uploading cover image...</small>}</>}<div className="col-span-full flex items-center justify-between"><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"><input name="isActive" key={`${editing?._id || "new"}-active`} type="checkbox" defaultChecked={editing?.isActive ?? true} className="rounded border-[var(--color-border)] text-[var(--color-teal)]" />Active</label>{isSubCategory && <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"><input name="showOnHomepage" key={`${editing?._id || "new"}-homepage`} type="checkbox" defaultChecked={editing?.showOnHomepage ?? false} className="rounded border-[var(--color-border)] text-[var(--color-teal)]" />Show on Homepage</label>}</div><div className="flex gap-2">{editing && <button type="button" onClick={resetForm} className="cursor-pointer">Cancel</button>}<button className="admin-button cursor-pointer" disabled={isUploadingCover}>{isUploadingCover ? "Uploading cover..." : editing ? "Update Category" : "Create Category"}</button></div></div></form>{items.length === 0 ? <EmptyState title="No categories found" description="Create initial catalogue categories." icon={<Sparkles aria-hidden="true" />} /> : <div className="space-y-2">{mainCategories.map((main) => <React.Fragment key={main._id}>{renderRow(main)}{items.filter((category) => parentId(category) === main._id).map((sub) => <React.Fragment key={sub._id}>{renderRow(sub, true)}{items.filter((category) => parentId(category) === sub._id).map((leaf) => renderRow(leaf, true))}</React.Fragment>)}</React.Fragment>)}</div>}</div>;
}

// --- ORDERS ---
function Orders() {
  const [data, setData] = useState<any>({ orders: [] });
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const load = useCallback(() => apiRequest<any>("/admin/orders?limit=25").then(setData).catch((error) => setToast({ message: errorMessage(error), type: "error" })), []);
  useEffect(() => { void load(); }, [load]);

  const orders = Array.isArray(data.orders || data) ? data.orders || data : [];
  const filtered = orders.filter((order: any) => `${order._id || ""} ${order.customer?.name || ""} ${order.customer?.email || ""}`.toLowerCase().includes(search.toLowerCase()));
  const reference = (id: string) => `#${String(id).slice(-8).toUpperCase()}`;

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Customer Orders" subtitle="A clear read-only record of every purchase." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order reference, customer or email" className="admin-input w-full sm:max-w-md" />
        <span className="text-xs text-[var(--color-text-muted)]">{filtered.length} order{filtered.length === 1 ? "" : "s"}</span>
      </div>
      {filtered.length === 0 ? <EmptyState title="No orders found" description="Placed orders will appear here." icon={<Sparkles aria-hidden="true" />} /> : (
        <div className="space-y-5">
          {filtered.map((order: any) => (
            <article key={order._id} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-sm)]">
              <header className="flex flex-col gap-4 border-b border-[var(--color-border)] bg-[var(--color-cream-light)]/60 p-5 md:flex-row md:items-center md:justify-between">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Order reference</p><p className="mt-1 font-mono text-sm font-bold text-[var(--color-teal)]">{reference(order._id)}</p></div>
                <div className="flex items-center gap-4 md:text-right"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Order total</p><p className="mt-1 text-lg font-bold text-[var(--color-teal)]">{formatCurrency(order.amount || 0)}</p></div><button type="button" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)} className="rounded border border-[var(--color-teal)] px-3 py-2 text-xs font-semibold text-[var(--color-teal)]">{expandedOrder === order._id ? "Hide details" : "View details"}</button></div>
              </header>
              {expandedOrder === order._id && <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <section>
                  <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold text-[var(--color-charcoal)]">Purchased products</h3><span className="rounded-full bg-[var(--color-cream-light)] px-2.5 py-1 text-xs font-medium text-[var(--color-teal)]">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</span></div>
                  <div className="space-y-2">
                    {(order.items || []).map((item: any, index: number) => (
                      <div key={`${item.productSku || item.title}-${index}`} className="flex gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white p-3">
                        {item.image ? <img src={item.image} alt={item.title || "Product"} className="h-14 w-14 shrink-0 rounded object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-[var(--color-cream-light)] text-[10px] text-[var(--color-text-muted)]">No image</div>}
                        <div className="min-w-0 flex-1"><p className="truncate font-semibold text-[var(--color-charcoal)]">{item.title || item.productSku || "Product"}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{[item.karat, item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(" / ") || "Product details unavailable"}</p><p className="mt-1 text-xs font-medium text-[var(--color-teal)]">Quantity: {item.quantity || 1}</p></div>
                        {item.priceSnapshot?.finalPrice != null && <p className="shrink-0 text-sm font-semibold text-[var(--color-charcoal)]">{formatCurrency(item.priceSnapshot.finalPrice * (item.quantity || 1))}</p>}
                      </div>
                    ))}
                  </div>
                </section>
                <aside className="border-t border-[var(--color-border)] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Customer</p><p className="mt-2 font-semibold text-[var(--color-charcoal)]">{order.customer?.name || "Customer"}</p><p className="mt-1 break-all text-xs text-[var(--color-text-muted)]">{order.customer?.email || "No email available"}</p><p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Placed on</p><p className="mt-2 text-sm text-[var(--color-charcoal)]">{formatDate(order.createdAt)}</p></aside>
              </div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
// --- USERS ---
function Users() {
  const [items, setItems] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const load = useCallback(() => adminApi.users().then(setItems).catch((e) => setToast({ message: errorMessage(e), type: "error" })), []);
  useEffect(() => { void load(); }, [load]);

  const filtered = items.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Registered Customers" subtitle="Manage accounts and customer access controls" />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers by name or email..."
        className="admin-input max-w-xs"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No customers found" description="Customer account details will be listed here." icon={<Sparkles aria-hidden="true" />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u) => (
            <div key={u._id} className="admin-row justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[var(--color-teal)]">{u.name}</p>
                  <Badge variant={u.isBlocked ? "danger" : "success"}>{u.isBlocked ? "Blocked" : "Active"}</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                <small>{u.phone || "No phone provided"}</small>
              </div>
              <button
                onClick={() =>
                  adminApi
                    .setUserBlocked(u._id, !u.isBlocked)
                    .then(() => {
                      setToast({ message: `Customer ${!u.isBlocked ? "Blocked" : "Unblocked"}`, type: "info" });
                      void load();
                    })
                }
                className={`cursor-pointer ${u.isBlocked ? "text-emerald-700" : "text-red-700"}`}
              >
                {u.isBlocked ? "Unblock Account" : "Block Account"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MAIN ENTRY ---
export default function AdminApp() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Resilient Auth Restore Flow
    adminApi
      .me()
      .then((user) => {
        if (isMounted) setAdmin(user);
      })
      .catch(() => {
        // Fallback to cookie / refresh session silent attempt
        return adminApi.refresh()
          .then((user) => {
            if (isMounted) setAdmin(user);
          })
          .catch(() => {
            if (isMounted) setAdmin(null);
          });
      })
      .finally(() => {
        if (isMounted) setReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    await adminApi.logout().catch(() => null);
    setAdmin(null);
    nav("/admin/login");
  };

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--color-bg)] font-secondary">
        <LoadingState title="Initializing Administrative Session..." />
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="login"
        element={
          admin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Login
              onLogin={(a) => {
                setAdmin(a);
                nav("/admin");
              }}
            />
          )
        }
      />
      <Route
        path="*"
        element={admin ? <Layout admin={admin} onLogout={logout} /> : <Navigate to="/admin/login" replace />}
      />
    </Routes>
  );
}
