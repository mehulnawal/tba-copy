import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as XLSX from "xlsx";
import { apiRequest } from "../api/client";
import {
  adminApi,
  type CertificateOption,
  type DiamondCategory,
  type DiamondClarity,
} from "../api/admin.api";
import { useToast } from "../context/ToastContext";
import type {
  Category,
  DiamondEntry,
  GoldKaratWeights,
  MoissaniteEntry,
  PriceBreakdown,
  Product,
} from "../types";
import {
  colorForSlot,
  normalizeVariantImages,
  shortColor,
  variantConfig,
  YELLOW,
} from "../utils/productVariants";

type Karat = "14kt" | "18kt";
type Image = { url: string; source: "link" | "upload"; slot?: number };
type FormField =
  | "title"
  | "SKU"
  | "metal"
  | "mainCategory"
  | "subCategory"
  | "images"
  | "colors"
  | "totalNumberOfDiamonds"
  | "diamonds"
  | "price"
  | "moissaniteCaratWeight"
  | "grossWeight";
type FormErrors = Partial<Record<FormField, string>>;
type GoldImportRow = {
  row: number;
  title: string;
  subCategory: string;
  gross14: number;
  gross18: number;
  publish: boolean;
  payload?: Partial<Product>;
  fieldResults: { header: string; valid: boolean; message?: string }[];
  error?: string;
};
type ProductForm = {
  SKU: string;
  title: string;
  description: string;
  metal: "" | "gold" | "silver" | "diamond";
  mainCategory: string;
  subCategory: string;
  images: Image[];
  videoLink: string;
  sizes: number[];
  colors: string[];
  grossWeight: number;
  netWeight: number;
  goldGrossWeight: GoldKaratWeights;
  moissaniteCaratWeight: number;
  moissaniteEntries: MoissaniteEntry[];
  price: number;
  diamonds: DiamondEntry[];
  totalNumberOfDiamonds?: number;
  certificateWeight: string;
  certificates: string[];
  isBestSeller: boolean;
  isNewProduct: boolean;
  isPrimeCollection: boolean;
  productDiscountType: "" | "percentage" | "flat" | null;
  productDiscountValue: number;
  isActive: boolean;
};
const CAD_FORM_BASE_URL =
  import.meta.env.VITE_CAD_GOOGLE_FORM_BASE_URL ||
  "https://docs.google.com/forms/d/e/1FAIpQLScQLwRnGi8gV7fw_WubYMC2TUrCKDx2hCZUv_0uGeL6MXr67Q/viewform?usp=pp_url&entry.1415814127=";

type CadSectionProps = {
  sku?: string;
  cadFolderUrl?: string;
  onRefresh: () => void;
  refreshing: boolean;
  showError: (message: string) => void;
};
const CadSection = ({
  sku,
  cadFolderUrl,
  onRefresh,
  refreshing,
  showError,
}: CadSectionProps) => {
  const savedSku = String(sku || "").trim();
  const openUploadForm = () => {
    if (!savedSku) return;
    const tab = window.open(
      `${CAD_FORM_BASE_URL}${encodeURIComponent(savedSku)}`,
      "_blank",
    );
    if (!tab) {
      showError(
        "Unable to open the CAD upload form. Please allow pop-ups and try again.",
      );
      return;
    }
    tab.opener = null;
  };
  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <span>CAD</span>
        <div>
          <h2>CAD images</h2>
          <p>
            CAD files are uploaded securely through the connected Google Form.
          </p>
        </div>
      </div>
      {cadFolderUrl ? (
        <a
          className="admin-primary inline-flex w-fit"
          href={cadFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open CAD Folder
        </a>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="admin-secondary"
            disabled={!savedSku}
            onClick={openUploadForm}
          >
            Upload CAD Images
          </button>
          {!savedSku && (
            <small className="text-[var(--color-text-muted)]">
              Save the product first to generate its SKU.
            </small>
          )}
          {savedSku && (
            <button
              type="button"
              className="admin-text-button"
              disabled={refreshing}
              onClick={onRefresh}
            >
              {refreshing ? "Refreshing..." : "Refresh CAD status"}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
const STANDARD_RING_SIZES = Array.from({ length: 21 }, (_, index) => index + 5);
const GOLD_IMPORT_HEADERS = [
  "SKU", "Product Title", "Description", "Subcategory", "14KT Gross Weight (g)",
  "18KT Gross Weight (g)", "Total Number of Diamonds", "Certificate Weight (g)",
  "Certificates", "Sizes", "Colors", "Image URL 1", "Image URL 2", "Image URL 3",
  "Image URL 4", "Image URL 5", "Image URL 6", "Video Link", "Best Seller",
  "New Arrival", "Prime Collection", "Publish Product", "Product Discount Type",
  "Product Discount Value",
  ...Array.from({ length: 10 }, (_, index) => index + 1).flatMap((n) => [
    `Diamond ${n} Category`, `Diamond ${n} Size`, `Diamond ${n} Sub Type`,
    `Diamond ${n} Colour / Clarity`, `Diamond ${n} Carat Weight`,
    `Diamond ${n} Rate per Ct (B2B)`, `Diamond ${n} Rate per Ct (B2C)`,
  ]),
] as const;
const GOLD_IMPORT_SAMPLE: Record<string, string | number> = {
  SKU: "", "Product Title": "Classic Gold Diamond Ring", Description: "18KT gold ring with a round diamond.",
  Subcategory: "Rings", "14KT Gross Weight (g)": 4.2, "18KT Gross Weight (g)": 4.5,
  "Total Number of Diamonds": 1, "Certificate Weight (g)": 0.1, Certificates: "IGI",
  Sizes: "5,6,7,8,9", Colors: "Yellow Gold,White Gold", "Image URL 1": "https://example.com/ring-yellow-1.jpg",
  "Image URL 2": "https://example.com/ring-yellow-2.jpg", "Image URL 3": "https://example.com/ring-white-1.jpg",
  "Video Link": "https://example.com/ring-video", "Best Seller": "Yes", "New Arrival": "No",
  "Prime Collection": "Yes", "Publish Product": "Yes", "Product Discount Type": "percentage",
  "Product Discount Value": 10, "Diamond 1 Category": "Round", "Diamond 1 Size": "Standard",
  "Diamond 1 Sub Type": "Round Brilliant", "Diamond 1 Colour / Clarity": "EF/VVSVS",
  "Diamond 1 Carat Weight": 0.25, "Diamond 1 Rate per Ct (B2B)": 50000,
  "Diamond 1 Rate per Ct (B2C)": 60000,
};
const downloadGoldImportTemplate = (sample = GOLD_IMPORT_SAMPLE) => {
  const sheet = XLSX.utils.json_to_sheet([sample], { header: [...GOLD_IMPORT_HEADERS] });
  sheet["!cols"] = GOLD_IMPORT_HEADERS.map((header) => ({ wch: Math.max(15, Math.min(30, header.length + 2)) }));
  sheet["!autofilter"] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(sheet["!ref"] || "A1")) };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Gold Products");
  XLSX.writeFile(workbook, "gold-product-import-template.xlsx");
};
const STONE_CATEGORIES = ["Center", "Small"];
const STONE_SUB_TYPES = [
  "Round Brilliant",
  "Princess",
  "Cushion",
  "Emerald",
  "Oval",
  "Radiant",
  "Pear",
  "Marquise",
  "Asscher",
  "Heart",
];
const blank = (): ProductForm => ({
  SKU: "",
  title: "",
  description: "",
  metal: "",
  mainCategory: "",
  subCategory: "",
  images: [],
  videoLink: "",
  sizes: STANDARD_RING_SIZES,
  colors: [],
  grossWeight: 0,
  netWeight: 0,
  goldGrossWeight: { "18kt": 0, "14kt": 0 },
  moissaniteCaratWeight: 0,
  moissaniteEntries: [],
  price: 0,
  diamonds: [],
  totalNumberOfDiamonds: undefined,
  certificateWeight: "",
  certificates: [],
  isBestSeller: false,
  isNewProduct: false,
  isPrimeCollection: false,
  productDiscountType: "",
  productDiscountValue: 0,
  isActive: true,
});
const categoryId = (value?: string | { _id: string } | null) =>
  typeof value === "string" ? value : value?._id || "";
const categoryName = (value?: Category | string | null) =>
  !value ? "Uncategorised" : typeof value === "string" ? value : value.name;
const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
const number = (value: string) => (value === "" ? 0 : Number(value));
const goldWeights = (value?: number | GoldKaratWeights): GoldKaratWeights =>
  typeof value === "number"
    ? { "18kt": value, "14kt": value }
    : {
        "18kt": Number(value?.["18kt"] || 0),
        "14kt": Number(value?.["14kt"] || 0),
      };
const productExportRows = (products: Product[]) =>
  products.map((product) => {
    const price = (karat?: "14kt" | "18kt") =>
      product.prices?.find((item) => item.karat === karat)?.finalPrice ?? "";
    const grossWeight =
      typeof product.grossWeight === "number" ? product.grossWeight : "";
    const goldWeight =
      typeof product.grossWeight === "object" ? product.grossWeight : undefined;
    return {
      SKU: product.SKU,
      "Product Title": product.title || "",
      Metal: product.metal || "",
      "Main Category": categoryName(product.mainCategory),
      Subcategory: categoryName(product.subCategory),
      Status: product.isActive ? "Published" : "Draft",
      "Best Seller": product.isBestSeller ? "Yes" : "No",
      "New Arrival": product.isNewProduct ? "Yes" : "No",
      "14KT Price (INR)": price("14kt"),
      "18KT Price (INR)": price("18kt"),
      "Silver Price (INR)":
        product.metal === "silver"
          ? (product.prices?.[0]?.finalPrice ?? "")
          : "",
      "Gross Weight (g)": grossWeight,
      "14KT Gross Weight (g)": goldWeight?.["14kt"] ?? "",
      "18KT Gross Weight (g)": goldWeight?.["18kt"] ?? "",
      "Diamond Details": (product.diamonds || [])
        .map((diamond) =>
          [
            diamond.category,
            diamond.subType,
            diamond.colorClarity,
            `${diamond.caratWeight} ct`,
            diamond.ratePerCt ? `INR ${diamond.ratePerCt}/ct` : "",
          ]
            .filter(Boolean)
            .join(" \u00B7 "),
        )
        .join(" | "),
      Colours: (product.colors || []).join(", "),
      Certificates: (product.certificates || [])
        .map((certificate) =>
          typeof certificate === "string" ? certificate : certificate.name,
        )
        .join(", "),
      "Primary Image URL": product.images?.[0]?.url || "",
      "Video URL": product.videoLink || "",
    };
  });
const exportProducts = (products: Product[]) => {
  const sheet = XLSX.utils.json_to_sheet(productExportRows(products));
  sheet["!cols"] = [
    12, 30, 10, 20, 20, 12, 12, 12, 16, 16, 18, 18, 22, 22, 60, 28, 28, 50, 50,
  ].map((wch) => ({ wch }));
  sheet["!autofilter"] = {
    ref: XLSX.utils.encode_range(
      XLSX.utils.decode_range(sheet["!ref"] || "A1"),
    ),
  };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Products");
  XLSX.writeFile(
    workbook,
    `tba-products-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

function Field({
  name,
  label,
  hint,
  error,
  required,
  children,
}: {
  name?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`admin-field ${error ? "admin-field--error" : ""}`}>
      <span>
        {label} {required && <em>*</em>}
      </span>
      {children}
      {error ? (
        <small id={`${name}-error`} role="alert">
          {error}
        </small>
      ) : (
        hint && <small>{hint}</small>
      )}
    </label>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="admin-toggle-card">
      <span>
        <b>{label}</b>
      </span>
      <input
        aria-label={label}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <i />
    </label>
  );
}
function GoldWeightBlock({
  karat,
  grossWeight,
  diamondWeight,
  grossWeightError,
  onGrossWeightChange,
}: {
  karat: Karat;
  grossWeight: number;
  diamondWeight: number;
  grossWeightError?: string;
  onGrossWeightChange: (value: number) => void;
}) {
  const netWeight = grossWeight - diamondWeight;
  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <span>{karat === "18kt" ? "02" : "04"}</span>
        <div>
          <h2>{karat.toUpperCase()} weight</h2>
          <p>
            Gross Weight is entered manually. Diamond and Net Weight are
            calculated from the shared diamond entries.
          </p>
        </div>
      </div>
      <div className="admin-grid">
        <Field
          name="grossWeight"
          label="Gross Weight (g)"
          required
          error={grossWeightError}
          hint="Used for Gold Value."
        >
          <input
            data-field="grossWeight"
            className="admin-input"
            type="number"
            min="0.01"
            step="0.01"
            value={grossWeight}
            onChange={(e) => onGrossWeightChange(number(e.target.value))}
          />
        </Field>
        <Field
          label="Diamond Weight (gm)"
          hint="Total Diamond Weight (ct) / 5."
        >
          <input
            className="admin-input"
            type="number"
            readOnly
            value={diamondWeight.toFixed(2)}
          />
        </Field>
        <Field label="Net Weight (g)" hint="Gross Weight - Diamond Weight.">
          <input
            className="admin-input"
            type="number"
            readOnly
            value={netWeight.toFixed(2)}
          />
        </Field>
      </div>
    </section>
  );
}
function GoldPricePreview({ preview }: { preview: PriceBreakdown[] }) {
  return (
    <div className="admin-pricing-grid">
      {(["14kt", "18kt"] as Karat[]).map((karat) => {
        const price = preview.find((item) => item.karat === karat);
        return (
          <div className="admin-karat-card" key={karat}>
            <b>{karat} calculated price</b>
            <small>Rate per gram: {currency(price?.goldRate || 0)}</small>
            <small>Gold Value: {currency(price?.goldValue || 0)}</small>
            <small>Making Charge: {currency(price?.makingCharge || 0)}</small>
            <small>
              Total Diamond Weight: {price?.totalDiamondWeight || 0} ct
            </small>
            <small>
              Total Diamond Value: {currency(price?.diamondValue || 0)}
            </small>
            <small>
              Certificate Charge: {currency(price?.certificateCharges || 0)}
            </small>
            <small>GST: {currency(price?.gst || 0)}</small>
            <small>Final B2C Price: {currency(price?.finalPrice || 0)}</small>
            <strong>
              Final B2B Price: {currency(price?.b2bFinalPrice || 0)}
            </strong>
          </div>
        );
      })}
    </div>
  );
}
function SilverPriceBreakup({
  isMoissanite,
  grossWeight,
  caratWeight,
  adjustment,
  rates,
  onGrossWeightChange,
  onCaratWeightChange,
  onAdjustmentChange,
  caratWeightError,
  grossWeightError,
}: {
  isMoissanite: boolean;
  grossWeight: number;
  caratWeight: number;
  adjustment: number;
  caratWeightError?: string;
  grossWeightError?: string;
  rates: { silver: number; makingRate: number; moissanite: number };
  onGrossWeightChange: (value: number) => void;
  onCaratWeightChange: (value: number) => void;
  onAdjustmentChange: (value: number) => void;
}) {
  const metalPrice = grossWeight * rates.silver,
    makingCharge = grossWeight * rates.makingRate,
    moissanitePrice = isMoissanite ? caratWeight * rates.moissanite : 0,
    subtotal = metalPrice + makingCharge + moissanitePrice,
    total = subtotal + adjustment,
    gst = total * 0.03;

  const calculated = (label: string, value: number, formula: string) => (
    <Field label={`${label} - Auto-calculated`} hint={formula}>
      <input
        className="admin-input disabled:bg-stone-100"
        disabled
        readOnly
        value={currency(value)}
      />
    </Field>
  );

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <span>02</span>
        <div>
          <h2>Silver price breakup</h2>
          <p>
            Manual entries, live B2C rates, and calculated values are shown
            separately.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            name="grossWeight"
            label="Gross Weight (g) - Manual entry"
            required
            error={grossWeightError}
            hint="Used in Metal Price and Making Charge."
          >
            <input
              data-field="grossWeight"
              className="admin-input"
              type="number"
              min="0.01"
              step="0.01"
              value={grossWeight}
              onChange={(e) => onGrossWeightChange(number(e.target.value))}
            />
          </Field>
          <Field
            label="Silver Rate / gram - Auto-fetched"
            hint="From B2C Metal Rates."
          >
            <input
              className="admin-input disabled:bg-stone-100"
              disabled
              readOnly
              value={currency(rates.silver)}
            />
          </Field>
          {calculated(
            "Metal Price",
            metalPrice,
            "Gross Weight \u00D7 Silver Rate = Metal Price",
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="max-w-md">
            {calculated(
              "Making Charge",
              makingCharge,
              "Gross Weight \u00D7 configured Silver making rate = Making Charge",
            )}
          </div>
        </div>
        {isMoissanite && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              name="moissaniteCaratWeight"
              label="Moissanite Carat (ct) - Manual entry"
              required
              error={caratWeightError}
              hint="Enter the total Moissanite carat weight."
            >
              <input
                className="admin-input"
                type="number"
                min="0.01"
                step="0.01"
                required
                aria-invalid={Boolean(caratWeightError)}
                aria-describedby={
                  caratWeightError ? "moissaniteCaratWeight-error" : undefined
                }
                value={caratWeight || ""}
                onChange={(e) => onCaratWeightChange(number(e.target.value))}
              />
            </Field>
            <Field
              label="Moissanite Rate / ct - Auto-fetched"
              hint="From B2C Metal Rates."
            >
              <input
                className="admin-input disabled:bg-stone-100"
                disabled
                readOnly
                value={currency(rates.moissanite)}
              />
            </Field>
            {calculated(
              "Moissanite Price",
              moissanitePrice,
              "Moissanite Carat x Moissanite Rate = Moissanite Price",
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div className="max-w-md">
            {calculated(
              "Subtotal",
              subtotal,
              isMoissanite
                ? "Metal Price + Making Charge + Moissanite Price = Subtotal"
                : "Metal Price + Making Charge = Subtotal",
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="max-w-md">
            <Field
              label="Add/Less - Manual entry"
              hint="Optional adjustment; enter a positive or negative INR amount."
            >
              <input
                className="admin-input"
                type="number"
                step="0.01"
                value={adjustment}
                onChange={(e) => onAdjustmentChange(number(e.target.value))}
              />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>{calculated("Total", total, "Subtotal + Add/Less = Total")}</div>
          <div>{calculated("GST", gst, "Total \u00D7 3% = GST")}</div>
        </div>
      </div>
      <div className="admin-karat-card">
        <b>Final Silver Price</b>
        <small>Total + GST</small>
        <strong>{currency(total + gst)}</strong>
      </div>
    </section>
  );
}
function MediaCard({
  index,
  image,
  uploading,
  onUpload,
  onUrl,
  onRemove,
}: {
  index: number;
  image?: Image;
  uploading: boolean;
  onUpload: (file: File) => void;
  onUrl: (url: string) => void;
  onRemove: () => void;
}) {
  const fileChange = (e: ChangeEvent<HTMLInputElement>) =>
    e.target.files?.[0] && onUpload(e.target.files[0]);
  const drop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };
  return (
    <article className="admin-media-card">
      <div className="admin-media-preview">
        {image ? (
          <img src={image.url} alt={`Product image ${index + 1}`} />
        ) : (
          <span>
            Image {index + 1}
            {index === 0 ? "  - Primary" : ""}
          </span>
        )}
      </div>
      <div className="admin-media-body">
        <b>
          Image {index + 1}
          {index === 0 ? " (Primary)" : ""}
        </b>
        <label
          className="admin-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={drop}
        >
          <input type="file" accept="image/*" onChange={fileChange} />
          {uploading ? "Uploading image..." : "Upload or drop an image"}
        </label>
        <div className="admin-media-or">or paste an external URL</div>
        <input
          className="admin-input"
          value={image?.source === "link" ? image.url : ""}
          onChange={(e) => onUrl(e.target.value)}
          placeholder="https://"
        />
        {image && (
          <button
            type="button"
            className="admin-text-button danger"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
    </article>
  );
}

function CertificateMultiSelect({
  options,
  selectedIds,
  onChange,
}: {
  options: CertificateOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  if (!options.length)
    return (
      <p className="text-sm text-stone-500">
        No certificate options are configured in code.
      </p>
    );
  return (
    <details className="relative">
      <summary className="admin-input cursor-pointer">
        {selectedIds.length
          ? `${selectedIds.length} certificate${selectedIds.length === 1 ? "" : "s"} selected`
          : "Select certificates"}
      </summary>
      <div className="absolute z-20 mt-1 w-full space-y-2 rounded border border-stone-200 bg-white p-3 shadow-lg">
        {options.map((certificate) => (
          <label
            key={certificate._id}
            className="flex cursor-pointer items-center gap-2 text-sm text-stone-800"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(certificate._id)}
              onChange={() => toggle(certificate._id)}
            />
            {certificate.name}
          </label>
        ))}
      </div>
    </details>
  );
}
export default function Products() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Product[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [diamondCategories, setDiamondCategories] = useState<DiamondCategory[]>([]),
    [diamondClarities, setDiamondClarities] = useState<DiamondClarity[]>([]),
    [certificateOptions, setCertificateOptions] = useState<CertificateOption[]>(
      [],
    );
  const [universalCertificatePrice, setUniversalCertificatePrice] = useState(0),
    [diamondSubcategories, setDiamondSubcategories] =
      useState<string[]>(STONE_SUB_TYPES);
  const [b2cMetalRates, setB2cMetalRates] = useState({
    silver: 0,
    silverMoissaniteMakingRate: 0,
    silverPolkiMakingRate: 0,
    moissaniteRatePerCarat: 0,
  });
  const [silverAdjustment, setSilverAdjustment] = useState(0);
  const [form, setForm] = useState<ProductForm>(blank()),
    [editing, setEditing] = useState<Product | null>(null),
    [preview, setPreview] = useState<PriceBreakdown[]>([]);
  const [refreshingCad, setRefreshingCad] = useState(false);
  const [creating, setCreating] = useState(false),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState<number | null>(null),
    [errors, setErrors] = useState<FormErrors>({}),
    [submitted, setSubmitted] = useState(false),
    [newDiamondSubType, setNewDiamondSubType] = useState(""),
    [newDiamondClarity, setNewDiamondClarity] = useState("");
  const firstInvalidRef = useRef<HTMLElement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [goldImportRows, setGoldImportRows] = useState<GoldImportRow[]>([]);
  const [importingGold, setImportingGold] = useState(false);
  const goldImportInputRef = useRef<HTMLInputElement | null>(null);
  const downloadCurrentGoldTemplate = () => {
    const root = categories.find((category) => !category.parent && category.name.trim().toLowerCase() === "gold");
    const subCategory = root && categories.find((category) => categoryId(category.parent) === root._id);
    if (!subCategory) {
      showToast("Create a Gold subcategory first, then download the import template.", "error");
      return;
    }
    downloadGoldImportTemplate({
      ...GOLD_IMPORT_SAMPLE,
      Subcategory: subCategory.name,
      Certificates: "",
      "Total Number of Diamonds": 0,
      "Certificate Weight (g)": "",
      Colors: "Yellow Gold",
      "Image URL 2": "",
      "Image URL 3": "",
      "Diamond 1 Category": "",
      "Diamond 1 Size": "",
      "Diamond 1 Sub Type": "",
      "Diamond 1 Colour / Clarity": "",
      "Diamond 1 Carat Weight": "",
      "Diamond 1 Rate per Ct (B2B)": "",
      "Diamond 1 Rate per Ct (B2C)": "",
    });
  };
  const previewGoldImport = async (file: File) => {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    if (!workbook.SheetNames.length) {
      showToast("The workbook does not contain a sheet.", "error");
      return;
    }
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[workbook.SheetNames[0]], { defval: "" },
    );
    const goldRoot = categories.find((category) => !category.parent && category.name.trim().toLowerCase() === "gold");
    const cell = (row: Record<string, unknown>, name: string) => String(row[name] ?? "").trim();
    const boolean = (raw: string, label: string, errors: string[]) => {
      if (!raw) return false;
      const value = raw.toLowerCase();
      if (["yes", "true", "1"].includes(value)) return true;
      if (["no", "false", "0"].includes(value)) return false;
      errors.push(`${label} must be Yes/No, True/False, or 1/0.`);
      return false;
    };
    const exact = (values: string[], raw: string) => values.find((item) => item.toLowerCase() === raw.toLowerCase());
    setGoldImportRows(rows.map((row, index) => {
      const errors: string[] = [];
      const title = cell(row, "Product Title");
      const subCategoryName = cell(row, "Subcategory");
      const gross14Raw = cell(row, "14KT Gross Weight (g)");
      const gross18Raw = cell(row, "18KT Gross Weight (g)");
      const gross14 = Number(gross14Raw), gross18 = Number(gross18Raw);
      const totalRaw = cell(row, "Total Number of Diamonds");
      const totalNumberOfDiamonds = Number(totalRaw);
      const certificateWeightRaw = cell(row, "Certificate Weight (g)");
      const certificateWeight = Number(certificateWeightRaw);
      if (!title) errors.push("Product Title is required.");
      if (!goldRoot) errors.push("Gold root category is not configured.");
      const subCategory = goldRoot && categories.find((category) => categoryId(category.parent) === goldRoot._id && category.name.toLowerCase() === subCategoryName.toLowerCase());
      if (!subCategoryName) errors.push("Subcategory is required.");
      else if (!subCategory) errors.push(`Gold subcategory '${subCategoryName}' was not found.`);
      if (!(gross14Raw && Number.isFinite(gross14) && gross14 > 0)) errors.push("14KT Gross Weight (g) must be greater than 0.");
      if (!(gross18Raw && Number.isFinite(gross18) && gross18 > 0)) errors.push("18KT Gross Weight (g) must be greater than 0.");
      if (!(totalRaw && Number.isInteger(totalNumberOfDiamonds) && totalNumberOfDiamonds >= 0)) errors.push("Total Number of Diamonds must be a whole number of 0 or more.");
      if (certificateWeightRaw && !(Number.isFinite(certificateWeight) && certificateWeight >= 0)) errors.push("Certificate Weight (g) must be 0 or more.");
      const certificates = cell(row, "Certificates").split("|").map((value) => value.trim()).filter(Boolean).map((name) => {
        const found = certificateOptions.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (!found) errors.push(`Certificate '${name}' was not found.`);
        return found?._id || "";
      }).filter(Boolean);
      const sizesRaw = cell(row, "Sizes");
      const sizes = sizesRaw ? sizesRaw.split(",").map((value) => Number(value.trim())) : [];
      if (sizesRaw && sizes.some((size) => !Number.isInteger(size) || size < 5 || size > 25)) errors.push("Sizes must be comma-separated whole numbers from 5 to 25.");
      const colors = cell(row, "Colors").split(",").map((value) => value.trim()).filter(Boolean).map((color) => exact([YELLOW, "White Gold", "Rose Gold"], color));
      if (!colors.length) errors.push("Colors must include at least one allowed Gold color.");
      if (colors.some((color) => !color)) errors.push("Colors only allow Yellow Gold, White Gold, or Rose Gold.");
      const images = Array.from({ length: 6 }, (_, imageIndex) => cell(row, `Image URL ${imageIndex + 1}`)).map((url, imageIndex) => url ? { url, source: "link" as const, slot: imageIndex + 1 } : undefined).filter(Boolean) as Image[];
      if (!images.length) errors.push("At least one Image URL is required.");
      images.forEach((image) => {
        try { new URL(image.url); } catch { errors.push(`Image URL ${image.slot} must be a valid URL.`); }
        const requiredColor = colorForSlot({ metal: "gold" }, image.slot || 1);
        if (requiredColor && !colors.includes(requiredColor)) errors.push(`Image URL ${image.slot} requires ${requiredColor} in Colors.`);
      });
      const videoLink = cell(row, "Video Link");
      if (videoLink) try { new URL(videoLink); } catch { errors.push("Video Link must be a valid URL."); }
      const isBestSeller = boolean(cell(row, "Best Seller"), "Best Seller", errors);
      const isNewProduct = boolean(cell(row, "New Arrival"), "New Arrival", errors);
      const isPrimeCollection = boolean(cell(row, "Prime Collection"), "Prime Collection", errors);
      const publish = boolean(cell(row, "Publish Product"), "Publish Product", errors);
      const productDiscountTypeRaw = cell(row, "Product Discount Type").toLowerCase();
      const productDiscountType = productDiscountTypeRaw === "" ? null : productDiscountTypeRaw as "percentage" | "flat";
      const discountRaw = cell(row, "Product Discount Value");
      const productDiscountValue = Number(discountRaw || 0);
      if (productDiscountType && !["percentage", "flat"].includes(productDiscountType)) errors.push("Product Discount Type must be percentage or flat.");
      if (productDiscountType && !(Number.isFinite(productDiscountValue) && productDiscountValue > 0)) errors.push("Product Discount Value must be greater than 0 when a discount type is set.");
      if (!productDiscountType && discountRaw && productDiscountValue !== 0) errors.push("Product Discount Type is required when a discount value is provided.");
      if (productDiscountType === "percentage" && productDiscountValue > 100) errors.push("Percentage discount cannot exceed 100.");
      const diamonds: DiamondEntry[] = [];
      let hasDiamondFields = false;
      for (let diamondIndex = 1; diamondIndex <= 10; diamondIndex++) {
        const group = ["Category", "Size", "Sub Type", "Colour / Clarity", "Carat Weight", "Rate per Ct (B2B)", "Rate per Ct (B2C)"]
          .map((field) => cell(row, `Diamond ${diamondIndex} ${field}`));
        if (!group.some(Boolean)) continue;
        hasDiamondFields = true;
        const [categoryName, size, subType, colorClarity, caratRaw, b2bRaw, b2cRaw] = group;
        if (!categoryName || !subType || !colorClarity || !caratRaw || !b2bRaw || !b2cRaw) {
          errors.push(`Diamond ${diamondIndex} requires Category, Sub Type, Colour / Clarity, Carat Weight, B2B rate, and B2C rate.`);
          continue;
        }
        const categoryMatches = diamondCategories.filter((item) => item.categoryName.toLowerCase() === categoryName.toLowerCase());
        const diamondMaster = categoryMatches.find((item) => item.size.toLowerCase() === size.toLowerCase()) || (categoryMatches.length === 1 && !size ? categoryMatches[0] : undefined);
        if (!diamondMaster) errors.push(`Diamond ${diamondIndex} Category/Size does not match existing diamond master data.`);
        if (!diamondSubcategories.some((item) => item.toLowerCase() === subType.toLowerCase())) errors.push(`Diamond ${diamondIndex} Sub Type '${subType}' was not found.`);
        if (!diamondClarities.some((item) => item.name.toLowerCase() === colorClarity.toLowerCase())) errors.push(`Diamond ${diamondIndex} Colour / Clarity '${colorClarity}' was not found.`);
        const caratWeight = Number(caratRaw), ratePerCtB2B = Number(b2bRaw), ratePerCtB2C = Number(b2cRaw);
        if (!(Number.isFinite(caratWeight) && caratWeight >= 0)) errors.push(`Diamond ${diamondIndex} Carat Weight must be 0 or more.`);
        if (!(Number.isFinite(ratePerCtB2B) && ratePerCtB2B >= 0)) errors.push(`Diamond ${diamondIndex} Rate per Ct (B2B) must be 0 or more.`);
        if (!(Number.isFinite(ratePerCtB2C) && ratePerCtB2C >= 0)) errors.push(`Diamond ${diamondIndex} Rate per Ct (B2C) must be 0 or more.`);
        if (diamondMaster) diamonds.push({ diamondCategoryRef: diamondMaster._id, category: diamondMaster.categoryName, subType, colorClarity, caratWeight, ratePerCtB2B, ratePerCtB2C });
      }
      if (totalNumberOfDiamonds === 0 && hasDiamondFields) errors.push("All Diamond groups must be blank when Total Number of Diamonds is 0.");
      const diamondWeight = diamonds.reduce((sum, diamond) => sum + Number(diamond.caratWeight || 0), 0) / 5;
      if (gross14Raw && gross14 < diamondWeight) errors.push("14KT Gross Weight cannot be less than total diamond weight.");
      if (gross18Raw && gross18 < diamondWeight) errors.push("18KT Gross Weight cannot be less than total diamond weight.");
      const fieldResults = GOLD_IMPORT_HEADERS.map((header) => {
        const value = cell(row, header);
        const simplified = header.toLowerCase().replace(/\s*\([^)]*\)/g, "");
        const message = errors.find((item) => {
          const issue = item.toLowerCase();
          if (/^diamond \d+/.test(header)) return issue.includes(header.match(/^diamond \d+/i)?.[0]?.toLowerCase() || "");
          if (header.startsWith("Image URL")) return issue.includes("image url") || issue.includes("at least one image");
          if (header === "Colors") return issue.includes("colors") || issue.includes("color");
          if (header === "Certificates") return issue.includes("certificate '");
          return issue.includes(simplified);
        });
        return { header, valid: !message, message };
      });
      return {
        row: index + 2, title, subCategory: subCategoryName, gross14, gross18, publish, fieldResults,
        payload: subCategory && goldRoot ? {
          SKU: cell(row, "SKU"), title, description: cell(row, "Description"), metal: "gold",
          mainCategory: goldRoot._id, subCategory: subCategory._id, images, videoLink, sizes,
          colors: colors.filter((color): color is string => Boolean(color)), certificates: certificates as unknown as Product["certificates"],
          grossWeight: { "14kt": gross14, "18kt": gross18 }, diamonds, totalNumberOfDiamonds,
          certificateWeight: certificateWeightRaw ? certificateWeight : undefined,
          isBestSeller, isNewProduct, isPrimeCollection, isActive: publish,
          productDiscountType, productDiscountValue: productDiscountType ? productDiscountValue : 0,
        } : undefined,
        error: errors.length ? errors.join(" ") : undefined,
      };
    }));
  };
  const confirmGoldImport = async () => {
    const valid = goldImportRows.filter((row) => !row.error && row.payload);
    if (!valid.length) return showToast("No valid Gold rows to import.", "error");
    setImportingGold(true);
    let created = 0;
    const failures: GoldImportRow[] = [];
    for (const row of valid) {
      try { await adminApi.createProduct(row.payload!); created++; }
      catch (error) { failures.push({ ...row, error: error instanceof Error ? error.message : "Could not import this row." }); }
    }
    setGoldImportRows(failures);
    setImportingGold(false);
    await load();
    showToast(`${created} Gold product${created === 1 ? "" : "s"} imported.`, created ? "success" : "error");
  };  const filteredItems = useMemo(
    () =>
      !categoryFilter
        ? items
        : items.filter(
            (product) =>
              categoryId(product.mainCategory) === categoryFilter ||
              categoryId(product.subCategory) === categoryFilter,
          ),
    [items, categoryFilter],
  );
  const categoryFilterOptions = useMemo(() => {
    const usedCategories = new Map<string, string>();
    items.forEach((product) => {
      const selectedCategory =
        categoryId(product.subCategory) || categoryId(product.mainCategory);
      const selectedCategoryLabel =
        categoryName(product.subCategory) !== "Uncategorised"
          ? categoryName(product.subCategory)
          : categoryName(product.mainCategory);
      if (selectedCategory && selectedCategoryLabel !== "Uncategorised")
        usedCategories.set(selectedCategory, selectedCategoryLabel);
    });
    return Array.from(usedCategories, ([id, name]) => ({ id, name })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );
  }, [items]);
  const load = useCallback(async () => {
    const [
      products,
      categoryList,
      diamondClarityList,
      certificateList,
      savedSubcategories,
    ] = await Promise.all([
      adminApi.adminProducts(),
      adminApi.categories(),
      adminApi.diamondClarities(),
      adminApi.certificates(),
      adminApi.diamondSubcategories(),
    ]);
    let diamondCategoryList: DiamondCategory[] = [];
    try {
      diamondCategoryList = await adminApi.diamondCategories();
    } catch {
      diamondCategoryList = [];
    }
    setItems(products);
    setCategories(categoryList);
    setDiamondCategories(
      (Array.isArray(diamondCategoryList) ? diamondCategoryList : []).map(
        (row) => {
          const raw = row as DiamondCategory & {
            name?: string;
            category?: string;
            category_name?: string;
            categorySize?: string;
          };
          return {
            ...row,
            categoryName:
              raw.categoryName ||
              raw.name ||
              raw.category ||
              raw.category_name ||
              "",
            size: raw.size || raw.categorySize || "",
          };
        },
      ),
    );
    setDiamondClarities(diamondClarityList);
    setDiamondSubcategories(
      Array.from(
        new Set([
          ...STONE_SUB_TYPES,
          ...savedSubcategories.map((item) => item.name),
        ]),
      ),
    );
    setCertificateOptions(certificateList);
  }, []);
  useEffect(() => {
    void load().catch(() =>
      showToast("Could not load catalogue data.", "error"),
    );
    void apiRequest<any>("/admin/metal-rates")
      .then((response) => {
        const rates = response.b2c || response;
        setUniversalCertificatePrice(Number(rates.certificateRatePerGram || 0));
        setB2cMetalRates({
          silver: Number(rates.silver || 0),
          silverMoissaniteMakingRate: Number(
            rates.silverMoissaniteMakingRate || 0,
          ),
          silverPolkiMakingRate: Number(rates.silverPolkiMakingRate || 0),
          moissaniteRatePerCarat: Number(rates.moissaniteRatePerCarat || 0),
        });
      })
      .catch(() => setUniversalCertificatePrice(0));
  }, [load, showToast]);
  const goldRoot = useMemo(
    () =>
      categories.find(
        (c) => c.metal === "gold" && c.categoryKind === "metal-root",
      ),
    [categories],
  );
  const goldLeaves = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.metal === "gold" &&
          c.categoryKind === "subcategory" &&
          categoryId(c.parent) === goldRoot?._id,
      ),
    [categories, goldRoot],
  );
  const silverTypes = useMemo(
    () =>
      categories.filter(
        (c) => c.metal === "silver" && c.categoryKind === "type",
      ),
    [categories],
  );
  const silverLeaves = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.metal === "silver" &&
          c.categoryKind === "subcategory" &&
          categoryId(c.parent) === form.mainCategory,
      ),
    [categories, form.mainCategory],
  );
  const selectedSilverType = silverTypes
    .find((category) => category._id === form.mainCategory)
    ?.name.toLowerCase();
  const diamondCategoryNames = useMemo(
    () =>
      Array.from(
        new Set(
          diamondCategories
            .map((category) => category.categoryName)
            .filter(Boolean),
        ),
      ).sort(),
    [diamondCategories],
  );
  // The hidden Gold root is required by the API. Reconcile after category data arrives,
  // not only at the instant the metal selector changes.
  useEffect(() => {
    if (form.metal === "gold" && !form.mainCategory && goldRoot?._id) {
      setForm((current) =>
        current.metal === "gold" && !current.mainCategory
          ? { ...current, mainCategory: goldRoot._id }
          : current,
      );
    }
  }, [form.metal, form.mainCategory, goldRoot]);
  const validateProductForm = useCallback(
    (state: ProductForm): FormErrors => {
      const next: FormErrors = {};
      if (!state.title.trim()) next.title = "Product title is required.";
      if (!state.metal) next.metal = "Select a metal.";
      if (!state.mainCategory)
        next.mainCategory =
          state.metal === "silver"
            ? "Select a Silver type."
            : "Select a product category.";
      if (!state.subCategory)
        next.subCategory =
          state.metal === "gold"
            ? "Select a Gold subcategory."
            : "Select a Silver subcategory.";
      if (
        state.metal === "gold" &&
        (Number(state.goldGrossWeight["18kt"]) <= 0 ||
          Number(state.goldGrossWeight["14kt"]) <= 0)
      )
        next.grossWeight =
          "Enter a gross weight greater than 0 g for both 18kt and 14kt.";
      if (state.metal === "silver" && Number(state.grossWeight) <= 0)
        next.grossWeight = "Enter a gross weight greater than 0 g.";
      // TEMPORARY FLOW - silver only: price is entered manually and used before GST.
      if (
        state.metal === "silver" &&
        (!Number.isFinite(Number(state.price)) || Number(state.price) < 0)
      )
        next.price = "Price must be a non-negative number.";
      const selectedSilverType =
        categories
          .find((category) => category._id === state.mainCategory)
          ?.name.toLowerCase() || "";
      if (
        state.metal === "silver" &&
        /moissanite|mossanite/.test(selectedSilverType) &&
        Number(state.moissaniteCaratWeight) <= 0
      )
        next.moissaniteCaratWeight = "Moissanite carat weight is required.";
      const variantProduct = {
        metal: state.metal as "gold" | "silver",
        mainCategory: categories.find(
          (category) => category._id === state.mainCategory,
        ),
      };
      const config = variantConfig(variantProduct);
      const images = normalizeVariantImages(state.images);
      if (!state.colors.length)
        next.colors = "Select at least one allowed color.";
      else if (state.colors.some((color) => !config.colors.includes(color)))
        next.colors = "Selected color is not allowed for this category.";
      else {
        const unselectedColor = images
          .map((image) => colorForSlot(variantProduct, image.slot || 0))
          .find((color) => color && !state.colors.includes(color));
        if (unselectedColor)
          next.images = `Select ${shortColor(unselectedColor)} color or remove its images.`;
      }
      if (!images.length) next.images = "Add at least one product image.";
      if (
        !Number.isFinite(Number(state.totalNumberOfDiamonds)) ||
        Number(state.totalNumberOfDiamonds) < 0
      )
        next.totalNumberOfDiamonds = "Total Number of Diamonds is required.";
      if (
        state.diamonds.some(
          (diamond) =>
            !Number.isFinite(Number(diamond.ratePerCtB2B)) ||
            Number(diamond.ratePerCtB2B) < 0 ||
            !Number.isFinite(Number(diamond.ratePerCtB2C)) ||
            Number(diamond.ratePerCtB2C) < 0,
        )
      )
        next.diamonds = "Each diamond requires B2B and B2C rates.";
      return next;
    },
    [categories],
  );
  useEffect(() => {
    if (submitted) setErrors(validateProductForm(form));
  }, [form, submitted, validateProductForm]);
  useEffect(() => {
    if (!firstInvalidRef.current) return;
    firstInvalidRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    firstInvalidRef.current.focus({ preventScroll: true });
    firstInvalidRef.current = null;
  }, [errors]);
  const fieldProps = (field: FormField) => ({
    "data-field": field,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    onBlur: () => submitted && setErrors(validateProductForm(form)),
  });
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const isPolkiSelection =
    form.metal === "silver" &&
    /polki/i.test(
      categories.find((category) => category._id === form.mainCategory)?.name ||
        "",
    );
  useEffect(() => {
    if (
      isPolkiSelection &&
      (form.colors.length !== 1 || form.colors[0] !== YELLOW)
    )
      set("colors", [YELLOW]);
  }, [isPolkiSelection, form.colors]);
  const setMetal = (metal: "gold" | "silver" | "diamond") =>
    setForm((p) => ({
      ...p,
      metal,
      mainCategory: metal === "gold" ? goldRoot?._id || "" : "",
      subCategory: "",
      grossWeight: 0,
      netWeight: 0,
      goldGrossWeight: { "18kt": 0, "14kt": 0 },
      moissaniteCaratWeight: 0,
      moissaniteEntries: [],
      price: 0,
    }));
  const updateImage = (index: number, image?: Image) =>
    setForm((p) => ({
      ...p,
      images: [
        ...p.images.filter(
          (entry, entryIndex) =>
            (Number(entry.slot) || entryIndex + 1) !== index + 1,
        ),
        ...(image ? [{ ...image, slot: index + 1 }] : []),
      ].sort((left, right) => Number(left.slot) - Number(right.slot)),
    }));
  const uploadImage = async (index: number, file: File) => {
    try {
      setUploading(index);
      const result = await adminApi.uploadImage(file);
      updateImage(index, {
        url: result.url,
        source: "upload",
        slot: index + 1,
      });
    } catch {
      showToast("Image upload failed. Please try again.", "error");
    } finally {
      setUploading(null);
    }
  };
  const updateMoissanite = (index: number, patch: Partial<MoissaniteEntry>) =>
    set(
      "moissaniteEntries",
      form.moissaniteEntries.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      ),
    );
  const addMoissanite = () =>
    set("moissaniteEntries", [...form.moissaniteEntries, { caratWeight: 0 }]);
  const updateDiamond = (index: number, patch: Partial<DiamondEntry>) =>
    set(
      "diamonds",
      form.diamonds.map((diamond, i) =>
        i === index ? { ...diamond, ...patch } : diamond,
      ),
    );
  const saveDiamondSubcategory = async () => {
    const name = newDiamondSubType.trim();
    if (!name) return showToast("Enter a diamond subcategory name.", "error");
    try {
      await adminApi.saveDiamondSubcategory(name);
      setNewDiamondSubType("");
      await load();
      showToast("Diamond subcategory saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Diamond subcategory could not be saved.",
        "error",
      );
    }
  };
  const saveDiamondClarityOption = async () => {
    const name = newDiamondClarity.trim();
    if (!name) return showToast("Enter a diamond clarity value.", "error");
    try {
      await adminApi.saveDiamondClarity(name);
      setNewDiamondClarity("");
      await load();
      showToast("Diamond clarity option saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Diamond clarity option could not be saved.",
        "error",
      );
    }
  };
  const addDiamond = () => {
    set("diamonds", [
      ...form.diamonds,
      {
        category: "",
        subType: STONE_SUB_TYPES[0],
        caratWeight: 0,
        ratePerCt: 0,
        ratePerCtB2B: 0,
        ratePerCtB2C: 0,
        colorClarity: diamondClarities[0]?.name || "EF/VVSVS",
      },
    ]);
  };

  const diamondTotals = useMemo(
    () =>
      form.diamonds.reduce(
        (totals, diamond) => ({
          weight: totals.weight + Number(diamond.caratWeight || 0),
          value:
            totals.value +
            Number(diamond.caratWeight || 0) *
              Number(diamond.ratePerCtB2C ?? diamond.ratePerCt ?? 0),
        }),
        { weight: 0, value: 0 },
      ),
    [form.diamonds],
  );
  const diamondWeightGrams = diamondTotals.weight / 5;
  const netGoldWeight = (karat: Karat) =>
    form.goldGrossWeight[karat] - diamondWeightGrams;
  const payload = (): Partial<Product> => {
    const { goldGrossWeight, certificateWeight, ...productForm } = form;
    const certificateFields =
      form.metal === "gold" && certificateWeight !== ""
        ? { certificateWeight: Number(certificateWeight) }
        : {};
    return {
      ...productForm,
      productDiscountType: form.productDiscountType || null,
      productDiscountValue: form.productDiscountType ? form.productDiscountValue : 0,
      price: form.metal === "silver" ? silverTotal : form.price,
      ...certificateFields,
      certificates: form.certificates as unknown as Product["certificates"],
      metal: form.metal as "gold" | "silver",
      grossWeight:
        form.metal === "gold" ? goldGrossWeight : Number(form.grossWeight),
      netWeight:
        form.metal === "gold"
          ? { "18kt": netGoldWeight("18kt"), "14kt": netGoldWeight("14kt") }
          : undefined,
      moissaniteCaratWeight:
        form.metal === "silver" ? form.moissaniteCaratWeight : undefined,
      moissaniteEntries:
        form.metal === "silver" ? form.moissaniteEntries : undefined,
    };
  };
  useEffect(() => {
    if (!form.metal || !form.mainCategory || !form.subCategory) {
      setPreview([]);
      return;
    }
    const refreshPreview = () => {
      void adminApi
        .previewPrice(payload())
        .then(setPreview)
        .catch(() => setPreview([]));
    };
    const timer = window.setTimeout(refreshPreview, 400);
    const settingsRefresh = window.setInterval(refreshPreview, 5000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(settingsRefresh);
    };
  }, [form]);
  const refreshCadStatus = useCallback(async () => {
    const productId = editing?.id || editing?._id;
    if (!productId) return;
    try {
      setRefreshingCad(true);
      const latest = await adminApi.adminGetProduct(productId);
      setEditing((current) =>
        current && (current.id || current._id) === productId
          ? { ...current, ...latest }
          : current,
      );
    } catch {
      showToast("Could not refresh CAD status. Please try again.", "error");
    } finally {
      setRefreshingCad(false);
    }
  }, [editing, showToast]);
  useEffect(() => {
    if (!editing) return;
    const handleReturn = () => {
      if (document.visibilityState === "visible") void refreshCadStatus();
    };
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleReturn);
    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, [editing?.id, editing?._id, refreshCadStatus]);
  const openCreate = () => {
    setEditing(null);
    setForm(blank());
    setPreview([]);
    setErrors({});
    setSubmitted(false);
    setCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openEdit = (product: Product) => {
    const metal = product.metal || "gold";
    setEditing(product);
    setForm({
      ...blank(),
      ...product,
      metal,
      mainCategory: categoryId(product.mainCategory),
      subCategory: categoryId(product.subCategory),
      images: normalizeVariantImages(product.images),
      sizes: STANDARD_RING_SIZES,
      colors: product.colors?.length
        ? product.colors
        : variantConfig({ metal, mainCategory: product.mainCategory }).colors,
      grossWeight:
        typeof product.grossWeight === "number" ? product.grossWeight : 0,
      netWeight: typeof product.netWeight === "number" ? product.netWeight : 0,
      goldGrossWeight: goldWeights(product.grossWeight),
      moissaniteEntries:
        product.moissaniteEntries ||
        (product.moissaniteCaratWeight !== undefined
          ? [{ caratWeight: product.moissaniteCaratWeight }]
          : []),
      diamonds: (product.diamonds || []).map((diamond) => ({
        ...diamond,
        ratePerCtB2B: diamond.ratePerCtB2B ?? diamond.ratePerCt,
        ratePerCtB2C: diamond.ratePerCtB2C ?? diamond.ratePerCt,
      })),
      certificateWeight: String(product.certificateWeight ?? ""),
      certificates: (product.certificates || []).map((certificate) =>
        typeof certificate === "string" ? certificate : certificate._id,
      ),
    });
    setErrors({});
    setSubmitted(false);
    setCreating(true);
  };
  const save = async (e: FormEvent, publish: boolean) => {
    e.preventDefault();
    if (saving) return;
    setSubmitted(true);
    const fieldErrors = validateProductForm(form);
    setErrors(fieldErrors);
    if (uploading !== null) {
      showToast("Wait for the image upload to finish before saving.", "info");
      return;
    }
    if (Object.keys(fieldErrors).length) {
      firstInvalidRef.current = document.querySelector<HTMLElement>(
        `[data-field="${Object.keys(fieldErrors)[0]}"]`,
      );
      showToast(
        `Please complete ${Object.keys(fieldErrors).length} required field${Object.keys(fieldErrors).length === 1 ? "" : "s"}.`,
        "error",
      );
      return;
    }
    try {
      setSaving(true);
      const data = { ...payload(), isActive: publish };
      const savedProduct = editing
        ? await adminApi.updateProduct(editing.id || editing._id || "", data)
        : await adminApi.createProduct(data);
      showToast(
        `Product ${editing ? "updated" : "created"} successfully.`,
        "success",
      );
      openEdit(savedProduct);
      setErrors({});
      setSubmitted(false);
      await load();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Product could not be saved.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  if (!creating)
    return (
      <div className="admin-products">
        <header className="admin-page-heading">
          <div>
            <p>Catalogue management</p>
            <h1>Products</h1>
            <span>
              Product prices are derived automatically from their metal and
              category.
            </span>
          </div>
          <div className="flex gap-3">
            <button
              className="admin-secondary"
              onClick={() => exportProducts(filteredItems)}
            >
              Export Excel
            </button>
          <input ref={goldImportInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void previewGoldImport(file); event.currentTarget.value = ""; }} />
          <button className="admin-secondary" onClick={downloadCurrentGoldTemplate}>
            Download Gold Import Template
          </button>
          <button className="admin-secondary" onClick={() => goldImportInputRef.current?.click()}>
            Import Gold Excel
          </button>            <button className="admin-primary" onClick={openCreate}>
              + Add product
            </button>
          </div>
        </header>
        {goldImportRows.length > 0 && (
          <section className="admin-section mb-5">
            <h2>Gold import preview</h2>
            <p>Nothing has been saved yet. Confirming imports only valid rows; Publish Product controls Draft or Published status.</p>
            <div className="admin-table-wrap mt-3"><table className="admin-table"><thead><tr><th>Row</th><th>Product</th><th>Subcategory</th><th>14KT / 18KT</th><th>Field validation</th></tr></thead><tbody>{goldImportRows.map((row) => <tr key={row.row}><td>{row.row}</td><td>{row.title || "—"}</td><td>{row.subCategory || "—"}</td><td>{row.gross14 || "—"} / {row.gross18 || "—"} g</td><td>{row.error ? <><span className="text-red-700">{row.error}</span><details className="mt-2"><summary>Show field-by-field result</summary><ul className="mt-2 list-disc pl-5 text-xs">{row.fieldResults.filter((field) => field.message || field.header === "Product Title" || field.header === "Subcategory" || field.header.includes("Gross Weight") || field.header === "Total Number of Diamonds" || field.header === "Colors" || field.header.startsWith("Image URL")).map((field) => <li key={field.header} className={field.valid ? "text-green-700" : "text-red-700"}>{field.valid ? "?" : "?"} {field.header}{field.message ? `: ${field.message}` : ""}</li>)}</ul></details></> : <span className="text-green-700">Valid — all supplied fields passed — {row.publish ? "Published" : "Draft"}</span>}</td></tr>)}</tbody></table></div>
            <div className="mt-3 flex gap-3"><button className="admin-primary" disabled={importingGold || !goldImportRows.some((row) => !row.error)} onClick={() => void confirmGoldImport()}>{importingGold ? "Importing..." : "Confirm Gold Import"}</button><button className="admin-secondary" disabled={importingGold} onClick={() => setGoldImportRows([])}>Cancel</button></div>
          </section>
        )}        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
            Category
            <select
              className="admin-input min-w-52"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter products by category"
            >
              <option value="">All categories</option>
              {categoryFilterOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-[var(--color-text-muted)]">
            {filteredItems.length} product
            {filteredItems.length === 1 ? "" : "s"}
          </span>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="admin-error-summary" role="alert">
            Please complete {Object.keys(errors).length} required field
            {Object.keys(errors).length === 1 ? "" : "s"}.
          </div>
        )}
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((product) => (
                <tr key={product.id || product._id}>
                  <td className="admin-product-cell">
                    <img
                      src={product.images?.[0]?.url}
                      loading="lazy"
                      decoding="async"
                      alt=""
                    />
                    <span>
                      <b>{product.title}</b>
                      <small>{product.SKU}</small>
                    </span>
                  </td>
                  <td>
                    {categoryName(product.mainCategory)}
                    <small>{categoryName(product.subCategory)}</small>
                  </td>
                  <td>{currency(product.prices?.[0]?.finalPrice || 0)}</td>
                  <td>
                    <span
                      className={`admin-status ${product.isActive ? "live" : "draft"}`}
                    >
                      {product.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-text-button"
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-text-button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Permanently delete ${product.title || product.SKU}?`,
                          )
                        )
                          void adminApi
                            .deleteProduct(product.id || product._id || "")
                            .then(() => {
                              setItems((current) =>
                                current.filter(
                                  (item) =>
                                    (item.id || item._id) !==
                                    (product.id || product._id),
                                ),
                              );
                              showToast(
                                "Product deleted permanently.",
                                "success",
                              );
                            })
                            .catch((error) =>
                              showToast(
                                error instanceof Error
                                  ? error.message
                                  : "Product could not be deleted.",
                                "error",
                              ),
                            );
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-[var(--color-text-muted)]"
                  >
                    No products found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    );
  const isMoissanite =
    form.metal === "silver" &&
    /moissanite|mossanite/.test(selectedSilverType || "");
  const isPolki =
    form.metal === "silver" && /polki/i.test(selectedSilverType || "");
  const variantProduct = {
    metal: form.metal as "gold" | "silver",
    mainCategory: categories.find(
      (category) => category._id === form.mainCategory,
    ),
  };
  const variantGroups = variantConfig(variantProduct).groups.map(
    (slots, index) => ({
      slots,
      color: variantConfig(variantProduct).colors[index],
    }),
  );
  const imageAtSlot = (slot: number) =>
    normalizeVariantImages(form.images).find((image) => image.slot === slot);

  const silverCaratWeight = form.moissaniteEntries.reduce(
    (sum, entry) => sum + Number(entry.caratWeight || 0),
    0,
  );
  const silverRates = {
    silver: b2cMetalRates.silver,
    makingRate: isMoissanite
      ? b2cMetalRates.silverMoissaniteMakingRate
      : b2cMetalRates.silverPolkiMakingRate,
    moissanite: b2cMetalRates.moissaniteRatePerCarat,
  };
  const silverTotal =
    form.grossWeight * silverRates.silver +
    form.grossWeight * silverRates.makingRate +
    (isMoissanite ? silverCaratWeight * silverRates.moissanite : 0) +
    silverAdjustment;
  return (
    <form
      onSubmit={(e) => void save(e, true)}
      onFocusCapture={(event) => {
        const input = event.target as HTMLInputElement;
        if (
          input.type === "number" &&
          !input.readOnly &&
          !input.disabled &&
          input.value === "0"
        )
          input.select();
      }}
      onWheelCapture={(event) => {
        const input = event.target as HTMLInputElement;
        if (input.type === "number") {
          event.preventDefault();
          input.blur();
        }
      }}
      className="admin-editor"
    >
      <header className="admin-page-heading">
        <div>
          <p>Catalogue management</p>
          <h1>{editing ? "Edit product" : "Create product"}</h1>
          <span>
            Fields are aligned with the Product schema and current pricing
            engines.
          </span>
        </div>
        <button
          type="button"
          className="admin-secondary"
          onClick={() => setCreating(false)}
        >
          Back to products
        </button>
      </header>
      {Object.keys(errors).length > 0 && (
        <div className="admin-error-summary" role="alert">
          Please complete {Object.keys(errors).length} required field
          {Object.keys(errors).length === 1 ? "" : "s"}.
        </div>
      )}
      <section className="admin-section">
        <div className="admin-section-heading">
          <span>01</span>
          <div>
            <h2>Identity & category</h2>
          </div>
        </div>
        <div className="admin-grid">
          <Field
            name="title"
            label="Product title"
            required
            error={errors.title}
          >
            <input
              {...fieldProps("title")}
              className="admin-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field
            name="SKU"
            label="SKU"
            hint="Generated automatically when the product is saved."
          >
            <input
              className="admin-input"
              value={form.SKU}
              placeholder="Generated automatically"
              readOnly
            />
          </Field>
          <Field name="metal" label="Metal" required error={errors.metal}>
            <select
              {...fieldProps("metal")}
              className="admin-input"
              value={form.metal}
              onChange={(e) => setMetal(e.target.value as "gold" | "silver")}
            >
              <option value="">Select metal</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </Field>
          {form.metal === "gold" && (
            <Field
              name="subCategory"
              label="Gold sub-category"
              required
              error={errors.subCategory}
            >
              <select
                {...fieldProps("subCategory")}
                className="admin-input"
                value={form.subCategory}
                onChange={(e) => set("subCategory", e.target.value)}
              >
                <option value="">Select sub-category</option>
                {goldLeaves.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {form.metal === "silver" && (
            <>
              <Field
                name="mainCategory"
                label="Silver type"
                required
                error={errors.mainCategory}
              >
                <select
                  {...fieldProps("mainCategory")}
                  className="admin-input"
                  value={form.mainCategory}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCategory: e.target.value,
                      subCategory: "",
                    }))
                  }
                >
                  <option value="">Select type</option>
                  {silverTypes.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                name="subCategory"
                label="Silver sub-category"
                required
                error={errors.subCategory}
              >
                <select
                  {...fieldProps("subCategory")}
                  className="admin-input"
                  value={form.subCategory}
                  onChange={(e) => set("subCategory", e.target.value)}
                >
                  <option value="">Select sub-category</option>
                  {silverLeaves.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          <Field label="Description">
            <textarea
              className="admin-input admin-textarea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </div>
      </section>
      <CadSection
        sku={editing?.SKU || form.SKU}
        cadFolderUrl={editing?.cadFolderUrl}
        onRefresh={() => void refreshCadStatus()}
        refreshing={refreshingCad}
        showError={(message) => showToast(message, "error")}
      />        <section className="admin-section">
          <div className="admin-section-heading"><span>Offer</span><div><h2>Product Discount</h2><p>Optional. This takes priority over category-wise coupons.</p></div></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Discount Type"><select className="admin-input" value={form.productDiscountType || ""} onChange={(e) => set("productDiscountType", e.target.value as ProductForm["productDiscountType"])}><option value="">No discount</option><option value="percentage">Percentage (%)</option><option value="flat">Flat amount (INR)</option></select></Field>
            <Field label="Discount Value"><input className="admin-input" disabled={!form.productDiscountType} type="number" min="0" step="0.01" value={form.productDiscountValue || ""} onChange={(e) => set("productDiscountValue", number(e.target.value))} /></Field>
          </div>
        </section>
      {form.metal === "gold" ? (
        <GoldWeightBlock
          karat="18kt"
          grossWeight={form.goldGrossWeight["18kt"]}
          diamondWeight={diamondWeightGrams}
          grossWeightError={errors.grossWeight}
          onGrossWeightChange={(value) =>
            set("goldGrossWeight", { ...form.goldGrossWeight, "18kt": value })
          }
        />
      ) : form.metal === "silver" ? (
        <SilverPriceBreakup
          isMoissanite={isMoissanite}
          grossWeight={form.grossWeight}
          caratWeight={silverCaratWeight}
          adjustment={silverAdjustment}
          rates={silverRates}
          onGrossWeightChange={(value) => set("grossWeight", value)}
          onCaratWeightChange={(value) => {
            set("moissaniteEntries", [{ caratWeight: value }]);
            set("moissaniteCaratWeight", value);
          }}
          onAdjustmentChange={setSilverAdjustment}
          caratWeightError={errors.moissaniteCaratWeight}
          grossWeightError={errors.grossWeight}
        />
      ) : null}
      {form.metal && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <span>03</span>
            <div>
              <h2>Diamonds</h2>
              <p>Choose a saved colour/clarity value for each diamond entry.</p>
            </div>
          </div>
          <div className="admin-grid">
            <Field
              name="totalNumberOfDiamonds"
              label="Total Number of Diamonds"
              required
              error={errors.totalNumberOfDiamonds}
            >
              <input
                {...fieldProps("totalNumberOfDiamonds")}
                className="admin-input"
                type="number"
                min="0"
                step="1"
                value={form.totalNumberOfDiamonds ?? ""}
                onChange={(e) =>
                  set(
                    "totalNumberOfDiamonds",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              />
            </Field>
          </div>
          {errors.diamonds && (
            <p className="admin-inline-error" role="alert">
              {errors.diamonds}
            </p>
          )}
          {form.diamonds.map((diamond, index) => (
            <div className="admin-grid" key={index}>
              <Field label="Category">
                <select
                  className="admin-input"
                  value={diamond.category}
                  onChange={(e) => {
                    const matches = diamondCategories.filter(
                      (item) => item.categoryName === e.target.value,
                    );
                    const row = matches.length === 1 ? matches[0] : undefined;
                    updateDiamond(index, {
                      category: e.target.value,
                      diamondCategoryRef: row?._id,
                      ratePerCtB2B: row?.b2bPrice ?? diamond.ratePerCtB2B,
                      ratePerCtB2C: row?.b2cPrice ?? diamond.ratePerCtB2C,
                    });
                  }}
                >
                  <option value="">Select category</option>
                  {diamondCategoryNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              {diamond.category && (
                <Field label="Size">
                  <select
                    className="admin-input"
                    disabled={
                      diamondCategories.filter(
                        (item) => item.categoryName === diamond.category,
                      ).length === 1
                    }
                    value={diamond.diamondCategoryRef || ""}
                    onChange={(e) => {
                      const row = diamondCategories.find(
                        (item) => item._id === e.target.value,
                      );
                      updateDiamond(index, {
                        diamondCategoryRef: row?._id,
                        ratePerCtB2B: row?.b2bPrice ?? diamond.ratePerCtB2B,
                        ratePerCtB2C: row?.b2cPrice ?? diamond.ratePerCtB2C,
                      });
                    }}
                  >
                    <option value="">Select size</option>
                    {diamondCategories
                      .filter(
                        (item) =>
                          item.categoryName === diamond.category &&
                          Boolean(item.size) &&
                          item.size !== item.categoryName &&
                          item.size !== diamond.subType,
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.size}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
              <Field label="Sub-type">
                <select
                  className="admin-input"
                  value={diamond.subType}
                  onChange={(e) =>
                    updateDiamond(index, { subType: e.target.value })
                  }
                >
                  <option value="">Select sub-type</option>
                  {diamondSubcategories.map((subType) => (
                    <option key={subType} value={subType}>
                      {subType}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Colour / clarity">
                <select
                  className="admin-input"
                  value={diamond.colorClarity}
                  onChange={(e) =>
                    updateDiamond(index, { colorClarity: e.target.value })
                  }
                >
                  <option value="">Select clarity</option>
                  {diamondClarities.map((clarity) => (
                    <option key={clarity._id} value={clarity.name}>
                      {clarity.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Carat weight">
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={diamond.caratWeight}
                  onChange={(e) =>
                    updateDiamond(index, {
                      caratWeight: number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Rate per Ct (B2B)" required>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={diamond.ratePerCtB2B ?? ""}
                  onChange={(e) =>
                    updateDiamond(index, {
                      ratePerCtB2B:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Rate per Ct (B2C)" required>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={diamond.ratePerCtB2C ?? ""}
                  onChange={(e) =>
                    updateDiamond(index, {
                      ratePerCtB2C:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <div className="admin-field">
                <span>Diamond Value (Calculated)</span>
                <b>
                  {currency(
                    Number(diamond.caratWeight || 0) *
                      Number(diamond.ratePerCtB2C ?? diamond.ratePerCt ?? 0),
                  )}
                </b>
              </div>
              <button
                type="button"
                className="admin-text-button danger"
                onClick={() =>
                  set(
                    "diamonds",
                    form.diamonds.filter((_, i) => i !== index),
                  )
                }
              >
                Remove diamond
              </button>
            </div>
          ))}
          <div className="admin-karat-card">
            <b>Diamond totals</b>
            <small>Total Diamond Weight: {diamondTotals.weight} ct</small>
            <strong>
              Total Diamond Value: {currency(diamondTotals.value)}
            </strong>
          </div>
          <div className="admin-grid">
            <Field label="New sub-type">
              <input
                className="admin-input"
                value={newDiamondSubType}
                onChange={(event) => setNewDiamondSubType(event.target.value)}
                placeholder="e.g. Oval"
              />
            </Field>
            <button
              type="button"
              className="admin-secondary"
              onClick={() => void saveDiamondSubcategory()}
            >
              Save subcategory
            </button>
            <Field label="New diamond clarity">
              <input
                className="admin-input"
                value={newDiamondClarity}
                onChange={(event) => setNewDiamondClarity(event.target.value)}
                placeholder="e.g. VS1"
              />
            </Field>
            <button
              type="button"
              className="admin-secondary"
              onClick={() => void saveDiamondClarityOption()}
            >
              Save clarity option
            </button>
          </div>
          <button
            type="button"
            className="admin-secondary"
            onClick={addDiamond}
          >
            + Add diamond
          </button>
        </section>
      )}
      <>
        {form.metal === "gold" && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <span>05</span>
              <div>
                <h2>Certificate Charge</h2>
                <p>
                  Manual weight replaces the legacy total-diamond-weight basis
                  for gold certificate charges.
                </p>
              </div>
            </div>
            <div className="admin-grid">
              <Field label="Universal Price">
                <input
                  className="admin-input"
                  readOnly
                  value={currency(universalCertificatePrice)}
                />
              </Field>
              <Field label="Weight">
                <input
                  className="admin-input"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.certificateWeight}
                  onChange={(e) => set("certificateWeight", e.target.value)}
                />
              </Field>
              <Field label="Certificate Charge (Universal Price x Weight)">
                <input
                  className="admin-input"
                  readOnly
                  value={currency(
                    universalCertificatePrice *
                      Number(form.certificateWeight || 0),
                  )}
                />
              </Field>
            </div>
          </section>
        )}
      </>
      <section className="admin-section">
        <div className="admin-section-heading">
          <span>04</span>
          <div>
            <h2>Certificates</h2>
          </div>
        </div>
        <div className="admin-grid">
          <Field
            label="Applicable certificates"
            hint="Certificate options are managed in the server code array."
          >
            <CertificateMultiSelect
              options={certificateOptions}
              selectedIds={form.certificates}
              onChange={(certificates) => set("certificates", certificates)}
            />
          </Field>
        </div>
      </section>
      {form.metal === "gold" && (
        <>
          <GoldWeightBlock
            karat="14kt"
            grossWeight={form.goldGrossWeight["14kt"]}
            diamondWeight={diamondWeightGrams}
            grossWeightError={errors.grossWeight}
            onGrossWeightChange={(value) =>
              set("goldGrossWeight", { ...form.goldGrossWeight, "14kt": value })
            }
          />
          <section className="admin-section">
            <div className="admin-section-heading">
              <span>05</span>
              <div>
                <h2>Weight & price preview</h2>
                <p>
                  Prices continue to use the connected Universal Gold and making
                  rates.
                </p>
              </div>
            </div>
            <GoldPricePreview preview={preview} />
          </section>
        </>
      )}
      <section className="admin-section">
        <div className="admin-section-heading">
          <span>{form.metal === "gold" ? "06" : "04"}</span>
          <div>
            <h2>Media & visibility</h2>
            <p>
              Use the assigned colour slots. Sizes are standardized
              customer-side from 5 to 25.
            </p>
          </div>
        </div>
        <>
          {errors.images && (
            <p className="admin-inline-error" id="images-error" role="alert">
              {errors.images}
            </p>
          )}
          {errors.colors && (
            <p className="admin-inline-error" id="colors-error" role="alert">
              {errors.colors}
            </p>
          )}
          {variantGroups.map(({ slots, color }) => (
            <div key={color} className="mt-4">
              <b className="text-sm text-[var(--color-teal)]">
                {shortColor(color)} Images â€” Slots {slots[0]}â€“{slots[1]}
              </b>
              <div
                className="admin-media-grid mt-2"
                data-field="images"
                tabIndex={-1}
                aria-invalid={Boolean(errors.images)}
                aria-describedby={errors.images ? "images-error" : undefined}
              >
                {slots.map((slot) => {
                  const index = slot - 1;
                  return (
                    <MediaCard
                      key={slot}
                      index={index}
                      image={imageAtSlot(slot)}
                      uploading={uploading === index}
                      onUpload={(file) => void uploadImage(index, file)}
                      onUrl={(url) =>
                        updateImage(
                          index,
                          url ? { url, source: "link", slot } : undefined,
                        )
                      }
                      onRemove={() => updateImage(index, undefined)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </>
        <Field label="External video URL">
          <input
            className="admin-input"
            type="url"
            value={form.videoLink}
            onChange={(e) => set("videoLink", e.target.value)}
          />
        </Field>
        <div className="admin-colours" data-field="colors" tabIndex={-1}>
          <b>
            Available metal colours{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </b>
          <small className="block text-[var(--color-text-muted)]">
            Select at least one colour before saving.
          </small>
          <div>
            {isPolki ? (
              <label className="admin-colour-option selected">
                <input type="checkbox" checked readOnly disabled />
                {shortColor(YELLOW)}
              </label>
            ) : (
              variantGroups.map(({ color }) => (
                <label
                  key={color}
                  className={`admin-colour-option ${form.colors.includes(color) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={form.colors.includes(color)}
                    onChange={(e) =>
                      set(
                        "colors",
                        e.target.checked
                          ? [...form.colors, color]
                          : form.colors.filter((item) => item !== color),
                      )
                    }
                  />
                  {shortColor(color)}
                </label>
              ))
            )}
          </div>
        </div>
        <div className="admin-toggle-grid">
          <Toggle
            label="Product visibility"
            checked={form.isActive}
            onChange={(value) => set("isActive", value)}
          />
          <Toggle
            label="Best seller"
            checked={form.isBestSeller}
            onChange={(value) => set("isBestSeller", value)}
          />
          <Toggle
            label="New arrival"
            checked={form.isNewProduct}
            onChange={(value) => set("isNewProduct", value)}
          />
          <Toggle
            label="Show in Prime Collection"
            checked={form.isPrimeCollection}
            onChange={(value) => set("isPrimeCollection", value)}
          />
        </div>
      </section>
      <footer className="admin-action-bar">
        <button
          type="button"
          className="admin-secondary"
          onClick={() => setCreating(false)}
        >
          Cancel
        </button>
        <span />
        <button
          type="button"
          className="admin-secondary"
          disabled={saving || uploading !== null}
          onClick={(e) => void save(e as unknown as FormEvent, false)}
        >
          Save draft
        </button>
        <button
          type="submit"
          className="admin-primary"
          disabled={saving || uploading !== null}
        >
          {saving ? "Saving..." : "Publish product"}
        </button>
      </footer>
    </form>
  );
}
