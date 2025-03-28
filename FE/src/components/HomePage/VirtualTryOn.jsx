import { useState, useRef, useEffect } from "react";
import { XCircle } from "lucide-react";
import styles from "./styles.module.scss";

const VirtualTryOn = ({ isOpen, onClose }) => {
  const [modelFile, setModelFile] = useState(null);
  const [modelPreview, setModelPreview] = useState(null);
  const [dressSource, setDressSource] = useState("product");
  const [dressFile, setDressFile] = useState(null);
  const [dressPreview, setDressPreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const modelInputRef = useRef(null);
  const dressInputRef = useRef(null);

  const BASE_URL = "http://localhost:8080";
  const PUBLIC_URL = "https://distinct-spider-cheaply.ngrok-free.app";

  useEffect(() => {
    if (!isOpen) return;
    setModelFile(null);
    setModelPreview(null);
    setDressFile(null);
    setDressPreview(null);
    setSelectedProduct(null);
    setGeneratedImage(null);
    setTaskId(null);
    setIsLoading(false);
    fetchProducts();
  }, [isOpen]);

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${BASE_URL}/tirashop/try-on/${taskId}`, {
            headers: {
              Accept: "image/*",
            },
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.startsWith("image/")) {
              const blob = await response.blob();
              const imageUrl = URL.createObjectURL(blob);
              setGeneratedImage(imageUrl);
              setIsLoading(false);
              clearInterval(interval);
            } else {
              const errorData = await response.json();
              console.error("Unexpected response:", errorData);
              setIsLoading(false);
              clearInterval(interval);
              alert("Failed to get try-on result: Unexpected response format");
            }
          } else {
            const errorText = await response.text();
            console.error(`Error: Received status ${response.status} - ${errorText}`);
            setIsLoading(false);
            clearInterval(interval);
            alert(`Failed to get try-on result: ${errorText}`);
          }
        } catch (error) {
          console.error("Error checking status:", error);
          setIsLoading(false);
          clearInterval(interval);
          alert("An error occurred while checking the result.");
        }
      }, 13000);

      return () => clearInterval(interval);
    }
  }, [taskId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tirashop/product`);
      const data = await response.json();
      if (data.status === "success") {
        const productsWithFullUrls = data.data.elementList.map(product => ({
          ...product,
          imageUrls: product.imageUrls.map(url => `${BASE_URL}${url}`)
        }));
        setProducts(productsWithFullUrls);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    setModelFile(file);
    setModelPreview(URL.createObjectURL(file));
  };

  const handleDressUpload = (e) => {
    const file = e.target.files[0];
    setDressFile(file);
    setSelectedProduct(null);
    setDressPreview(URL.createObjectURL(file));
  };

  const clearModelImage = () => {
    setModelFile(null);
    setModelPreview(null);
  };

  const clearDressImage = () => {
    setDressFile(null);
    setDressPreview(null);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setDressFile(null);
    setDressPreview(null);
  };

  const handleGenerateImage = async () => {
    if (!modelFile) return alert("Please upload a model image");
    if (dressSource === "upload" && !dressFile) return alert("Please upload a dress image");
    if (dressSource === "product" && !selectedProduct) return alert("Please select a product");

    // Xóa ảnh cũ trước khi generate ảnh mới
    if (generatedImage) {
      URL.revokeObjectURL(generatedImage);
      setGeneratedImage(null);
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("modelImage", modelFile);
    formData.append("useImageUrl", dressSource === "product");

    if (dressSource === "upload") {
      formData.append("dressImage", dressFile);
    } else {
      const localUrl = selectedProduct.imageUrls[0];
      const publicUrl = localUrl.replace(BASE_URL, PUBLIC_URL);
      formData.append("dressImageUrl", publicUrl);
    }

    try {
      const response = await fetch(`${BASE_URL}/tirashop/try-on`, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();

      if (response.ok) {
        const newTaskId = result.split("task_id: ")[1];
        setTaskId(newTaskId);
      } else {
        alert(result);
        setIsLoading(false);
      }
    } catch (error) {
      alert("Failed to generate virtual try-on");
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'virtual-try-on-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClearGenerated = () => {
    if (generatedImage) {
      URL.revokeObjectURL(generatedImage);
      setGeneratedImage(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.tryOnOverlay}>
      <div className={styles.tryOnContainer}>
        <div className={styles.header}>
          <h2>AI Virtual Try-On</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.sidebar}>
            <div className={styles.optionBlock}>
              <div className={styles.sectionHeader}>👤 Upload Model Image</div>
              <div className={styles.uploadArea}>
                <input 
                  type="file" 
                  ref={modelInputRef} 
                  onChange={handleModelUpload} 
                  accept="image/*" 
                  hidden 
                />
                <div 
                  className={styles.uploadPlaceholder} 
                  onClick={() => modelInputRef.current.click()}
                >
                  {modelPreview ? (
                    <div className={styles.previewWrapper}>
                      <img 
                        src={modelPreview} 
                        alt="Model" 
                        className={styles.previewImage} 
                      />
                      <button 
                        className={styles.clearButton} 
                        onClick={clearModelImage}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.uploadPlus}>+</div>
                      <div>{modelFile ? modelFile.name : "Click to upload model image"}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.optionBlock}>
              <div className={styles.sectionHeader}>👚 Select Dress</div>
              <div className={styles.buttonGroup}>
                <button 
                  className={`${styles.optionButton} ${dressSource === "upload" ? styles.active : ""}`} 
                  onClick={() => setDressSource("upload")}
                >
                  Upload
                </button>
                <button 
                  className={`${styles.optionButton} ${dressSource === "product" ? styles.active : ""}`} 
                  onClick={() => setDressSource("product")}
                >
                  Use Product
                </button>
              </div>

              {dressSource === "upload" ? (
                <div className={styles.uploadArea}>
                  <input 
                    type="file" 
                    ref={dressInputRef} 
                    onChange={handleDressUpload} 
                    accept="image/*" 
                    hidden 
                  />
                  <div 
                    className={styles.uploadPlaceholder} 
                    onClick={() => dressInputRef.current.click()}
                  >
                    {dressPreview ? (
                      <div className={styles.previewWrapper}>
                        <img 
                          src={dressPreview} 
                          alt="Dress" 
                          className={styles.previewImage} 
                        />
                        <button 
                          className={styles.clearButton} 
                          onClick={clearDressImage}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.uploadPlus}>+</div>
                        <div>{dressFile ? dressFile.name : "Click to upload dress image"}</div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.productSection}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {selectedProduct && (
                    <div className={styles.selectedProductPreview}>
                      <img
                        src={selectedProduct.imageUrls[0]}
                        alt={selectedProduct.name}
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                  <div className={styles.productGrid}>
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`${styles.productItem} ${selectedProduct?.id === product.id ? styles.selected : ""}`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className={styles.productImage}
                        />
                        <div className={styles.productName}>{product.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className={styles.generateButton} 
                onClick={handleGenerateImage} 
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          <div className={styles.displayArea}>
            {generatedImage ? (
              <div className={styles.resultContainer}>
                <img 
                  src={generatedImage} 
                  alt="Try-On Result" 
                  style={{ border: 'none' }} // Loại bỏ viền ảnh
                />
                <div className={styles.resultButtons}>
                  <button 
                    className={styles.actionButton}
                    onClick={handleDownload}
                  >
                    Download
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={handleClearGenerated}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <div>Generating your virtual try-on...</div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👚</div>
                <div className={styles.emptyText}>
                  Upload a model image and select a dress to see the result
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;