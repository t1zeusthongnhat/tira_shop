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

  const emailOrPhone = location.state?.emailOrPhone || "your email/phone";
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

    // Client-side validation
    if (!validatePassword(password)) {
      setError(
        "Password must be 8-16 characters, include at least one uppercase and one lowercase letter, and contain only standard characters."
      );
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
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

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (jsonError) {
          console.warn("Response is not JSON:", jsonError);
        }
        setError(errorMessage);
        toast.error(errorMessage || "Failed to reset password.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Reset Password Response:", data);

      if (response.status === 200 && data.status === "success") {
        toast.success("Password reset successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
      } else {
        setError(data.message || "Failed to reset password.");
        toast.error(data.message || "Failed to reset password.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error resetting password:", err);
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
    <div className="set-new-password-container">
      <div className="set-new-password-box">
        <h2 className="set-new-password-title">
          <span className="lock-icon">🔑</span> Set New Password
        </h2>
        <p className="set-new-password-desc">
          Create a new password for{" "}
          <span className="highlight">{emailOrPhone}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="password-input"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="password-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <ul className="password-requirements">
            <li>At least 1 uppercase letter</li>
            <li>At least 1 1 lowercase letter</li>
            <li>8-16 characters</li>
            <li>Only letters, numbers, and common symbols</li>
          </ul>

          <button
            type="submit"
            className="confirm-button"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetNewPasswordPage;