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

    recognition.lang = "en-US"; // Changed to English, adjust as needed
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
      // Check if query is empty
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

      const formData = new FormData();
      formData.append("file", query);

      const response = await fetch(
        "http://localhost:8080/tirashop/product?name=" + query,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          // body: formData, // Note: GET requests typically don’t have a body
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found.");
          navigate("/category/all", { state: { searchResults: [], query } });
        } else {
          // If products are found, navigate to CategoryPage
          navigate("/category/all", {
            state: { searchResults: products, query },
          });
        }
      } else {
        console.log("Error response:", data); // Log error response from backend
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

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      alert(`You selected an image: ${event.target.files[0].name}`);
    }
  };

  if (!isSearchOpen) return null;

  const handleKeyPesearch = (event) => {
    if (event.key === "Enter") {
      searchProducts(event.target.value);
    }
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="What are you looking for?"
        className={styles.searchInput}
        onKeyPress={handleKeyPesearch}
      />

      <div className={styles.searchIcons}>
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