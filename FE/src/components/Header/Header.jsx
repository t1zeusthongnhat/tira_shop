import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import userIcon from "../../assets/icons/svgs/userIcon.svg";
import cartIcon from "../../assets/icons/svgs/cartIcon.svg";
import searchIcon from "../../assets/icons/svgs/searchIcon.svg";
import barIcon from "../../assets/icons/svgs/bar.svg";
import closeIcon from "../../assets/icons/svgs/close.svg";
import bannerGucci from "../../assets/icons/images/bannerGucci.png";
// import ProductList from "../ProductItem/ProductList"
import Cart from "../Cart/Cart";
import Search from "../Search/Search";
import FixedHeader from "./FixedHeader";

function MyHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSidebarBrandDropdown, setShowSidebarBrandDropdown] =
    useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (token) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("http://localhost:8080/tirashop/cart/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCart([]);
        toast.error("Your session has expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      const data = await response.json();
      if (data.status === "success") {
        const validSizes = ["S", "M", "L"];
        const parsedCart = (data.data.items || []).map((item) => ({
          ...item,
          cartId: parseInt(item.cartId),
          productId: parseInt(item.productId),
          size: validSizes.includes(item.size) ? item.size : "M",
          productImage: item.productImage
            ? `http://localhost:8080${item.productImage}`
            : null,
        }));
        setCart(parsedCart);
        console.log("Fetched cart:", parsedCart);
      } else {
        console.error("Failed to fetch cart:", data.message);
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    setCart([]);
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/");
  };

  const handleUpdateQuantity = async (cartId, productId, newQuantity, size) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        toast.error("Please log in to update cart", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      const parsedCartId = parseInt(cartId);
      const parsedProductId = parseInt(productId);
      if (isNaN(parsedCartId) || isNaN(parsedProductId)) {
        toast.error("Invalid cart ID or product ID", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (newQuantity < 1) {
        toast.error("Quantity must be at least 1", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const validSizes = ["S", "M", "L"];
      if (!validSizes.includes(size)) {
        toast.error("Invalid size. Please select S, M, or L.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await fetch(
        "http://localhost:8080/tirashop/cart/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cartId: parsedCartId,
            productId: parsedProductId,
            quantity: newQuantity,
            size: size,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        toast.error("Your session has expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      const data = await response.json();
      if (data.status === "success") {
        await fetchCart();
        toast.success("Quantity updated!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Failed to update quantity: ${data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error updating quantity. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      await fetchCart();
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        toast.error("Please log in to remove items from cart", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      const parsedCartId = parseInt(cartId);
      if (isNaN(parsedCartId)) {
        toast.error("Invalid cart ID", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await fetch(
        `http://localhost:8080/tirashop/cart/remove/${parsedCartId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        toast.error("Your session has expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      if (data.status === "success") {
        setCart((prevCart) =>
          prevCart.filter((item) => item.cartId !== cartId)
        );
        toast.success("Item removed from cart!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Failed to remove item: ${data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const navigateToBestProducts = () => {
    const bestProductsSection = document.querySelector(
      `.${styles.productListContainer}`
    );
    if (bestProductsSection) {
      bestProductsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigateToBrand = (brand) => {
    console.log(`Navigating to ${brand} products`);
    setShowSidebarBrandDropdown(false);
    setIsMenuOpen(false);
  };

  const isHomepage = location.pathname === "/";

  return (
    <>
      {isHomepage && (
        <header className={styles.header}>
          <h1 className={styles.headerTitle} onClick={() => navigate("/")}>
            TIRA
          </h1>
          <div className={styles.iconBox}>
            {!isAuthenticated && (
              <img
                src={userIcon}
                alt="User Icon"
                className={styles.headerIcon}
                onClick={() => navigate("/auth")}
              />
            )}
            <div
              className={styles.cartContainer}
              onClick={() => setIsSidebarOpen(true)}
            >
              <img
                src={cartIcon}
                alt="Cart Icon"
                className={styles.headerIcon}
              />
              {cart.length > 0 && (
                <span className={styles.cartCount}>{cart.length}</span>
              )}
            </div>
            <img
              src={searchIcon}
              alt="Search Icon"
              className={styles.headerIcon}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
            <Search
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
            />
            <img
              src={barIcon}
              alt="Menu Icon"
              className={styles.headerIcon}
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
        </header>
      )}

      <FixedHeader
        isAuthenticated={isAuthenticated}
        cart={cart}
        setIsSidebarOpen={setIsSidebarOpen}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isHomepage={isHomepage}
        handleLogout={handleLogout}
      />

      <div className={styles.banner}>
        <img src={bannerGucci} className={styles.bannerImage} alt="Banner" />
        <div className={styles.bannerOverlay}>
          <h1 className={styles.bannerTitle}>TIRA</h1>
        </div>
      </div>
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.show : ""}`}
        onClick={closeSidebar}
        style={{
          opacity: isSidebarOpen ? 1 : 0,
          visibility: isSidebarOpen ? "visible" : "hidden",
        }}
      ></div>
      <Cart
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        cart={cart}
        setCart={setCart}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        fetchCart={fetchCart}
        navigate={navigate}
      />
      <div className={`${styles.sidebarMenu} ${isMenuOpen ? styles.open : ""}`}>
        <button
          className={styles.closeBtn}
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={closeIcon} alt="Close" />
        </button>
        <ul className={styles.menuList}>
          <li onClick={navigateToBestProducts}>Best Product</li>
          <li
            className={styles.menuItemWithSubmenu}
            onClick={() =>
              setShowSidebarBrandDropdown(!showSidebarBrandDropdown)
            }
          >
            Brand {showSidebarBrandDropdown ? "▲" : "▼"}
            {showSidebarBrandDropdown && (
              <ul className={styles.submenu}>
                <li onClick={() => navigateToBrand("Gucci")}>Gucci</li>
                <li onClick={() => navigateToBrand("Calvin")}>Calvin</li>
                <li onClick={() => navigateToBrand("Versace")}>Versace</li>
                <li onClick={() => navigateToBrand("Zara")}>Zara</li>
              </ul>
            )}
          </li>
          <li>Store System</li>
          <li>Voucher</li>
          {!isAuthenticated ? (
            <li onClick={() => navigate("/auth")}>Sign In</li>
          ) : (
            <li onClick={handleLogout}>Logout</li>
          )}
          <li
            onClick={() => {
              if (isAuthenticated) {
                navigate("/profile");
              } else {
                toast.error("Please log in to view your profile", {
                  position: "top-right",
                  autoClose: 3000,
                });
                navigate("/auth");
              }
              setIsMenuOpen(false);
            }}
          >
            My Account
          </li>
          <li>My Orders</li>
          <li>Contact Us</li>
        </ul>
      </div>
    </>
  );
}

export default MyHeader;
