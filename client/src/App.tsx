import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Loader from "./components/Loader";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Seo } from "./components/Seo";
import { useCategories } from "./hooks/useCategories";

import ComingSoonPage from "./pages/CommingSoon";

import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import { AuthModal } from "./pages/AuthModal";

import NotFoundPage from "./pages/404Page";

// Agar aapne Account page bana liya hai, toh use aise import karein:
// import AccountPage from "./pages/AccountPage";

const IS_COMING_SOON = false;
const AdminApp = React.lazy(() => import("./admin/AdminApp"));
const HomePage = React.lazy(() => import("./pages/HomePage"));
const ProductDetailPage = React.lazy(() => import("./pages/ProductDetails"));
const ProductsPage = React.lazy(() => import("./pages/ProductPage"));
const WishlistPage = React.lazy(() => import("./pages/Wishlist"));
const CartPage = React.lazy(() => import("./pages/Cart"));
const CheckoutPage = React.lazy(() => import("./pages/Checkout"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation"));
const OrderHistory = React.lazy(() => import("./pages/OrderHistory"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Account = React.lazy(() => import("./pages/Account"));
const B2BAccess = React.lazy(() => import("./pages/B2BAccess"));
const B2BCatalog = React.lazy(() => import("./pages/B2BCatalog"));
const B2BProductDetails = React.lazy(() => import("./pages/B2BProductDetails"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const DataDeletion = React.lazy(() => import("./pages/DataDeletion"));
const Deferred = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense
    fallback={
      <div className="min-h-screen grid place-items-center text-[var(--color-text-muted)]">
        Loading...
      </div>
    }
  >
    {children}
  </React.Suspense>
);

const MOISSANITE_FAQS = [
  { question: "What is Moissanite jewellery?", answer: "Moissanite jewellery features moissanite, a gemstone known for its strong brilliance and durability. The Brilliance Atelier’s current Moissanite collection includes silver necklace designs for weddings, celebrations and elegant occasion wear." },
  { question: "Is Moissanite a diamond?", answer: "No. Moissanite and diamond are different gemstones. They have different material and optical properties, although both are known for strong brilliance." },
  { question: "What is the difference between Moissanite and a lab-grown diamond?", answer: "A lab-grown diamond is a real diamond grown in a controlled environment and has the same crystal structure as a mined diamond. Moissanite is a different gemstone and is known for producing strong brilliance and colourful fire." },
  { question: "Is Moissanite suitable for bridal jewellery?", answer: "Moissanite is commonly chosen for bridal and occasion jewellery because of its brilliance and elegant appearance. The final choice depends on the design, setting and personal style." },
  { question: "Is Moissanite jewellery available in silver?", answer: "Yes. The Brilliance Atelier’s current Moissanite collection includes silver necklace designs." },
  { question: "How should Moissanite jewellery be cared for?", answer: "Keep Moissanite jewellery away from harsh chemicals and store it separately when not in use. For routine cleaning, use a soft cloth and follow any product-specific care guidance." },
];

const POLKI_FAQS = [
  { question: "What is Polki jewellery?", answer: "Polki jewellery is known for its traditional uncut-diamond aesthetic and heritage-inspired styling. It is commonly used in wedding, bridal and festive jewellery designs." },
  { question: "What is Silver Polki jewellery?", answer: "Silver Polki jewellery combines Polki-style design with silver-based jewellery. The Brilliance Atelier’s current Silver Polki collection includes necklace sets and selected bangles and bracelets." },
  { question: "What is the difference between Polki and Kundan?", answer: "Polki generally refers to jewellery featuring an uncut-diamond style, while Kundan refers to a traditional jewellery-setting technique. The two styles are often seen together in Indian bridal and occasion jewellery." },
  { question: "Is Polki jewellery suitable for weddings?", answer: "Yes. Polki-style jewellery is commonly chosen for weddings and festive occasions because of its traditional and statement appearance." },
  { question: "What is a Polki necklace set?", answer: "A Polki necklace set generally combines a Polki-style necklace with coordinated jewellery pieces such as matching earrings, depending on the design." },
  { question: "How should Polki jewellery be cared for?", answer: "Keep Polki jewellery dry, avoid harsh chemicals and perfumes, and store it separately to reduce scratching or surface damage. Follow any product-specific care guidance where provided." },
];
const MOISSANITE_SUPPORTING_CONTENT = {
  heading: "About Our Silver Moissanite Jewellery",
  paragraphs: [
    "Shop Moissanite Jewellery Online from The Brilliance Atelier\u2019s necklace-focused silver collection. Explore Silver Moissanite Necklace designs created for weddings, celebrations and statement occasion wear. If you are looking for a Moissanite Necklace Online, the current collection includes refined and bridal-inspired designs, including styles suited to shoppers looking for a Moissanite Bridal Necklace.",
  ],
};

const POLKI_SUPPORTING_CONTENT = {
  heading: "Explore Our Silver Polki Jewellery",
  paragraphs: [
    "The Brilliance Atelier\u2019s Silver Polki Jewellery collection includes necklace sets, chokers and selected bangles and bracelets designed for weddings, festive occasions and traditional statement styling. Explore Silver Polki necklace designs and coordinated sets with heritage-inspired detailing, while keeping the collection aligned with the products currently available on the website. Our Bridal Polki Jewellery selection includes existing necklace sets and choker-style designs created for weddings and traditional occasion styling.",
  ],
};

function RouteSeo() {
  const { pathname, search } = useLocation();
  const { data: silverCategories } = useCategories("silver");
  const pages: Array<{
    match: (path: string) => boolean;
    title: string;
    description: string;
    keywords?: string[];
    noIndex?: boolean;
    canonicalPath?: string;
    structuredData?: Record<string, unknown>;
  }> = [
    {
      match: (path) => path === "/",
      title:
        "The Brilliance Atelier | Gold, Silver & Lab Grown Diamond Jewellery",
      description:
        "Shop fine gold, silver and lab grown diamond jewellery at The Brilliance Atelier. Explore elegant rings, earrings, necklaces and custom jewellery designs.",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        name: "The Brilliance Atelier",
        url: "https://www.thebrillianceatelier.com/",
        telephone: "+918160797411",
        email: "customercare.tba@gmail.com",
        sameAs: ["https://instagram.com/tbajewels"],
      },
      keywords: [
        "The Brilliance Atelier",
        "TBA jewellery",
        "gold jewellery",
        "silver jewellery",
        "lab grown diamond jewellery",
        "diamond jewellery",
        "fine jewellery",
        "gold rings",
        "diamond rings",
        "gold necklaces",
        "gold earrings",
        "custom jewellery",
        "jewellery online India",
      ],
    },
    {
      match: (path) => path === "/products",
      title: "Gold Jewellery Collection | TBA jewellery",
      description:
        "Browse TBA's curated gold jewellery collection, including rings, earrings, necklaces and bracelets.",
    },
    {
      match: (path) => path === "/gold-jewellery",
      title: "Gold Jewellery Online | Rings, Earrings & Necklaces | TBA",
      description:
        "Explore gold jewellery online at The Brilliance Atelier, including gold rings, earrings, necklaces and bracelets in elegant modern designs.",
      keywords: [
        "gold jewellery",
        "gold jewellery online",
        "gold rings",
        "gold earrings",
        "gold necklaces",
        "gold bracelets",
        "gold pendant",
        "18kt gold jewellery",
        "14kt gold jewellery",
        "diamond gold jewellery",
        "gold jewellery India",
      ],
    },
    {
      match: (path) => path === "/silver-jewellery",
      title: "Silver Jewellery Online | Rings, Earrings & Necklaces | TBA",
      description:
        "Shop silver jewellery online at The Brilliance Atelier. Discover silver rings, earrings, necklaces, Moissanite and Polki jewellery collections.",
      keywords: [
        "silver jewellery",
        "silver jewellery online",
        "silver rings",
        "silver earrings",
        "silver necklaces",
        "silver bracelets",
        "moissanite jewellery",
        "polki jewellery",
        "sterling silver jewellery",
        "silver jewellery India",
      ],
    },
    {
      match: (path) => path === "/silver-jewellery/polki",
      title: "Silver Polki Jewellery Online | Polki Necklace Sets | TBA",
      description:
        "Shop silver Polki jewellery online at The Brilliance Atelier. Explore Polki necklace sets, bridal designs, chokers and statement jewellery crafted for special occasions.",
      keywords: [
        "silver jewellery",
        "silver jewellery online",
        "silver rings",
        "silver earrings",
        "silver necklaces",
        "silver bracelets",
        "moissanite jewellery",
        "polki jewellery",
        "sterling silver jewellery",
        "silver jewellery India",
      ],
      canonicalPath: "/silver-jewellery/polki",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.thebrillianceatelier.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Silver Jewellery",
            item: "https://www.thebrillianceatelier.com/silver-jewellery",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Polki Jewellery",
            item: "https://www.thebrillianceatelier.com/silver-jewellery/polki",
          },
        ],
      },
    },
    {
      match: (path) => path === "/silver-jewellery/moissanite",
      title: "Moissanite Jewellery Online | Silver Moissanite Necklaces | TBA",
      description: "Shop Moissanite jewellery online at The Brilliance Atelier. Explore elegant silver Moissanite necklace designs for weddings, celebrations and special occasions.",
      canonicalPath: "/silver-jewellery/moissanite",
      structuredData: { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thebrillianceatelier.com/" },
        { "@type": "ListItem", position: 2, name: "Silver Jewellery", item: "https://www.thebrillianceatelier.com/silver-jewellery" },
        { "@type": "ListItem", position: 3, name: "Moissanite Jewellery", item: "https://www.thebrillianceatelier.com/silver-jewellery/moissanite" },
      ] },
    },    {
      match: (path) => path.startsWith("/product/"),
      title: "Jewellery Details | TBA jewellery",
      description:
        "View jewellery specifications, available options and the complete price breakup at TBA jewellery.",
    },
    {
      match: (path) => path === "/wishlist",
      title: "Wishlist | TBA jewellery",
      description:
        "Review your saved TBA jewellery pieces and return to them whenever you are ready.",
    },
    {
      match: (path) => path === "/cart",
      title: "Shopping Cart | TBA jewellery",
      description: "Review your selected TBA jewellery items before checkout.",
    },
    {
      match: (path) => path === "/checkout",
      title: "Checkout | TBA jewellery",
      description: "Complete your TBA jewellery purchase securely.",
    },
    {
      match: (path) => path === "/account",
      title: "My Account | TBA jewellery",
      description:
        "Manage your TBA jewellery account details and saved addresses.",
    },
    {
      match: (path) => path === "/orders",
      title: "My Orders | TBA jewellery",
      description: "View your TBA jewellery purchases and order details.",
    },
    {
      match: (path) => path === "/orderConfirmation",
      title: "Order Confirmation | TBA jewellery",
      description: "Review the details of your completed TBA jewellery order.",
    },
    {
      match: (path) => path === "/auth",
      title: "Sign In | TBA jewellery",
      description:
        "Sign in to your TBA jewellery account to manage your shopping experience.",
    },
    {
      match: (path) => path === "/reset-password",
      title: "Reset Password | TBA jewellery",
      description:
        "Securely reset the password for your TBA jewellery account.",
    },
    {
      match: (path) => path === "/b2b/access",
      title: "B2B Access | TBA jewellery",
      description: "Access the private TBA jewellery trade catalogue.",
    },
    {
      match: (path) => path === "/b2b/catalog",
      title: "B2B Jewellery Catalogue | TBA jewellery",
      description: "Browse TBA jewellery's private business catalogue.",
    },
    {
      match: (path) => path.startsWith("/b2b/product/"),
      title: "B2B Product Details | TBA jewellery",
      description:
        "Review product specifications and B2B pricing information in the TBA trade catalogue.",
    },
    {
      match: (path) => path.startsWith("/admin/login"),
      title: "Admin Sign In | TBA jewellery",
      description: "Sign in to the TBA jewellery administration panel.",
    },
    {
      match: (path) => path.startsWith("/admin/orders"),
      title: "Customer Orders | TBA Admin",
      description:
        "Review customer order records in the TBA administration panel.",
    },
    {
      match: (path) => path.startsWith("/admin/products"),
      title: "Products | TBA Admin",
      description: "Manage TBA jewellery product details, media and pricing.",
    },
    {
      match: (path) => path.startsWith("/admin/categories"),
      title: "Categories | TBA Admin",
      description: "Manage TBA jewellery catalogue categories.",
    },
    {
      match: (path) => path.startsWith("/admin/metal-rates"),
      title: "Metal Rates | TBA Admin",
      description: "Manage current TBA jewellery metal rates.",
    },
    {
      match: (path) => path.startsWith("/admin"),
      title: "Administration | TBA jewellery",
      description: "Manage TBA jewellery catalogue and store operations.",
    },
  ];
  const page: {
    title: string;
    description: string;
    keywords?: string[];
    noIndex?: boolean;
    canonicalPath?: string;
    structuredData?: Record<string, unknown>;
  } = pages.find(({ match }) => match(pathname)) || {
    title: "Page Not Found | TBA jewellery",
    description: "The requested TBA jewellery page could not be found.",
  };
  const noIndex = [
    "/admin",
    "/b2b",
    "/wishlist",
    "/cart",
    "/checkout",
    "/account",
    "/orders",
    "/orderConfirmation",
    "/auth",
    "/reset-password",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const selectedMainCategory = new URLSearchParams(search).get("mainCategory");
  const selectedSilverType = silverCategories.find(
    (category) => category._id === selectedMainCategory,
  )?.name.toLowerCase();
  const canonicalPath =
    pathname === "/silver-jewellery" && selectedSilverType === "polki"
      ? "/silver-jewellery/polki"
      : pathname === "/silver-jewellery" && selectedSilverType === "moissanite"
        ? "/silver-jewellery/moissanite"
        : page.canonicalPath;
  return (
    <Seo
      {...page}
      canonicalPath={canonicalPath}
      noIndex={noIndex || page.noIndex}
      structuredData={page.structuredData}
    />
  );
}
function AuthRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const from =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/";
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <AuthModal
        isOpen={true}
        onClose={() => navigate(from, { replace: true })}
      />
    </div>
  );
}
function ScrollToTop() {
  const { pathname, search } = useLocation();
  const { data: silverCategories } = useCategories("silver");
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  if (IS_COMING_SOON) {
    return (
      <ReactQueryProvider>
        <ComingSoonPage />
      </ReactQueryProvider>
    );
  }

  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <BrowserRouter>
            <ScrollToTop />
            <RouteSeo />
            <Routes>
              <Route
                path="/b2b"
                element={<Navigate to="/b2b/access" replace />}
              />
              <Route
                path="/admin/*"
                element={
                  <Deferred>
                    <AdminApp />
                  </Deferred>
                }
              />
              <Route
                path="/b2b/access"
                element={
                  <Deferred>
                    <B2BAccess />
                  </Deferred>
                }
              />
              <Route
                path="/b2b/catalog"
                element={
                  <Deferred>
                    <B2BCatalog />
                  </Deferred>
                }
              />
              <Route
                path="/b2b/product/:identifier"
                element={
                  <Deferred>
                    <B2BProductDetails />
                  </Deferred>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <Deferred>
                    <ResetPassword />
                  </Deferred>
                }
              />
              <Route
                path="/"
                element={
                  <>
                    <Loader />
                    <Deferred>
                      <HomePage />
                    </Deferred>
                  </>
                }
              />

              <Route
                path="/products"
                element={<Navigate to="/gold-jewellery" replace />}
              />
              <Route
                path="/gold-jewellery"
                element={
                  <Deferred>
                    <ProductsPage metal="gold" />
                  </Deferred>
                }
              />
              <Route
                path="/silver-jewellery"
                element={
                  <Deferred>
                    <ProductsPage metal="silver" />
                  </Deferred>
                }
              />
              <Route
                path="/silver-jewellery/polki"
                element={
                  <Deferred>
                    <ProductsPage
                      metal="silver"
                      fixedMainCategory="6a68a898063feb823d6d993d"
                      heading="Silver Polki Jewellery"
                      intro="Explore Silver Polki Jewellery featuring necklace sets, chokers, bridal styles and selected bangles for weddings and special occasions."
                      faqs={POLKI_FAQS}
                      supportingContent={POLKI_SUPPORTING_CONTENT}
                      showPolkiBreadcrumb
                    />
                  </Deferred>
                }
              />
              <Route
                path="/silver-jewellery/moissanite"
                element={<Deferred><ProductsPage metal="silver" fixedMainCategoryName="Moissanite" heading="Silver Moissanite Jewellery" intro="Explore Silver Moissanite Jewellery featuring elegant necklace designs for weddings, celebrations and special occasions." faqs={MOISSANITE_FAQS} supportingContent={MOISSANITE_SUPPORTING_CONTENT} showMoissaniteBreadcrumb /></Deferred>}
              />              <Route
                path="/product/:slug"
                element={
                  <Deferred>
                    <ProductDetailPage />
                  </Deferred>
                }
              />
              <Route
                path="/terms-of-service"
                element={
                  <Deferred>
                    <TermsOfService />
                  </Deferred>
                }
              />
              <Route
                path="/data-deletion"
                element={
                  <Deferred>
                    <DataDeletion />
                  </Deferred>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <WishlistPage />
                    </Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <CartPage />
                    </Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <Account />
                    </Deferred>
                  </ProtectedRoute>
                }
              />

              <Route path="/auth" element={<AuthRoute />} />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <CheckoutPage />
                    </Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orderConfirmation"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <OrderConfirmation />
                    </Deferred>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred>
                      <OrderHistory />
                    </Deferred>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
