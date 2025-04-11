import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import Footer from "../Footer/Footer";

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [purchasedItems, setPurchasedItems] = useState([]); 
  const [pendingItems, setPendingItems] = useState([]); 
  const [cancelledItems, setCancelledItems] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Hàm để xử lý URL hình ảnh
  const getImageUrl = (imageUrl) => {
    // Nếu không có URL, trả về ảnh placeholder
    if (!imageUrl) {
      return "https://via.placeholder.com/150";
    }

    // Nếu là URL tuyệt đối, trả về trực tiếp
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Nếu là URL tương đối, thêm base URL của backend
    return `http://localhost:8080${imageUrl}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your order history");
      navigate("/auth");
      return;
    }
    fetchOrderHistory();
  }, [navigate]);

  // Lấy dữ liệu đơn hàng từ các endpoint
  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Lấy danh sách đơn hàng hoàn tất (purchased)
      const purchasedResponse = await fetch("http://localhost:8080/tirashop/orders/purchased", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const purchasedData = await purchasedResponse.json();
      if (purchasedData.status === "success") {
        setPurchasedItems(purchasedData.data || []);
      } else {
        toast.error(purchasedData.message || "Failed to fetch purchased items");
      }

      // Lấy danh sách đơn hàng đang chờ (pending)
      const pendingResponse = await fetch("http://localhost:8080/tirashop/orders/pending", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const pendingData = await pendingResponse.json();
      if (pendingData.status === "success") {
        setPendingItems(pendingData.data || []);
      } else {
        toast.error(pendingData.message || "Failed to fetch pending items");
      }

      // Lấy danh sách đơn hàng đã hủy (cancelled)
      const cancelledResponse = await fetch("http://localhost:8080/tirashop/orders/cancelled", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cancelledData = await cancelledResponse.json();
      if (cancelledData.status === "success") {
        setCancelledItems(cancelledData.data || []);
      } else {
        toast.error(cancelledData.message || "Failed to fetch cancelled items");
      }
    } catch (err) {
      toast.error("Error fetching order history: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị danh sách sản phẩm
  const renderOrderItems = (items, title) => (
    <div className={styles.orderSection}>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>No items found in this category.</p>
      ) : (
        <div className={styles.orderItems}>
          {items.map((item) => {
            // Log để debug
            console.log('Item Image:', item.productImage);
            
            return (
              <div key={item.productId} className={styles.orderItem}>
                <div className={styles.itemImageContainer}>
                  <img
                    src={getImageUrl(item.productImage)}
                    alt={item.productName || "Product"}
                    className={styles.itemImage}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                      console.error('Image load error:', item.productImage);
                    }}
                  />
                  <span className={styles.itemQuantity}>{item.quantity}</span>
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.productName || "Unknown Product"}</h3>
                  <p>Brand: {item.brandName || "N/A"}</p>
                  <p>Category: {item.categoryName || "N/A"}</p>
                  <p>Size: {item.size || "N/A"}</p>
                  <p>Price: ${item.price?.toFixed(2) || "0.00"}</p>
                  <p>Quantity: {item.quantity || 0}</p>
                  <p>Purchased on: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.orderHistoryPageWrapper}>
      <div className={styles.orderHistoryPage}>
        <h1>Order History</h1>

        {loading ? (
          <p>Loading your order history...</p>
        ) : (
          <>
            {renderOrderItems(pendingItems, "Pending Orders")}
            {renderOrderItems(purchasedItems, "Purchased")}
          
          </>
        )}

        <div className={styles.backToShop}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderHistoryPage;