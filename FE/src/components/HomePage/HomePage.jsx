import MyHeader from "../Header/Header";
import Footer from "../Footer/Footer";
import Brand from "../Brand/Brand";
import Men from "../Men/BannerGucciMen";
import Women from "../Women/BannerGucciWomen";
import Sneaker from "../Sneaker/Sneaker";
import PostList from "../PostList/PostList";
import ProductList from "../ProductItem/ProductList"; // Thêm ProductList
import ChatBox from "./ChatBox";
import AIButton from "./AIButton";
import { useAppContext } from "../../context/AppContext"; // Import context để sử dụng addToCart và isAuthenticated

function HomePage() {
  const { isAuthenticated, addToCart } = useAppContext(); // Lấy từ context

  return (
    <>
      <MyHeader />
      <Brand />
      <Men />
      <Sneaker />
      <Women />
      <ProductList
        handleAddToCart={addToCart}
        isAuthenticated={isAuthenticated}
      />{" "}
      {/* Thêm ProductList */}
      <PostList />
      <Footer />
      <AIButton />
      <ChatBox />
    </>
  );
}

export default HomePage;
