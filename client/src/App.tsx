import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Loader from "./components/Loader";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";

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
const Deferred = ({ children }: { children: React.ReactNode }) => <React.Suspense fallback={<div className="min-h-screen grid place-items-center text-[var(--color-text-muted)]">Loading…</div>}>{children}</React.Suspense>;

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

              <Route path="/products" element={<Deferred><ProductsPage metal="gold" /></Deferred>} />
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
