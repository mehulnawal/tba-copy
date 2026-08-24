import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminApi, type DiamondCategory } from "../api/admin.api";
import { ApiRequestError } from "../api/client";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
const errorText = (error: unknown) =>
  error instanceof ApiRequestError
    ? error.message
    : "Unable to complete this request.";

export default function DiamondCategories() {
  const [rows, setRows] = useState<DiamondCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [size, setSize] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [b2bPrice, setB2bPrice] = useState("");
  const [b2cPrice, setB2cPrice] = useState("");
  const [editing, setEditing] = useState<DiamondCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editB2b, setEditB2b] = useState("");
  const [editB2c, setEditB2c] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(
        (await adminApi.diamondCategories()).map((row) => ({
          ...row,
          categoryName:
            row.categoryName ||
            (row as DiamondCategory & { name?: string }).name ||
            "",
          size: row.size || "",
          b2bPrice: Number(row.b2bPrice ?? 0),
          b2cPrice: Number(row.b2cPrice ?? 0),
        })),
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const name = categoryName.trim();
    if (!name) {
      setSizes([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void adminApi
        .diamondCategorySizes(name)
        .then(setSizes)
        .catch(() => setSizes([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [categoryName]);

  const reset = () => {
    setFormOpen(false);
    setCategoryName("");
    setSize("");
    setSizes([]);
    setB2bPrice("");
    setB2cPrice("");
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (
      !categoryName.trim() ||
      !size.trim() ||
      b2bPrice === "" ||
      b2cPrice === ""
    ) {
      setError("Category name, size, B2B price and B2C price are required.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createDiamondCategory({
        categoryName: categoryName.trim(),
        size: size.trim(),
        b2bPrice: Number(b2bPrice),
        b2cPrice: Number(b2cPrice),
      });
      reset();
      setMessage("Diamond category added.");
      await load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };
  const update = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.updateDiamondCategory(editing._id, {
        categoryName: editCategoryName.trim(),
        size: editSize.trim(),
        b2bPrice: Number(editB2b),
        b2cPrice: Number(editB2c),
      });
      setEditing(null);
      setMessage("Diamond category updated.");
      await load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row: DiamondCategory) => {
    if (!window.confirm(`Delete ${row.categoryName} / ${row.size}?`)) return;
    setError("");
    try {
      await adminApi.deleteDiamondCategory(row._id);
      setMessage("Diamond category deleted.");
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Master data</p>
          <h1 className="text-3xl font-primary tracking-tight text-[var(--color-teal)]">
            Diamond Categories
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Manage category sizes and B2B/B2C rates in insertion order.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary"
          onClick={() => {
            setFormOpen(true);
            setError("");
          }}
        >
          + Add New
        </button>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]"
        >
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-teal)]/20 bg-[var(--color-teal)]/10 p-3 text-sm text-[var(--color-teal)]">
          {message}
        </div>
      )}
      {formOpen && (
        <form
          onSubmit={create}
          className="admin-form grid max-w-3xl gap-4 md:grid-cols-2"
        >
          <div className="col-span-full flex items-center justify-between">
            <b>Add New Diamond Category</b>
            <button type="button" className="admin-text-button" onClick={reset}>
              Cancel
            </button>
          </div>
          <label>
            Category Name
            <input
              required
              className="admin-input"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            Size
            <div className="relative">
              <input
                required
                className="admin-input w-full"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                list="diamond-size-suggestions"
                autoComplete="off"
                placeholder="e.g. 0-9pt or 1.25ct"
              />
              <datalist id="diamond-size-suggestions">
                {sizes.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
          </label>
          <label>
            B2B Price
            <input
              required
              min="0"
              step="0.01"
              type="number"
              className="admin-input"
              value={b2bPrice}
              onChange={(e) => setB2bPrice(e.target.value)}
            />
          </label>
          <label>
            B2C Price
            <input
              required
              min="0"
              step="0.01"
              type="number"
              className="admin-input"
              value={b2cPrice}
              onChange={(e) => setB2cPrice(e.target.value)}
            />
          </label>
          <button
            disabled={saving}
            className="admin-button col-span-full disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Diamond Category"}
          </button>
        </form>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
          Loading diamond categories...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-text-muted)]">
          No diamond categories found.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Size</th>
                <th>B2B Price</th>
                <th>B2C Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.categoryName}</td>
                  <td>{row.size}</td>
                  <td>{money(row.b2bPrice)}</td>
                  <td>{money(row.b2cPrice)}</td>
                  <td className="whitespace-nowrap">
                    <button
                      className="admin-text-button"
                      onClick={() => {
                        setEditing(row);
                        setEditCategoryName(row.categoryName);
                        setEditSize(row.size);
                        setEditB2b(String(row.b2bPrice));
                        setEditB2c(String(row.b2cPrice));
                      }}
                    >
                      Edit prices
                    </button>
                    <button
                      className="admin-text-button danger"
                      onClick={() => void remove(row)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={update}
            className="w-full max-w-md space-y-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-6 shadow-[var(--shadow-lg)]"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-primary text-[var(--color-teal)]">
                Edit Diamond Category
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Renaming the category updates existing product diamond labels
                that use it.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Category name
                <input
                  required
                  className="admin-input"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Size
                <input
                  required
                  className="admin-input"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                B2B Price
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  className="admin-input"
                  value={editB2b}
                  onChange={(e) => setEditB2b(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                B2C Price
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  className="admin-input"
                  value={editB2c}
                  onChange={(e) => setEditB2c(e.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="admin-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button disabled={saving} className="admin-button">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
