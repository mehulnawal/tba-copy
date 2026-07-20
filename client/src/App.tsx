import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loader from "./components/Loader";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";

import ComingSoonPage from "./pages/CommingSoon";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetails";
import ProductsPage from "./pages/ProductPage";

import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import WishlistPage from "./pages/Wishlist";
import CartPage from "./pages/Cart";
import { AuthModal } from "./pages/AuthModal";
import CheckoutPage from "./pages/Checkout";
import NotFoundPage from "./pages/404Page";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import AdminApp from "./admin/AdminApp";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";

// Agar aapne Account page bana liya hai, toh use aise import karein:
// import AccountPage from "./pages/AccountPage"; 

const IS_COMING_SOON = false;

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
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <>
                    <Loader />
                    <HomePage />
                  </>
                }
              />

              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
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
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/orderConfirmation" element={<OrderConfirmation />} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}