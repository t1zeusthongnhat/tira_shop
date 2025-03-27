import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import voiceIcon from "../../assets/icons/images/voice.png";
import imageSearchIcon from "../../assets/icons/images/imageSearch.png";

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en"); // State để lưu ngôn ngữ

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const handleVoiceSearch = () => {
    if (!SpeechRecognition) {
      toast.error(
        "Your browser does not support voice recognition. Please use Chrome or Edge."
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to search for products.");
      navigate("/auth");
      return;
    }

    recognition.lang = language === "en" ? "en-US" : "vi-VN"; // Chọn ngôn ngữ
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      toast.info(`You said: "${transcript}"`);
      searchProducts(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const searchProducts = async (query) => {
    try {
      if (!query || query.trim() === "") {
        toast.error("Please provide a search keyword.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to search for products.");
        navigate("/auth");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/tirashop/product?name=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
        toast.error(
          data.message || "Unable to search for products. Please try again."
        );
      }
    } catch (err) {
      toast.error(`Search error: ${err.message}`);
    }
  };

  const handleImageSearch = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select an image to search.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to search for products.");
      navigate("/auth");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/tirashop/search/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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
        toast.error(
          data.message || "Unable to search by image. Please try again."
        );
      }
    } catch (err) {
      toast.error(`Image search error: ${err.message}`);
    }
  };

  const handleKeyPressSearch = (event) => {
    if (event.key === "Enter") {
      searchProducts(event.target.value);
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
        {/* Dropdown chọn ngôn ngữ */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles.languageSelect}
        >
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
        </select>

        <button
          className={styles.iconButton}
          onClick={handleVoiceSearch}
          disabled={isListening}
        >
          <img src={voiceIcon} alt="Voice Search" width="22" height="22" />
          {isListening && <span>Listening...</span>}
        </button>

        <button className={styles.iconButton} onClick={handleImageSearch}>
          <img
            src={imageSearchIcon}
            alt="Image Search"
            width="22"
            height="22"
          />
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
    </div>
  );
};

export default Search;