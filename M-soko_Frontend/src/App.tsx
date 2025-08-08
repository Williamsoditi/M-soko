import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 👈 Import the AuthProvider

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage"; // 👈 New: Import the login page
import RegisterPage from "./pages/RegisterPage"; // 👈 New: Import the register page
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute"; // 👈 New: Import the ProtectedRoute
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* 👈 Wrap your app with the AuthProvider */}
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* 👈 New: Unprotected authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 👈 New: Protected routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={<PrivateRoute element={CheckoutPage} />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
