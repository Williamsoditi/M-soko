import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Box } from "@mui/material"; 
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderHistory from "./pages/OrderHistory"; 
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Box
          sx={{
            display: "flex", 
            flexDirection: "column", 
            minHeight: "100vh", 
          }}
        >
          <Navbar />

          <Box
            component="main" 
            sx={{
              flexGrow: 1, 
              overflowY: "auto", 
            }}
          >
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

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
                      <OrderHistory /> 
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
          </Box>

          <Footer />
        </Box>
      </AuthProvider>
    </Router>
  );
};

export default App;