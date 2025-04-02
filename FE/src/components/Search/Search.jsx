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
  const [language, setLanguage] = useState("en"); // Ngôn ngữ mặc định là tiếng Anh

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

    recognition.lang = language === "en" ? "en-US" : "vi-VN"; // Chọn ngôn ngữ
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      toast.info(`You said: "${transcript}"`);

      // Nếu là tiếng Việt, dịch sang tiếng Anh trước khi tìm kiếm
      if (language === "vi") {
        const translatedText = await translateToEnglish(transcript);
        searchProducts(translatedText, "en"); // Gửi từ khóa đã dịch với language=en
      } else {
        searchProducts(transcript, language); // Tiếng Anh thì gửi trực tiếp
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Hàm dịch từ tiếng Việt sang tiếng Anh
  const translateToEnglish = async (vietnameseText) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(vietnameseText)}&langpair=vi|en`
      );
      const data = await response.json();
      const translatedText = data.responseData.translatedText;
  
      return translatedText;
    } catch (err) {
      toast.error(`Translation error: ${err.message}`);
      return vietnameseText; // Nếu dịch thất bại, trả về nguyên văn bản gốc
    }
  };

  const searchProducts = async (query, searchLanguage = "en") => {
    try {
      if (!query || query.trim() === "") {
        toast.error("Please provide a search keyword.");
        return;
      }

      // Gửi yêu cầu tìm kiếm với ngôn ngữ được chọn
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8080/tirashop/product/search-by-image?page=0&size=10&sort=createdAt",
        {
          method: "POST",
          headers: {
            "accept": "*/*",
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
        toast.error(
          data.message || "Unable to search by image. Please try again."
        );
      }
    } catch (err) {
      toast.error(`Image search error: ${err.message}`);
    }
  };

  const handleKeyPressSearch = async (event) => {
    if (event.key === "Enter") {
      const query = event.target.value;
      if (language === "vi") {
        const translatedText = await translateToEnglish(query);
        searchProducts(translatedText, "en"); // Dịch sang tiếng Anh nếu là tiếng Việt
      } else {
        searchProducts(query, language); // Gửi trực tiếp nếu là tiếng Anh
      }
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