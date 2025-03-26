import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import "./SetNewPassword.css";

function SetNewPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailOrPhone = location.state?.emailOrPhone || "Your email/phone";
  const resetCode = location.state?.resetCode || "";

  const validatePassword = (password) => {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      password.length >= 8 &&
      password.length <= 16 &&
      /^[A-Za-z0-9!@#$%^&*()_+]*$/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!validatePassword(password)) {
      setError(
        "Mật khẩu phải dài 8-16 ký tự, bao gồm ít nhất một chữ cái in hoa và một chữ cái thường, và chỉ chứa các ký tự thông thường."
      );
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/email/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: emailOrPhone,
            resetCode: resetCode,
            newPassword: password,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.message ||
            `Yêu cầu thất bại với mã trạng thái ${response.status}`
        );
        toast.error(data.message || "Không thể đặt lại mật khẩu.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Reset Password Response:", data);

      if (response.status === 200 && data.status === "success") {
        toast.success("Đặt lại mật khẩu thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
      } else {
        setError(data.message || "Không thể đặt lại mật khẩu.");
        toast.error(data.message || "Không thể đặt lại mật khẩu.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Lỗi khi đặt lại mật khẩu:", err);
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
    <div className="set-new-password-container">
      <div className="set-new-password-box">
        <h2 className="set-new-password-title">Đặt Mật Khẩu Mới</h2>
        <p className="set-new-password-desc">
          Tạo mật khẩu mới cho <span className="highlight">{emailOrPhone}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="password-input"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="password-input"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <ul className="password-requirements">
            <li>Ít nhất 1 chữ cái in hoa</li>
            <li>Ít nhất 1 chữ cái thường</li>
            <li>Dài 8-16 ký tự</li>
            <li>Chỉ chứa chữ, số và ký tự thông thường</li>
          </ul>

          <button type="submit" className="confirm-button" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetNewPasswordPage;
