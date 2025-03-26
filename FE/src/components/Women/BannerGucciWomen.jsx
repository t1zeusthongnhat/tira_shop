import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

export default function BannerGucciWomen() {  
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/category/all")
  }
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.imgBanner}>
        <div className={styles.title}>
          <button className={styles.categoryButton} onClick={handleNavigate}>Women</button>
          <h1>Introducing An Ultra-Contemporary Style</h1>
          <h2>Versace</h2>
          <button className={styles.discoverButton} onClick={handleNavigate}>Discover More</button>
        </div>
      </div>
    </div>
  );
}
