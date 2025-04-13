import MyHeader from "../Header/Header";
import Footer from "../Footer/Footer";
import Brand from "../Brand/Brand";
import Men from "../Men/BannerGucciMen";
import Women from "../Women/BannerGucciWomen";
import PostList from "../PostList/PostList";
import ProductList from "../ProductItem/ProductList";
import ChatBox from "./ChatBox";
import AIButton from "./AIButton";
import { useAppContext } from "../../context/AppContext";
import BestSellerProductList from "../BestSellerProductList/BestSellerProductList";
import { useEffect } from "react";

function HomePage() {
  const { isAuthenticated, addToCart, setIsMenuOpen } = useAppContext();

  // Đóng menu khi isAuthenticated thay đổi (đặc biệt là sau khi đăng xuất)
  useEffect(() => {
    console.log("isAuthenticated changed:", isAuthenticated);
    if (!isAuthenticated) {
      setIsMenuOpen(false); // Đóng menu nếu không đăng nhập
    }
  }, [isAuthenticated, setIsMenuOpen]);

  // Đóng menu khi nhấp vào container của HomePage
  const handleContainerClick = (e) => {
    // Ngăn sự kiện lan truyền từ các thành phần con (như nút trong MyHeader)
    if (e.target.closest("header") || e.target.closest("button") || e.target.closest("li")) {
      return;
    }
    console.log("HomePage container clicked, closing menu");
    setIsMenuOpen(false);
  };

  return (
    <div
      className="homepage-container"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      onClick={handleContainerClick} // Gắn sự kiện onClick để đóng menu
    >
      <MyHeader />
      <div style={{ flex: "1 0 auto" }}>
        <Brand />
        <Men />
        <BestSellerProductList />
        <Women />
        <ProductList handleAddToCart={addToCart} isAuthenticated={isAuthenticated} />
        <PostList />
      </div>
      <Footer />
      <AIButton />
      <ChatBox />
    </div>
  );
}

export default HomePage;