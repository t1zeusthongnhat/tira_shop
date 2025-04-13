import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import voiceIcon from "../../assets/icons/images/voice.png";
import imageSearchIcon from "../../assets/icons/images/imageSearch.png";

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timeoutRef = useRef(null);

  const RECORDING_DURATION = 1500; // 1.5 giây

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          await sendVoiceSearch(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);

        // Tự động dừng sau 1.5 giây
        timeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
        }, RECORDING_DURATION);
      })
      .catch((err) => {
        toast.error(`Microphone access error: ${err.message}`);
        setIsRecording(false);
      });
  };

  const handleVoiceSearch = () => {
    if (!isRecording) {
      startRecording();
    }
  };

  const sendVoiceSearch = async (audioBlob) => {
    if (audioChunksRef.current.length === 0) {
      toast.error("No audio recorded.");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "voice-search.webm");
    formData.append("language", language);

    try {
      const response = await fetch("http://localhost:8080/tirashop/product/search", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found.");
          navigate("/category/all", { state: { searchResults: [], query: "Voice Search" } });
        } else {
          navigate("/category/all", { state: { searchResults: products, query: "Voice Search" } });
        }
      } else {
        toast.error(data.message || "Voice search failed.");
      }
    } catch (err) {
      toast.error(`Voice search error: ${err.message}`);
    }
  };

  // Dọn dẹp timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleImageSearch = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select an image to search.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8080/tirashop/product/search-by-image?page=0&size=10&sort=createdAt",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found for this image.");
          navigate("/category/all", { state: { searchResults: [], query: "Image Search" } });
        } else {
          navigate("/category/all", {
            state: { searchResults: products, query: "Image Search" },
          });
        }
      } else {
        console.log("Error response:", data);
        toast.error(data.message || "Unable to search by image. Please try again.");
      }
    } catch (err) {
      toast.error(`Image search error: ${err.message}`);
    }
  };

  const handleKeyPressSearch = async (event) => {
    if (event.key === "Enter") {
      const query = event.target.value;
      searchProducts(query, language);
    }
  };

  const searchProducts = async (query, searchLanguage = "en") => {
    try {
      if (!query || query.trim() === "") {
        toast.error("Please provide a search keyword.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/tirashop/product?name=${encodeURIComponent(query)}&language=${searchLanguage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found.");
          navigate("/category/all", { state: { searchResults: [], query } });
        } else {
          navigate("/category/all", { state: { searchResults: products, query } });
        }
      } else {
        console.log("Error response:", data);
        toast.error(data.message || "Unable to search for products. Please try again.");
      }
    } catch (err) {
      toast.error(`Search error: ${err.message}`);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="What are you looking for?"
        className={styles.searchInput}
        onKeyPress={handleKeyPressSearch}
      />

      <div className={styles.searchIcons}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles.languageSelect}
        >
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
        </select>

        <button
          className={`${styles.iconButton} ${isRecording ? styles.recording : ""}`}
          onClick={handleVoiceSearch}
          disabled={isRecording}
        >
          <img src={voiceIcon} alt="Voice Search" width="22" height="22" />
        </button>

        <button className={styles.iconButton} onClick={handleImageSearch}>
          <img src={imageSearchIcon} alt="Image Search" width="22" height="22" />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className={styles.hiddenFileInput}
          onChange={handleFileChange}
        />

        <button
          className={styles.closeSearch}
          onClick={() => setIsSearchOpen(false)}
        >
          ✖
        </button>
      </div>

      {isRecording && (
        <div className={styles.recordingOverlay}>
          <div className={styles.recordingIndicator}>
            <div className={styles.micContainer}>
              <img src={voiceIcon} alt="Microphone" className={styles.micIcon} />
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
            </div>
            <p>Speak now...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;