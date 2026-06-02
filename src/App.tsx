import { Routes, Route } from "react-router-dom";
import { useConvexAuth } from "convex/react";

// Layouts
import RootLayout from "@/components/layout/RootLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Public pages
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import OnboardingPage from "@/pages/OnboardingPage";

// Shared / Marketplace
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import ProductDetailPage from "@/pages/marketplace/ProductDetailPage";

// Importer pages
import ImporterDashboard from "@/pages/importer/Dashboard";
import ImporterListings from "@/pages/importer/Listings";
import ImporterAddListing from "@/pages/importer/AddListing";
import ImporterOrders from "@/pages/importer/Orders";
import ImporterEarnings from "@/pages/importer/Earnings";

// Wholesaler pages
import WholesalerDashboard from "@/pages/wholesaler/Dashboard";
import WholesalerOrders from "@/pages/wholesaler/Orders";
import WholesalerCart from "@/pages/wholesaler/Cart";
import WholesalerCheckout from "@/pages/wholesaler/Checkout";

// Admin pages (only admin sees real commission data)
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminDeals from "@/pages/admin/Deals";
import AdminRevenue from "@/pages/admin/Revenue";
import AdminUsers from "@/pages/admin/Users";

// Shared
import ChatPage from "@/pages/ChatPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Guards
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { RoleRoute } from "@/components/layout/ProtectedRoute";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      </Route>

      {/* Marketplace (authenticated, any role) */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:productId" element={<ProductDetailPage />} />
        <Route path="/chat/:dealId?" element={<ChatPage />} />

        {/* Importer routes */}
        <Route path="/importer" element={<RoleRoute role="importer" />}>
          <Route index element={<ImporterDashboard />} />
          <Route path="listings" element={<ImporterListings />} />
          <Route path="listings/new" element={<ImporterAddListing />} />
          <Route path="orders" element={<ImporterOrders />} />
          <Route path="earnings" element={<ImporterEarnings />} />
        </Route>

        {/* Wholesaler routes */}
        <Route path="/wholesaler" element={<RoleRoute role="wholesaler" />}>
          <Route index element={<WholesalerDashboard />} />
          <Route path="orders" element={<WholesalerOrders />} />
          <Route path="cart" element={<WholesalerCart />} />
          <Route path="checkout" element={<WholesalerCheckout />} />
        </Route>

        {/* Admin routes (full data visibility) */}
        <Route path="/admin" element={<RoleRoute role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}