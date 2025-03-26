import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/email/forget-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: emailOrPhone }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.message ||
            `Yêu cầu thất bại với mã trạng thái ${response.status}`
        );
        toast.error(data.message || "Không thể gửi mã OTP. Vui lòng thử lại.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Forget Password Response:", data);

      if (response.status === 200 && data.status === "success") {
        toast.success("Mã OTP đã được gửi đến email của bạn!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/verify-code", { state: { emailOrPhone } });
      } else {
        setError(data.message || "Không thể gửi mã OTP.");
        toast.error(data.message || "Không thể gửi mã OTP.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi email đặt lại mật khẩu:", err);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
      toast.error("Lỗi kết nối server: " + err.message, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className="forgot-password-title">🔑 Đặt lại mật khẩu</h2>
        <p className="forgot-password-desc">
          Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            className="forgot-password-input"
          />
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="forgot-password-btn"
            disabled={isLoading}
          >
            {isLoading ? "Đang gửi..." : "Tiếp theo"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
