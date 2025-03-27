// AppContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-toastify";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFetchingCart, setIsFetchingCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Thêm trạng thái danh mục

  const fetchCart = useCallback(async () => {
    if (isFetchingCart || !isAuthenticated) return;
    setIsFetchingCart(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("http://localhost:8080/tirashop/cart/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCart([]);
       
        return;
      }

      const data = await response.json();
      if (data.status === "success" && data.data && data.data.items) {
        const validSizes = ["S", "M", "L"];
        const parsedCart = data.data.items.map((item) => ({
          id: item.id,
          cartId: parseInt(item.cartId),
          productId: parseInt(item.productId),
          productName: item.productName,
          productPrice: parseFloat(item.productPrice) || 0,
          quantity: parseInt(item.quantity) || 0,
          size: validSizes.includes(item.size) ? item.size : "M",
          productImage: item.productImage
            ? `http://localhost:8080${item.productImage}`
            : null,
        }));
        setCart(parsedCart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
      toast.error("Failed to fetch cart. Please try again.");
    } finally {
      setIsFetchingCart(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const validateAndSetAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            "http://localhost:8080/tirashop/auth/validate-token",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (response.status === 200 && data.status === "success") {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setCart([]);
          }
        } catch (err) {
          console.error("Token validation error:", err);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setCart([]);
        }
      } else {
        setIsAuthenticated(false);
        setCart([]);
      }
    };
    validateAndSetAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCart([]);
    setIsSidebarOpen(false);
    setIsMenuOpen(false);
    toast.success("Logged out successfully!");
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        cart,
        setCart,
        isSidebarOpen,
        setIsSidebarOpen,
        isMenuOpen,
        setIsMenuOpen,
        isSearchOpen,
        setIsSearchOpen,
        fetchCart,
        handleLogout,
        selectedCategory, // Thêm vào context
        setSelectedCategory, // Thêm vào context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);