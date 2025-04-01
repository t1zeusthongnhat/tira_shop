import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import ProductReview from "../ProductReview/ProductReview";
import Footer from "../Footer/Footer";
import FixedHeader from "../Header/FixedHeader";
import Cart from "../Cart/Cart";
import { useAppContext } from "../../Context/AppContext";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import heart from "../../assets/icons/images/heart.png";

const responsiveMain = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const responsiveThumbnails = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 4 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 3 },
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, setIsSidebarOpen, fetchCart } = useAppContext();
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!isAuthenticated) {
         
          navigate("/auth");
          return;
        }

        const productResponse = await fetch(
          `http://localhost:8080/tirashop/product/get/${id}`
        );
        const productData = await productResponse.json();
        console.log("Product data:", productData);
        if (productData.status === "success" && productData.data) {
          setProduct(productData.data);
        } else {
          setError(productData.message || "Failed to fetch product");
          toast.error(productData.message || "Failed to fetch product", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        const imagesResponse = await fetch(
          `http://localhost:8080/tirashop/product/${id}/images`
        );
        const imagesData = await imagesResponse.json();
        console.log("Images data:", imagesData);
        if (imagesData.status === "success" && imagesData.data) {
          setImageUrls(imagesData.data.map((img) => img.url));
        } else {
          setImageUrls([]);
          console.warn("No images found for this product:", imagesData.message);
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Error fetching data: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/auth");
      return;
    }

    setIsAdding(true);
    try {
      const parsedProductId = parseInt(product.id);
      if (isNaN(parsedProductId)) {
        toast.error("Invalid product ID", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const validSizes = ["S", "M", "L"];
      if (!validSizes.includes(selectedSize)) {
        toast.error("Invalid size. Please select S, M, or L.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await fetch("http://localhost:8080/tirashop/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: parsedProductId,
          quantity: 1,
          productSize: selectedSize,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Product added to cart!", {
          position: "top-right",
          autoClose: 3000,
        });
        await fetchCart();
        setIsSidebarOpen(true);
      } else {
        setError(data.message || "Failed to add to cart");
        toast.error(data.message || "Failed to add to cart", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading product details...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h3>Something went wrong</h3>
        <p>Error: {error}</p>
        <button
          className={styles.retryBtn}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );

  if (!product)
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>?</div>
        <h3>Product Not Found</h3>
        <p>We couldn`t find the product you`re looking for.</p>
        <button
          className={styles.retryBtn}
          onClick={() => navigate("/products")}
        >
          Browse Products
        </button>
      </div>
    );

  return (
    <>
      <FixedHeader />
      <Cart />
      <div className={styles.productDetailPage}>
        <div className={styles.breadcrumbs}>
          <span onClick={() => navigate("/")}>Home</span>
          <span className={styles.separator}>/</span>
          <span onClick={() => navigate("/products")}>Products</span>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{product.name}</span>
        </div>

        <div className={styles.productDetailContainer}>
          <div className={styles.productDetail}>
            <div className={styles.imageGallery}>
              <div className={styles.mainImage}>
                <Carousel
                  responsive={responsiveMain}
                  infinite={true}
                  autoPlay={false}
                  autoPlaySpeed={5000}
                  className={styles.mainCarousel}
                  selectedItem={selectedImageIndex}
                  onSlideChange={(nextSlide) =>
                    setSelectedImageIndex(nextSlide)
                  }
                  arrows
                  showDots
                >
                  {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                      <div className={styles.mainImageWrapper} key={index}>
                        <img
                          src={`http://localhost:8080${url}`}
                          alt={`${product.name} ${index + 1}`}
                          className={styles.productImage}
                          onError={(e) => {
                            console.error(`Image load failed for ${url}`, e);
                            e.target.src =
                              "https://via.placeholder.com/500?text=Product+Image";
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className={styles.mainImageWrapper}>
                      <img
                        src="https://via.placeholder.com/500?text=No+Image+Available"
                        alt="No image available"
                        className={styles.productImage}
                      />
                    </div>
                  )}
                </Carousel>
              </div>

              {imageUrls.length > 1 && (
                <div className={styles.thumbnailGallery}>
                  <Carousel
                    responsive={responsiveThumbnails}
                    infinite={false}
                    draggable={true}
                    swipeable={true}
                    className={styles.thumbnailCarousel}
                    centerMode={false}
                  >
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className={`${styles.thumbnailItem} ${
                          selectedImageIndex === index ? styles.active : ""
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <img
                          src={`http://localhost:8080${url}`}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className={styles.thumbnailImage}
                          onError={(e) => {
                            console.error(
                              `Thumbnail load failed for ${url}`,
                              e
                            );
                            e.target.src =
                              "https://via.placeholder.com/100?text=Thumbnail";
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
            </div>

            <div className={styles.productInfo}>
              <div className={styles.productHeader}>
                <h2>{product.name}</h2>
                <p className={styles.brandCategory}>
                  <span className={styles.brand}>{product.brandName}</span>
                  <span className={styles.divider}></span>
                  <span className={styles.category}>
                    {product.categoryName}
                  </span>
                </p>
                <div className={styles.price}>${product.price.toFixed(2)}</div>
              </div>

              <div className={styles.productMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>SKU:</span>
                  <span className={styles.metaValue}>PRD-{product.id}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Availability:</span>
                  <span className={styles.metaValue}>In Stock</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.description}>
                <h3>Description</h3>
                <p>
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>

              <div className={styles.productOptions}>
                <div className={styles.sizeSelector}>
                  <label>Size:</label>
                  <div className={styles.sizeOptions}>
                    <button
                      className={`${styles.sizeBtn} ${
                        selectedSize === "S" ? styles.active : ""
                      }`}
                      onClick={() => setSelectedSize("S")}
                    >
                      S
                    </button>
                    <button
                      className={`${styles.sizeBtn} ${
                        selectedSize === "M" ? styles.active : ""
                      }`}
                      onClick={() => setSelectedSize("M")}
                    >
                      M
                    </button>
                    <button
                      className={`${styles.sizeBtn} ${
                        selectedSize === "L" ? styles.active : ""
                      }`}
                      onClick={() => setSelectedSize("L")}
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.actionWrapper}>
                {isAuthenticated ? (
                  <button
                    onClick={handleAddToCart}
                    className={styles.addToCartBtn}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <span className={styles.addingText}>
                        <span className={styles.loadingDot}></span>
                        <span className={styles.loadingDot}></span>
                        <span className={styles.loadingDot}></span>
                      </span>
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className={styles.addToCartBtn}
                  >
                    Sign In to Add
                  </button>
                )}

                <button className={styles.wishlistBtn}>
                  <img
                    src={heart}
                    alt="Wishlist"
                    className={styles.heartIcon}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <ProductReview />
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;