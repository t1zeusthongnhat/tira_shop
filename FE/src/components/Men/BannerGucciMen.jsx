import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";

export default function BannerGucciMen() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/category/all")
  }
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.imgBanner}>
        <div className={styles.title}>
          <button className={styles.categoryButton} onClick={handleNavigate}>Men</button>
          <h1>Introducing An Ultra-Contemporary Style</h1>
          <h2>Gucci</h2>
          <button className={styles.discoverButton} onClick={handleNavigate}>Discover More</button>
        </div>
      </div>
    </div>
  );
}
