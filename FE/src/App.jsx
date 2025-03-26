import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import ChatBox from "./components/HomePage/ChatBox";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppProvider, useAppContext } from "./context/AppContext";
import HomePage from "./components/HomePage/HomePage";
import AuthPage from "./components/Auth/AuthPage";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import ForgotPasswordPage from "./components/Auth/ForgotPasswordPage";
import VerifyCodePage from "./components/Auth/VerifyCodePage";
import SetNewPasswordPage from "./components/Auth/SetNewPasswordPage";
import UserProfile from "./components/UserProfile/UserProfile";
import FixedHeader from "./components/Header/FixedHeader";
import Cart from "./components/Cart/Cart";
import VoucherPage from "./components/Voucher/VoucherPage";
import PostList from "./components/PostList/PostList";
import DetailPostList from "./components/PostList/DetailPostList";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import TryOn from "./components/HomePage/TryOn";
import TryOnButton from "./components/HomePage/TryonButton";
import "./assets/style/toastifyCustom.module.scss";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  console.log("isAuthenticated in ProtectedRoute:", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const openTryOn = () => setIsTryOnOpen(true);
  const closeTryOn = () => setIsTryOnOpen(false);

  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <FixedHeader />
          <Cart />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
              <Route
                path="/set-new-password"
                element={<SetNewPasswordPage />}
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <VoucherPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <ProtectedRoute>
                    <PostList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post/:postId"
                element={
                  <ProtectedRoute>
                    <DetailPostList />
                  </ProtectedRoute>
                }
              />
              {/* Route cho /category/:categoryId */}
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              {/* Route cho /category/all */}
              <Route path="/category/all" element={<CategoryPage />} />
              {/* Route cho /category (không có categoryId) */}
              <Route
                path="/category"
                element={<Navigate to="/category/all" />}
              />
              {/* Route mặc định */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <ChatBox />
          <TryOnButton onClick={openTryOn} />
          <TryOn isOpen={isTryOnOpen} onClose={closeTryOn} />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{ fontSize: "1rem", fontFamily: "Poppins, sans-serif" }}
        />
      </Router>
    </AppProvider>
  );
}

export default App;
