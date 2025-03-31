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
console.log(emailOrPhone);
    try {
      const response = await fetch(
        "http://localhost:8080/api/email/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" }, // đổi sang text/plain
          body: emailOrPhone,        // gửi chuỗi JSON hóa (vẫn là string)
        }
      );
      

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || `Request failed with status ${response.status}`);
        toast.error(data.message || "Failed to send OTP. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Forget Password Response:", data);

      if (response.status === 200 && data.status === "success") {
        toast.success("OTP has been sent to your email!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/verify-code", { state: { emailOrPhone } });
      } else {
        setError(data.message || "Failed to send OTP.");
        toast.error(data.message || "Failed to send OTP.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError("Unable to connect to the server. Please try again later.");
      toast.error("Server connection error: " + err.message, {
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
        <h2 className="forgot-password-title">
          <span className="lock-icon">🔑</span> Reset Your Password
        </h2>
        <p className="forgot-password-desc">
          Enter your email to receive an OTP for password reset.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
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
            {isLoading ? "Sending..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;