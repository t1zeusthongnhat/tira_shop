import { useState } from "react";
import styles from "./styles.module.scss";

const VirtualTryOn = ({ isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState("default");
  const [garmentUploadType, setGarmentUploadType] = useState("single");
  const [showAssets, setShowAssets] = useState(true);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);

  if (!isOpen) return null;

  const handleImageHover = (index) => {
    setHoveredImage(index);
  };

  const handleImageLeave = () => {
    setHoveredImage(null);
  };

  // Mock function for demonstration
  const handleGenerateImage = () => {
    setGeneratedImages([
      { id: 1, url: "/placeholder-image-1.jpg", alt: "Generated outfit" },
      { id: 2, url: "/placeholder-image-2.jpg", alt: "Generated outfit" },
    ]);
  };

  return (
    <div className={styles.tryOnOverlay}>
      <div className={styles.tryOnContainer}>
        <div className={styles.header}>
          <h2>AI Virtual Try-On</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.mainContent}>
          {/* Left sidebar - matches Image 1 */}
          <div className={styles.sidebar}>
            <div className={styles.optionBlock}>
              <button className={styles.mainButton}>AI Outfit</button>
            </div>

            <div className={styles.optionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>👤</div>
                <div>Select a Model</div>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.optionButton} ${
                    selectedModel === "default" ? styles.active : ""
                  }`}
                  onClick={() => setSelectedModel("default")}
                >
                  Default
                </button>
                <button
                  className={`${styles.optionButton} ${
                    selectedModel === "upload" ? styles.active : ""
                  }`}
                  onClick={() => setSelectedModel("upload")}
                >
                  Upload
                </button>
              </div>
            </div>

            <div className={styles.optionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>👚</div>
                <div>Upload a Garment Image</div>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.optionButton} ${
                    garmentUploadType === "single" ? styles.active : ""
                  }`}
                  onClick={() => setGarmentUploadType("single")}
                >
                  Single Garment
                </button>
                <button
                  className={`${styles.optionButton} ${
                    garmentUploadType === "multiple" ? styles.active : ""
                  }`}
                  onClick={() => setGarmentUploadType("multiple")}
                >
                  Multiple Garments
                </button>
              </div>
            </div>

            <div className={styles.optionBlock}>
              <div className={styles.uploadArea}>
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadPlus}>+</div>
                  <div>Click or drop image</div>
                </div>
              </div>
              <button
                className={styles.generateButton}
                onClick={handleGenerateImage}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Main display area */}
          <div className={styles.displayArea}>
            {generatedImages.length > 0 ? (
              <div className={styles.generatedImagesGrid}>
                {generatedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={styles.imageContainer}
                    onMouseEnter={() => handleImageHover(index)}
                    onMouseLeave={handleImageLeave}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className={styles.generatedImage}
                    />

                    {hoveredImage === index && (
                      <div className={styles.imageHoverOverlay}>
                        <div className={styles.topActions}>
                          <button className={styles.actionButton}>👍</button>
                          <button className={styles.actionButton}>🔊</button>
                          <button className={styles.actionButton}>📤</button>
                          <button className={styles.actionButton}>⭐</button>
                          <button className={styles.actionButton}>💾</button>
                        </div>
                        <div className={styles.bottomActions}>
                          <button className={styles.imageActionButton}>
                            Bring to Life
                          </button>
                          <div className={styles.rightActions}>
                            <button className={styles.imageActionButton}>
                              Upscale
                            </button>
                            <button className={styles.imageActionButton}>
                              As Reference
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👚</div>
                <div className={styles.emptyText}>
                  Select a model and upload clothing items to see virtual try-on
                  results
                </div>
              </div>
            )}
          </div>

          {/* Right assets panel - matches Image 2 */}
          {showAssets && (
            <div className={styles.assetsPanel}>
              <div className={styles.assetHeader}>
                <div className={styles.headerTitle}>Assets</div>
                <div className={styles.headerControls}>
                  <button className={styles.actionButton}>⚙️</button>
                  <button className={styles.actionButton}>✖️</button>
                </div>
              </div>
              <div style={{ flex: 1 }}></div>
              <div
                className={styles.footer}
                style={{ justifyContent: "center", padding: "0.5rem" }}
              >
                <button className={styles.zoomButton}>«</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
