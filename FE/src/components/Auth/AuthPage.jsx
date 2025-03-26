import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Components from "../Auth/Component.js";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useAppContext } from "../../context/AppContext";

function AuthPage() {
  const { setIsAuthenticated } = useAppContext();
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      validateToken(token).then((isValid) => {
        if (isValid) {
          setIsAuthenticated(true);
          toast.info("You are already logged in", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          setIsAuthenticated(false);
        }
      });
    }
  }, [navigate, setIsAuthenticated]);

  const validateToken = async (token) => {
    try {
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
      return response.status === 200 && data.status === "success";
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      console.log("Sending data to API:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.status === 200 && data.status === "success") {
        if (signIn) {
          if (data.data && data.data.token) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("userId", data.data.userId || "unknown");
            localStorage.setItem("username", formData.username);
            setIsAuthenticated(true);
            toast.success("Login successful!", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/");
          } else {
            setError(
              "Login successful but no token received. Please try again."
            );
            toast.error("No token received. Please try again.", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else {
          // Registration successful, now log the user in automatically
          const loginPayload = {
            username: formData.username,
            password: formData.password,
          };

          const loginResponse = await fetch(
            "http://localhost:8080/tirashop/auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loginPayload),
            }
          );

          const loginData = await loginResponse.json();
          console.log("Login Response Status:", loginResponse.status);
          console.log("Login Response Data:", loginData);

          if (loginResponse.status === 200 && loginData.status === "success") {
            if (loginData.data && loginData.data.token) {
              const token = loginData.data.token;
              localStorage.setItem("token", token);
              localStorage.setItem(
                "userId",
                loginData.data.userId || "unknown"
              );
              localStorage.setItem("username", formData.username);
              setIsAuthenticated(true);

              // Now send the welcome email using the token
              try {
                const emailResponse = await fetch(
                  "http://localhost:8080/api/email/send-registration",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`, // Add the token here
                    },
                    body: JSON.stringify({
                      toEmail: formData.email,
                      username: formData.username,
                    }),
                  }
                );

                const emailData = await emailResponse.json();
                console.log("Email Response Status:", emailResponse.status);
                console.log("Email Response Data:", emailData);

                if (
                  emailResponse.status === 200 &&
                  emailData.status === "success"
                ) {
                  toast.success("Welcome email sent successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                } else {
                  toast.warn(
                    "Registration successful, but failed to send welcome email.",
                    {
                      position: "top-right",
                      autoClose: 3000,
                    }
                  );
                }
              } catch (emailErr) {
                console.error("Error sending welcome email:", emailErr);
                toast.warn(
                  "Registration successful, but failed to send welcome email.",
                  {
                    position: "top-right",
                    autoClose: 3000,
                  }
                );
              }

              toast.success("Registration successful! You are now logged in.", {
                position: "top-right",
                autoClose: 3000,
              });
              navigate("/");
            } else {
              setError("Registration successful, but auto-login failed.");
              toast.error("Auto-login failed. Please log in manually.", {
                position: "top-right",
                autoClose: 3000,
              });
              setSignIn(true);
              setFormData({
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
            }
          } else {
            setError("Registration successful, but auto-login failed.");
            toast.error("Auto-login failed. Please log in manually.", {
              position: "top-right",
              autoClose: 3000,
            });
            setSignIn(true);
            setFormData({
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
      console.error("Error connecting to server:", err.message, err.stack);
      setError("Unable to connect to server. Please try again later.");
      toast.error("Server connection error: " + err.message, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
    >
      <Components.Container>
        <Components.SignUpContainer signinIn={signIn}>
          <Components.Form onSubmit={handleAuth}>
            <Components.Title>Create Account</Components.Title>
            <Components.Input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Components.Input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
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
            <Components.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Components.Select>
            <Components.Input
              type="date"
              name="dateOfBirth"
              placeholder="mm/dd/yyyy"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
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
            {error && (
              <Components.ErrorMessage>{error}</Components.ErrorMessage>
            )}
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
            {error && (
              <Components.ErrorMessage>{error}</Components.ErrorMessage>
            )}
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
            <Components.SocialButton>
              <FaGoogle style={{ marginRight: "10px" }} />
              Sign in with Google
            </Components.SocialButton>
            <Components.SocialButton>
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
                To keep connected with us, please login with your personal info
              </Components.Paragraph>
              <Components.GhostButton onClick={() => setSignIn(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Tira Shop</Components.Title>
              <Components.Paragraph>
                Enter your personal details and start your journey with us
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
