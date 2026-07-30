import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Loader from "./components/Loader";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Seo } from "./components/Seo";

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
const Deferred = ({ children }: { children: React.ReactNode }) => <React.Suspense fallback={<div className="min-h-screen grid place-items-center text-[var(--color-text-muted)]">Loading...</div>}>{children}</React.Suspense>;

function RouteSeo() {
  const { pathname } = useLocation();
  const pages: Array<{ match: (path: string) => boolean; title: string; description: string; noIndex?: boolean }> = [
    { match: (path) => path === "/", title: "The Brilliance Atelier | Gold, Silver & Lab Grown Diamond Jewellery", description: "Shop fine gold, silver and lab grown diamond jewellery at The Brilliance Atelier. Explore elegant rings, earrings, necklaces and custom jewellery designs." },
    { match: (path) => path === "/products", title: "Gold Jewellery Collection | TBA Jewelry", description: "Browse TBA's curated gold jewellery collection, including rings, earrings, necklaces and bracelets." },
    { match: (path) => path === "/gold-jewellery", title: "Gold Jewellery Online | Rings, Earrings & Necklaces | TBA", description: "Explore gold jewellery online at The Brilliance Atelier, including gold rings, earrings, necklaces and bracelets in elegant modern designs." },
    { match: (path) => path === "/silver-jewellery", title: "Silver Jewellery Online | Rings, Earrings & Necklaces | TBA", description: "Shop silver jewellery online at The Brilliance Atelier. Discover silver rings, earrings, necklaces, Moissanite and Polki jewellery collections." },
    { match: (path) => path.startsWith("/product/"), title: "Jewellery Details | TBA Jewelry", description: "View jewellery specifications, available options and the complete price breakup at TBA Jewelry." },
    { match: (path) => path === "/wishlist", title: "Wishlist | TBA Jewelry", description: "Review your saved TBA Jewelry pieces and return to them whenever you are ready." },
    { match: (path) => path === "/cart", title: "Shopping Cart | TBA Jewelry", description: "Review your selected TBA Jewelry items before checkout." },
    { match: (path) => path === "/checkout", title: "Checkout | TBA Jewelry", description: "Complete your TBA Jewelry purchase securely." },
    { match: (path) => path === "/account", title: "My Account | TBA Jewelry", description: "Manage your TBA Jewelry account details and saved addresses." },
    { match: (path) => path === "/orders", title: "My Orders | TBA Jewelry", description: "View your TBA Jewelry purchases and order details." },
    { match: (path) => path === "/orderConfirmation", title: "Order Confirmation | TBA Jewelry", description: "Review the details of your completed TBA Jewelry order." },
    { match: (path) => path === "/auth", title: "Sign In | TBA Jewelry", description: "Sign in to your TBA Jewelry account to manage your shopping experience." },
    { match: (path) => path === "/reset-password", title: "Reset Password | TBA Jewelry", description: "Securely reset the password for your TBA Jewelry account." },
    { match: (path) => path === "/b2b/access", title: "B2B Access | TBA Jewelry", description: "Access the private TBA Jewelry trade catalogue." },
    { match: (path) => path === "/b2b/catalog", title: "B2B Jewellery Catalogue | TBA Jewelry", description: "Browse TBA Jewelry's private business catalogue." },
    { match: (path) => path.startsWith("/b2b/product/"), title: "B2B Product Details | TBA Jewelry", description: "Review product specifications and B2B pricing information in the TBA trade catalogue." },
    { match: (path) => path.startsWith("/admin/login"), title: "Admin Sign In | TBA Jewelry", description: "Sign in to the TBA Jewelry administration panel." },
    { match: (path) => path.startsWith("/admin/orders"), title: "Customer Orders | TBA Admin", description: "Review customer order records in the TBA administration panel." },
    { match: (path) => path.startsWith("/admin/products"), title: "Products | TBA Admin", description: "Manage TBA Jewelry product details, media and pricing." },
    { match: (path) => path.startsWith("/admin/categories"), title: "Categories | TBA Admin", description: "Manage TBA Jewelry catalogue categories." },
    { match: (path) => path.startsWith("/admin/metal-rates"), title: "Metal Rates | TBA Admin", description: "Manage current TBA Jewelry metal rates." },
    { match: (path) => path.startsWith("/admin"), title: "Administration | TBA Jewelry", description: "Manage TBA Jewelry catalogue and store operations." },
  ];
  const page: { title: string; description: string; noIndex?: boolean } = pages.find(({ match }) => match(pathname)) || { title: "Page Not Found | TBA Jewelry", description: "The requested TBA Jewelry page could not be found." };
  const noIndex = ["/admin", "/b2b", "/wishlist", "/cart", "/checkout", "/account", "/orders", "/orderConfirmation", "/auth", "/reset-password"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return <Seo {...page} noIndex={noIndex || page.noIndex} />;
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [pathname]);
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
              <Route path="/b2b" element={<Navigate to="/b2b/access" replace />} />
              <Route path="/admin/*" element={<Deferred><AdminApp /></Deferred>} />
              <Route path="/b2b/access" element={<Deferred><B2BAccess /></Deferred>} />
              <Route path="/b2b/catalog" element={<Deferred><B2BCatalog /></Deferred>} />
              <Route path="/b2b/product/:identifier" element={<Deferred><B2BProductDetails /></Deferred>} />
              <Route path="/reset-password" element={<Deferred><ResetPassword /></Deferred>} />
              <Route
                path="/"
                element={
                  <>
                    <Loader />
                    <Deferred><HomePage /></Deferred>
                  </>
                }
              />

              <Route path="/products" element={<Navigate to="/gold-jewellery" replace />} />
              <Route path="/gold-jewellery" element={<Deferred><ProductsPage metal="gold" /></Deferred>} />
              <Route path="/silver-jewellery" element={<Deferred><ProductsPage metal="silver" /></Deferred>} />
              <Route path="/product/:slug" element={<Deferred><ProductDetailPage /></Deferred>} />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred><WishlistPage /></Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred><CartPage /></Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred><Account /></Deferred>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/auth"
                element={
                  <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                    <AuthModal isOpen={true} onClose={() => { window.location.href = "/"; }} />
                  </div>
                }
              />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={[]}>
                    <Deferred><CheckoutPage /></Deferred>
                  </ProtectedRoute>
                }
              />

              <Route path="/orderConfirmation" element={<ProtectedRoute allowedRoles={[]}><Deferred><OrderConfirmation /></Deferred></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute allowedRoles={[]}><Deferred><OrderHistory /></Deferred></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
