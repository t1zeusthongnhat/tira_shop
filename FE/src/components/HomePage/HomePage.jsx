import MyHeader from "../Header/Header";
import Footer from "../Footer/Footer";
import Brand from "../Brand/Brand";
import Men from "../Men/BannerGucciMen";
import Women from "../Women/BannerGucciWomen";
import Sneaker from "../Sneaker/Sneaker";
import PostList from "../PostList/PostList";
import ProductList from "../ProductItem/ProductList";
import ChatBox from "./ChatBox";
import AIButton from "./AIButton";
import { useAppContext } from "../../context/AppContext";

function HomePage() {
  const { isAuthenticated, addToCart } = useAppContext();

  return (
    <div className="homepage-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MyHeader />
      <div style={{ flex: '1 0 auto' }}>
        <Brand />
        <Men />
        <Sneaker />
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