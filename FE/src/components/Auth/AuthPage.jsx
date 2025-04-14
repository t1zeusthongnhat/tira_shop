import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Components from "../Auth/Component.js";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect, useRef } from "react";

// Hàm giải mã JWT để lấy payload
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]; // Lấy phần payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

function AuthPage() {
  const { setIsAuthenticated, isAuthenticated, setIsMenuOpen } = useAppContext();
  const [signIn, setSignIn] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const popupRef = useRef(null);
  const currentProviderRef = useRef(null);

  // Chuyển hướng khi isAuthenticated thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      console.log("isAuthenticated is true, navigating to /");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Xử lý postMessage từ popup (OAuth login)
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received message from popup:", event.data, "Origin:", event.origin);

      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (err) {
          console.error("Failed to parse message data:", err);
          return;
        }
      }

      if (data && data.token) {
        console.log("Token received:", data.token);
        const decodedToken = decodeJWT(data.token); // Giải mã token
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", decodedToken?.userId || "unknown"); // Lưu userId từ token
        localStorage.setItem("username", data.username || "social-user");
        setIsAuthenticated(true);
        setIsMenuOpen(false); // Đóng menu sau khi đăng nhập OAuth

        const provider = currentProviderRef.current || "social";
        toast.success(`Login with ${provider} successful!`, {
          position: "top-right",
          autoClose: 3000,
        });

        if (popupRef.current) {
          popupRef.current.close();
          popupRef.current = null;
        }
      } else {
        console.error("No token found in message data:", data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setIsAuthenticated, setIsMenuOpen]);

  // Kiểm tra token khi tải trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      console.log("Found token in localStorage, validating...");
      validateToken(token).then((isValid) => {
        if (isValid) {
          console.log("Token is valid, setting isAuthenticated to true");
          setIsAuthenticated(true);
          setIsMenuOpen(false); // Đóng menu nếu đã có token hợp lệ
          toast.info("You are already logged in", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          console.log("Token is invalid, clearing localStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          setIsAuthenticated(false);
        }
      });
    }
  }, [setIsAuthenticated, setIsMenuOpen]);

  const validateToken = async (token) => {
    try {
      console.log("Validating token:", token);
      const response = await fetch(
        "http://localhost:8080/tirashop/auth/validate-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("Validate token response:", response.status, data);
      return response.status === 200 && data.status === "success";
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi nhấp vào container để đóng menu
  const handleContainerClick = (e) => {
    if (e.target.closest("form") || e.target.closest("button")) {
      return;
    }
    console.log("Container clicked, closing menu");
    setIsMenuOpen(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (signIn) {
      if (!formData.username || !formData.password) {
        setError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
    } else {
      if (
        !formData.username ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.email ||
        !formData.phoneNumber ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.dateOfBirth
      ) {
        setError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
    }

    const url = signIn
      ? "http://localhost:8080/tirashop/auth/login"
      : "http://localhost:8080/tirashop/auth/register-new-user";

    try {
      const payload = signIn
        ? { username: formData.username, password: formData.password }
        : {
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            email: formData.email,
            phone: formData.phoneNumber,
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
          };

      console.log("Sending request to:", url, "with payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      console.log("Response from", url, ":", response.status, data);

      if (response.status === 200 && data.status === "success") {
        if (signIn) {
          if (data.data?.token) {
            const decodedToken = decodeJWT(data.data.token); // Giải mã token
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("userId", decodedToken?.userId || "unknown"); // Lưu userId từ token
            localStorage.setItem("username", formData.username);
            setIsAuthenticated(true);
            setIsMenuOpen(false); // Đóng menu sau khi đăng nhập form
            toast.success("Login successful!", {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            setError("Login successful but no token received.");
          }
        } else {
          try {
            const emailPayload = {
              toEmail: formData.email,
              username: formData.username,
            };
            console.log("Sending email request with payload:", emailPayload);

            const emailResponse = await fetch(
              "http://localhost:8080/api/email/send-registration",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload),
              }
            );
            const emailData = await emailResponse.json();

            console.log("Email response:", emailResponse.status, emailData);

            if (emailResponse.status === 200 && emailData.status === "success") {
              toast.success("Registration successful! Welcome email sent.", {
                position: "top-right",
                autoClose: 3000,
              });
            } else {
              throw new Error(
                emailData.message || "Failed to send registration email"
              );
            }
          } catch (emailError) {
            console.error("Failed to send email:", emailError);
            toast.warn("Registration successful but email sending failed.", {
              position: "top-right",
              autoClose: 3000,
            });
          }

          const loginResponse = await fetch(
            "http://localhost:8080/tirashop/auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: formData.username,
                password: formData.password,
              }),
            }
          );
          const loginData = await loginResponse.json();

          console.log("Login response after registration:", loginData);

          if (
            loginResponse.status === 200 &&
            loginData.status === "success" &&
            loginData.data?.token
          ) {
            const decodedToken = decodeJWT(loginData.data.token); // Giải mã token
            localStorage.setItem("token", loginData.data.token);
            localStorage.setItem("userId", decodedToken?.userId || "unknown"); // Lưu userId từ token
            localStorage.setItem("username", formData.username);
            setIsAuthenticated(true);
            setIsMenuOpen(false); // Đóng menu sau khi đăng ký và đăng nhập
          }
        }
      } else {
        setError(data.message || "Authentication failed. Please try again.");
        toast.error(data.message || "Authentication failed", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Server error:", err);
      setError("Unable to connect to server. Please try again later.");
      toast.error("Server connection error: " + err.message, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (isAuthenticated) {
      toast.info("You are already logged in!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
      return;
    }

    currentProviderRef.current = provider;

    const authUrl =
      provider === "google"
        ? "http://localhost:8080/oauth2/authorization/google"
        : "http://localhost:8080/oauth2/authorization/facebook";

    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "Social Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    popupRef.current = popup;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage:
          "url(https://americanaatbrand.com/wp-content/uploads/2023/08/AAB_Gucci-Blog_1920x1080_1_Header.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onClick={handleContainerClick}
    >
      <Components.Container>
        <Components.SignUpContainer signinIn={signIn}>
          <Components.Form onSubmit={handleAuth}>
            <Components.Title>Create Account</Components.Title>
            <Components.Row>
              <Components.HalfInput
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Components.HalfInput
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Components.Row>
            <Components.Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Components.Input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <Components.Row>
              <Components.HalfInput
                as="select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Components.HalfInput>
              <Components.HalfInput
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </Components.Row>
            <Components.Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Components.Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Components.Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {error && <Components.ErrorMessage>{error}</Components.ErrorMessage>}
            <Components.Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign Up"}
            </Components.Button>
          </Components.Form>
        </Components.SignUpContainer>

        <Components.SignInContainer signinIn={signIn}>
          <Components.Form onSubmit={handleAuth}>
            <Components.Title>Sign In</Components.Title>
            <Components.Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Components.Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <Components.ErrorMessage>{error}</Components.ErrorMessage>}
            <Components.Anchor
              href="#"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot your password?
            </Components.Anchor>
            <Components.Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign In"}
            </Components.Button>
            <Components.SocialDivider>Or sign in with</Components.SocialDivider>
            <Components.SocialButton onClick={() => handleSocialLogin("google")}>
              <FaGoogle style={{ marginRight: "10px" }} />
              Sign in with Google
            </Components.SocialButton>
            <Components.SocialButton
              onClick={() => handleSocialLogin("facebook")}
            >
              <FaFacebookF style={{ marginRight: "10px" }} />
              Sign in with Facebook
            </Components.SocialButton>
          </Components.Form>
        </Components.SignInContainer>

        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>
            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title>Tira Shop</Components.Title>
              <Components.Paragraph>
                You already have an account!
              </Components.Paragraph>
              <Components.GhostButton onClick={() => setSignIn(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Tira Shop</Components.Title>
              <Components.Paragraph>
                Don't have an account yet?
              </Components.Paragraph>
              <Components.GhostButton onClick={() => setSignIn(false)}>
                Sign Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>
    </div>
  );
}

export default AuthPage;