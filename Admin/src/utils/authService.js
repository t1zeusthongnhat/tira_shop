import axios from "axios";

const API_URL = "http://localhost:8080/tirashop/auth/login";

// Đăng nhập và lưu token vào localStorage
export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, { username, password });

    console.log("Response từ backend:", response.data); // Debug response

    // Lấy token từ response
    if (response.data.data && response.data.data.token) {
      const token = response.data.data.token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Gửi token trong request
      return token;
    } else {
      console.warn("Không tìm thấy token trong response", response.data);
      return null;
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.response?.data || error.message);
    throw error;
  }
};

// Đăng xuất (Xóa token khỏi localStorage)
export const logout = () => {
  localStorage.removeItem("token");
  delete axios.defaults.headers.common["Authorization"];
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Trả về true nếu có token, ngược lại false
};

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Thiết lập token mặc định khi ứng dụng khởi chạy
export const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Gọi hàm này khi ứng dụng khởi chạy để giữ token
setAuthHeader();
