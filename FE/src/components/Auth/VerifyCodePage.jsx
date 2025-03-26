import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import "./VerifyCode.css";

function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const emailOrPhone = location.state?.emailOrPhone || "Your email/phone";

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Chuyển focus sang ô tiếp theo nếu nhập số
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Chuyển focus về ô trước nếu xóa
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter" && otp.every((digit) => digit)) {
      // Gửi form nếu nhấn Enter và đã nhập đủ 6 số
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    console.log("Entered OTP:", otpCode);
    if (otpCode.length === 6) {
      navigate("/set-new-password", {
        state: { emailOrPhone, resetCode: otpCode },
      });
    } else {
      toast.error("Vui lòng nhập mã OTP 6 chữ số.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleResend = async () => {
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
        toast.error(data.message || "Không thể gửi lại mã OTP.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const data = await response.json();
      if (response.status === 200 && data.status === "success") {
        toast.success("Mã OTP đã được gửi lại thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(data.message || "Không thể gửi lại mã OTP.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi lại mã OTP:", err);
      toast.error("Lỗi kết nối server: " + err.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="verify-code-container">
      <div className="verify-code-box">
        <h2 className="verify-code-title">Nhập Mã Xác Nhận</h2>
        <p className="verify-code-desc">
          Mã xác nhận đã được gửi đến {emailOrPhone}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((num, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={num}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
              />
            ))}
          </div>

          <p className="verify-code-desc">Không nhận được mã?</p>
          <p
            className="verify-code-desc-1"
            onClick={handleResend}
            style={{ cursor: "pointer" }}
          >
            Gửi lại
          </p>

          <button
            type="submit"
            className="verify-code-btn"
            disabled={otp.includes("")}
          >
            TIẾP THEO
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyCodePage;
