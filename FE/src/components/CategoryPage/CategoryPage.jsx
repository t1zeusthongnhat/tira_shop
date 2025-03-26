import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import Footer from "../Footer/Footer";
import { useAppContext } from "../../Context/AppContext";

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, fetchCart } = useAppContext();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [productSizes, setProductSizes] = useState({});
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsSessionExpired(true);
      toast.error("Your session has expired. Please log in again.");
      navigate("/auth");
      return false;
    }
    return true;
  };

  const fetchCategories = useCallback(async () => {
    if (!checkToken()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/tirashop/category/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success" && data.data?.elementList) {
        setCategories(data.data.elementList);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      toast.error(`Error fetching categories: ${err.message}`);
    }
  }, [navigate, isSessionExpired]);

  const fetchBrands = useCallback(async () => {
    if (!checkToken()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/tirashop/brand/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success" && data.data) {
        
        setBrands(data.data);
      } else {
        toast.error(data.message || "Failed to fetch brands");
      }
    } catch (err) {
      toast.error(`Error fetching brands: ${err.message}`);
    }
  }, [navigate, isSessionExpired]);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    if (!checkToken()) {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      setCategory({
        name: "All Products",
        description: "View all products in the store.",
      });

      const productResponse = await fetch(
        `http://localhost:8080/tirashop/product`,
        { method: "GET", headers }
      );
      if (!productResponse.ok)
        throw new Error(`HTTP error! Status: ${productResponse.status}`);
      const productData = await productResponse.json();
      if (productData.status === "success") {
        const productsList = productData.data.elementList || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
        setProductSizes(
          productsList.reduce((acc, product) => {
            acc[product.id] = "M";
            return acc;
          }, {})
        );
      } else {
        throw new Error(productData.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [navigate, isSessionExpired]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchAllProducts();
  }, [fetchCategories, fetchBrands, fetchAllProducts]);

  useEffect(() => {
    if (location.state?.searchResults) {
      setSearchResults(location.state.searchResults);
      setSearchQuery(location.state.query || "");
    } else {
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.resetFilters) {
      resetFilters();
    }
  }, [location.state]);

  useEffect(() => {
    let filtered = products;
    if (priceRange[0] !== 0 || priceRange[1] !== 15000) {
      filtered = filtered.filter(
        (product) =>
          product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brandName)
      );
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.includes(product.size)
      );
    }
    setFilteredProducts(filtered);
  }, [priceRange, selectedBrands, selectedSizes, products]);

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

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) =>
      name === "min" ? [parseInt(value), prev[1]] : [prev[0], parseInt(value)]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleProductSizeChange = (productId, size) => {
    setProductSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = async (product) => {
    if (!checkToken()) return;
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
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
  };

  if (loading) return <p>Loading products...</p>;
  if (error)
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate("/category/all")}>
          View All Products
        </button>
      </div>
    );
  if (!category)
    return (
      <div>
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
                <input
                  type="number"
                  name="min"
                  value={priceRange[0]}
                  onChange={handlePriceRangeChange}
                  min="0"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  name="max"
                  value={priceRange[1]}
                  onChange={handlePriceRangeChange}
                  min="0"
                  placeholder="Max"
                />
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
                        <div className={styles.productImage}>
                          <img
                            src={
                              product.imageUrls?.[0]
                                ? `http://localhost:8080${product.imageUrls[0]}`
                                : "https://via.placeholder.com/250"
                            }
                            alt={product.name || "Unnamed product"}
                            onClick={() => navigate(`/product/${product.id}`)}
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <h3>{product.name || "Unnamed product"}</h3>
                          <p className={styles.productCategory}>
                            {product.brandName || "Unknown brand"} -{" "}
                            {mapCategoryDisplay(
                              product.categoryName || "No category"
                            )}
                          </p>
                          <p className={styles.productPrice}>
                            {product.price ? product.price.toFixed(2) : "N/A"} $
                          </p>
                          <div className={styles.sizeSelector}>
                            <label>Size:</label>
                            <select
                              value={productSizes[product.id] || "M"}
                              onChange={(e) =>
                                handleProductSizeChange(
                                  product.id,
                                  e.target.value
                                )
                              }
                            >
                              {sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            className={styles.addToCartBtn}
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No matching products were found.</p>
                )}
              </div>
            )}
            <p>{category.description || "No description available."}</p>
            <div className={styles.productList}>
              {filteredProducts.length === 0 ? (
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
                filteredProducts.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productImage}>
                      <img
                        src={
                          product.imageUrls?.[0]
                            ? `http://localhost:8080${product.imageUrls[0]}`
                            : "https://via.placeholder.com/250"
                        }
                        alt={product.name || "Unnamed product"}
                        onClick={() => navigate(`/product/${product.id}`)}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <h3>{product.name || "Unnamed product"}</h3>
                      <p className={styles.productCategory}>
                        {product.brandName || "Unknown brand"} -{" "}
                        {mapCategoryDisplay(
                          product.categoryName || "No category"
                        )}
                      </p>
                      <p className={styles.productPrice}>
                        {product.price ? product.price.toFixed(2) : "N/A"} $
                      </p>
                      <div className={styles.sizeSelector}>
                        <label>Size:</label>
                        <select
                          value={productSizes[product.id] || "M"}
                          onChange={(e) =>
                            handleProductSizeChange(product.id, e.target.value)
                          }
                        >
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className={styles.addToCartBtn}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CategoryPage;
