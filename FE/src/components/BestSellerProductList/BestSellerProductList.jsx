import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useAppContext } from "../../context/AppContext";
import React from "react";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

// Helper function to format price with commas, without .00
const formatPrice = (price) => {
  if (!price) return "N/A";
  return Math.floor(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " $";
};

// Helper function to render star rating
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={styles.star}>★</span>
      ))}
      {halfStar ? <span className={styles.star}>☆</span> : null}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.star}>☆</span>
      ))}
    </>
  );
};

function BestsellerProductList({ isAuthenticated }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const navigate = useNavigate();
  const { fetchCart, setIsSidebarOpen } = useAppContext();

  const fetchBestsellers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("http://localhost:8080/tirashop/product/bestsellers", {
        method: "GET",
        headers,
      });
      const data = await response.json();
      if (data.status === "success") {
        const bestSellerProducts = data.data || [];
        setProducts(bestSellerProducts);
        setSelectedSizes(
          bestSellerProducts.reduce((acc, product) => {
            acc[product.id] = product.size; // Chỉ gán trực tiếp size từ API
            return acc;
          }, {})
        );
      } else {
        setError("Unable to fetch bestseller products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestsellers();
  }, [fetchBestsellers]);

  const handleProductClick = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleAddToCart = useCallback(
    async (product) => {
      const token = localStorage.getItem("token");
      if (!token || !isAuthenticated) {
        toast.error("Please log in to add to cart");
        navigate("/auth");
        return;
      }
      try {
        const response = await fetch("http://localhost:8080/tirashop/cart/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            productSize: selectedSizes[product.id] || "M",
          }),
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
          toast.success("Added to cart successfully!");
          await fetchCart();
          setIsSidebarOpen(true);
        } else {
          toast.error(`Unable to add to cart: ${data.message || "Unknown error"}`);
        }
      } catch (error) {
        toast.error("Error adding to cart. Please try again.");
      }
    },
    [isAuthenticated, navigate, fetchCart, setIsSidebarOpen, selectedSizes]
  );

  const memoizedProducts = useMemo(() => products.slice(0, 7), [products]);

  const handleSeeMore = useCallback(() => {
    navigate("/category/bestsellers");
  }, [navigate]);

  if (loading) return <p>Loading bestsellers...</p>;
  if (error) return <p>Error: {error}</p>;
  if (memoizedProducts.length === 0) return <p>No bestseller products available.</p>;

  return (
    <div className={styles.bestsellerListContainer}>
      <p className={styles.bestProduct}>Bestseller Products</p>
      <div className={styles.container}>
        <Carousel
          responsive={responsive}
          className={styles.productGrid}
          infinite
          autoPlay={false}
          keyBoardControl
        >
          {memoizedProducts.map((product) => (
            <div key={product.id} className={styles.productItem}>
              <div
                className={styles.boxImg}
                onClick={() => handleProductClick(product.id)}
              >
                {product.isBestSeller && (
                  <span className={styles.bestSellerBadge}>BestSeller</span>
                )}
                <img
                  src={
                    product.imageUrls?.[0]
                      ? `http://localhost:8080${product.imageUrls[0]}`
                      : "https://via.placeholder.com/250"
                  }
                  alt={product.name || "Unnamed product"}
                />
              </div>
              <div className={styles.title}>
                {product.name || "Unnamed product"}
              </div>
              <div className={styles.category}>
                {product.brandName || "Unknown brand"} -{" "}
                {product.categoryName || "No category"}
              </div>
              <div className={styles.priceContainer}>
                <span className={styles.priceCl}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className={styles.ratingSizeContainer}>
                <div className={styles.rating}>
                  {renderStars(product.averageRating || 0)}
                </div>
                <div className={styles.sizeDisplay}>
                  <span>Size: {selectedSizes[product.id] || "N/A"}</span>
                </div>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className={styles.addToCartBtn}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </Carousel>
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleSeeMore}>
          See More Products
        </button>
      </div>
    </div>
  );
}

export default React.memo(
  BestsellerProductList,
  (prevProps, nextProps) => prevProps.isAuthenticated === nextProps.isAuthenticated
);