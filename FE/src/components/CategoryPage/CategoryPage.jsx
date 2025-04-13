import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./styles.module.scss";
import Footer from "../Footer/Footer";
import { useAppContext } from "../../Context/AppContext";

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

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, fetchCart } = useAppContext();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [productSizes, setProductSizes] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [elementsPerPage] = useState(12);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/tirashop/category/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success" && data.data?.elementList) {
        setCategories(data.data.elementList);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/tirashop/brand/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success" && data.data) {
        setBrands(data.data);
      } else {
        toast.error(data.message || "Failed to fetch brands");
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      setCategory({
        name: "All Products",
        description: "View all products in the store.",
      });

      const queryParams = new URLSearchParams({
        pageNo: currentPage,
        elementPerPage: elementsPerPage,
        ...(priceRange[0] !== 0 && { minPrice: priceRange[0] }),
        ...(priceRange[1] !== 15000 && { maxPrice: priceRange[1] }),
        ...(selectedSizes.length > 0 && { size: selectedSizes.join(",") }),
        ...(selectedBrands.length > 0 && { brand: selectedBrands.join(",") }),
      }).toString();

      const productResponse = await fetch(
        `http://localhost:8080/tirashop/product?${queryParams}`,
        { method: "GET", headers }
      );
      if (!productResponse.ok)
        throw new Error(`HTTP error! Status: ${productResponse.status}`);
      const productData = await productResponse.json();
      if (productData.status === "success") {
        const productsList = productData.data.elementList || [];
        setProducts(productsList);
        setTotalPages(productData.data.totalPages || 0);
        setProductSizes(
          productsList.reduce((acc, product) => {
            acc[product.id] = product.size || "M";
            return acc;
          }, {})
        );
      } else {
        throw new Error(productData.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, priceRange, selectedSizes, selectedBrands]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchAllProducts();
  }, [fetchCategories, fetchBrands, fetchAllProducts]);

  useEffect(() => {
    if (location.state?.searchResults) {
      setSearchResults(location.state.searchResults);
      setSearchQuery(location.state.query || "");
      setCurrentPage(0);
      setTotalPages(1);
      setProductSizes(
        location.state.searchResults.reduce((acc, product) => {
          acc[product.id] = product.size || "M";
          return acc;
        }, {})
      );
    } else {
      setSearchResults([]);
      setSearchQuery("");
      fetchAllProducts();
    }
  }, [location.state, fetchAllProducts]);

  useEffect(() => {
    if (location.state?.resetFilters) {
      resetFilters();
    }
  }, [location.state]);

  const mapCategoryDisplay = (categoryName) => {
    const categoryMap = {
      "Tre Em": "Kids Fashion",
      Gucci: "Gucci",
      Mens: "Men's Fashion",
      Womens: "Women's Fashion",
      "Both Male and Female": "Unisex Fashion",
      Versace: "Versace",
      Zara: "Zara",
      Calvin: "Calvin Klein",
    };
    return categoryMap[categoryName] || categoryName;
  };

  const sizes = ["S", "M", "L", "XL"];

  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setCurrentPage(0);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(0);
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(0);
  };

  const handleProductSizeChange = (productId, size) => {
    setProductSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add to cart");
      navigate("/auth");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
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
          productSize: productSizes[product.id] || "M",
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        await fetchCart();
        toast.success("Added to cart successfully!");
      } else {
        toast.error(
          `Failed to add to cart: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error("Error adding to cart. Please try again.");
    }
  };

  const resetFilters = () => {
    setPriceRange([0, 15000]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxButtons = 5;
    const buttons = [];
    let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={styles.pageButton}
      >
        Previous
      </button>
    );

    if (startPage > 0) {
      buttons.push(
        <button
          key={0}
          onClick={() => handlePageChange(0)}
          className={styles.pageButton}
        >
          1
        </button>
      );
      if (startPage > 1) {
        buttons.push(<span key="start-ellipsis" className={styles.ellipsis}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.pageButton} ${
            currentPage === i ? styles.active : ""
          }`}
        >
          {i + 1}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        buttons.push(<span key="end-ellipsis" className={styles.ellipsis}>...</span>);
      }
      buttons.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
          className={styles.pageButton}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={styles.pageButton}
      >
        Next
      </button>
    );

    return <div className={styles.pagination}>{buttons}</div>;
  };

  if (loading) return <p className={styles.loading}>Loading products...</p>;
  if (error)
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => navigate("/category/all")}>
          View All Products
        </button>
      </div>
    );
  if (!category)
    return (
      <div className={styles.error}>
        <p>Category not found.</p>
        <button onClick={() => navigate("/category/all")}>
          View All Products
        </button>
      </div>
    );

  return (
    <>
      <div className={styles.categoryPage}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <h3>Filters</h3>
            <div className={styles.filterSection}>
              <h4>Price Range</h4>
              <div className={styles.priceRange}>
                <Slider
                  range
                  min={0}
                  max={15000}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  trackStyle={[{ backgroundColor: "var(--primary-color)" }]}
                  handleStyle={[
                    { borderColor: "var(--primary-color)" },
                    { borderColor: "var(--primary-color)" },
                  ]}
                  railStyle={{ backgroundColor: "var(--border-color)" }}
                />
                <div className={styles.priceRangeValues}>
                  <span>{priceRange[0]} $</span>
                  <span>-</span>
                  <span>{priceRange[1]} $</span>
                </div>
              </div>
            </div>
            <div className={styles.filterSection}>
              <h4>Brands</h4>
              {brands.map((brand) => (
                <label key={brand.id} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.name)}
                    onChange={() => handleBrandChange(brand.name)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
            <div className={styles.filterSection}>
              <h4>Sizes</h4>
              {sizes.map((size) => (
                <label key={size} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
            <button className={styles.resetButton} onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
          <div className={styles.mainContent}>
            <h2>{mapCategoryDisplay(category.name)}</h2>
            {searchQuery && (
              <div className={styles.searchResults}>
                <h3>Search results for: "{searchQuery}"</h3>
                {searchResults.length > 0 ? (
                  <div className={styles.productList}>
                    {searchResults.map((product) => (
                      <div key={product.id} className={styles.productItem}>
                        <div className={styles.imageContainer}>
                          {product.isBestSeller && (
                            <span className={styles.bestSellerBadge}>
                              BestSeller
                            </span>
                          )}
                          <img
                            src={
                              product.imageUrls?.[0]
                                ? `http://localhost:8080${product.imageUrls[0]}`
                                : "https://via.placeholder.com/250"
                            }
                            alt={product.name || "Unnamed product"}
                            className={styles.productImage}
                            onClick={() => navigate(`/product/${product.id}`)}
                          />
                        </div>
                        <div className={styles.title}>
                          {product.name || "Unnamed product"}
                        </div>
                        <div className={styles.category}>
                          {product.brandName || "Unknown brand"} -{" "}
                          {mapCategoryDisplay(
                            product.categoryName || "No category"
                          )}
                        </div>
                        <div className={styles.priceContainer}>
                          <span className={styles.priceCl}>
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
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
                            <span>Size: {productSizes[product.id] || "M"}</span>
                          </div>
                        </div>
                        <button
                          className={styles.addToCartBtn}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No matching products were found.</p>
                )}
                {renderPagination()}
              </div>
            )}
            <p>{category.description || "No description available."}</p>
            <div className={styles.productList}>
              {products.length === 0 ? (
                <div className={styles.noProducts}>
                  <p>No products found.</p>
                  <button
                    className={styles.viewAllButton}
                    onClick={() => navigate("/category/all")}
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.imageContainer}>
                      {product.isBestSeller && (
                        <span className={styles.bestSellerBadge}>
                          BestSeller
                        </span>
                      )}
                      <img
                        src={
                          product.imageUrls?.[0]
                            ? `http://localhost:8080${product.imageUrls[0]}`
                            : "https://via.placeholder.com/250"
                        }
                        alt={product.name || "Unnamed product"}
                        className={styles.productImage}
                        onClick={() => navigate(`/product/${product.id}`)}
                      />
                    </div>
                    <div className={styles.title}>
                      {product.name || "Unnamed product"}
                    </div>
                    <div className={styles.category}>
                      {product.brandName || "Unknown brand"} -{" "}
                      {mapCategoryDisplay(product.categoryName || "No category")}
                    </div>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceCl}>
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
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
                        <span>Size: {productSizes[product.id] || "M"}</span>
                      </div>
                    </div>
                    <button
                      className={styles.addToCartBtn}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CategoryPage;