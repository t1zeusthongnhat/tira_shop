import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss"; // Sử dụng styles mới
import Footer from "../Footer/Footer";

function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    birthday: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your profile", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/auth");
      return;
    }

    fetchUserProfile(token);
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:8080/tirashop/user/my-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      
        navigate("/auth");
        return;
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setUserProfile(data.data);

        // Convert birthday from dd-MM-yyyy to yyyy-MM-dd for date input
        let formattedBirthday = data.data.birthday;
        if (
          data.data.birthday &&
          /^\d{2}-\d{2}-\d{4}$/.test(data.data.birthday)
        ) {
          const [day, month, year] = data.data.birthday.split("-");
          formattedBirthday = `${year}-${month}-${day}`;
        }

        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          gender: data.data.gender || "",
          birthday: formattedBirthday || "",
        });
      } else {
        toast.error("Failed to fetch profile data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error connecting to server", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to update your profile", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth");
        return;
      }

      // Create FormData to handle both text fields and file upload
      const formDataToSend = new FormData();

      // Create a copy of form data to format the birthday
      const formattedData = { ...formData };

      // Convert birthday from yyyy-MM-dd to dd-MM-yyyy format for API
      if (formData.birthday) {
        if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.birthday)) {
          const dateObj = new Date(formData.birthday);
          if (!isNaN(dateObj.getTime())) {
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const year = dateObj.getFullYear();
            formattedData.birthday = `${day}-${month}-${year}`;
          }
        }
      }

      // Chỉ thêm các trường cần thiết
      const fieldsToSend = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "address",
        "gender",
        "birthday",
      ];
      fieldsToSend.forEach((key) => {
        if (formattedData[key] !== undefined && formattedData[key] !== "") {
          formDataToSend.append(key, formattedData[key]);
        }
      });

      // Add avatar if it exists
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await fetch(
        "http://localhost:8080/tirashop/user/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
       
        navigate("/auth");
        return;
      }

      if (response.ok) {
        // Cập nhật state thủ công từ formData ngay sau khi thành công
        setUserProfile((prev) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          birthday: formData.birthday,
        }));

        // Gọi fetchUserProfile để đồng bộ với server
        await fetchUserProfile(token);

        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        toast.success("Profile updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(
          `Failed to update profile: ${data.message || "Unknown error"}`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error connecting to server", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.loadingSpinner}>Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.profileContainer}>
        <div className={styles.profileCard}>
          <h1 className={styles.profileTitle}>My Profile</h1>

          {!isEditing ? (
            <div className={styles.profileInfo}>
              <div className={styles.profileAvatar}>
                {userProfile?.avatar ? (
                  <img
                    src={`http://localhost:8080${userProfile.avatar}`}
                    alt="Profile Avatar"
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {userProfile?.firstName?.charAt(0) ||
                      userProfile?.username?.charAt(0) ||
                      "U"}
                  </div>
                )}
              </div>

              <div className={styles.profileDetails}>
                <h2 className={styles.username}>
                  {userProfile?.firstName} {userProfile?.lastName}
                </h2>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Username:</div>
                  <div className={styles.infoValue}>
                    {userProfile?.username}
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Email:</div>
                  <div className={styles.infoValue}>{userProfile?.email}</div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Phone:</div>
                  <div className={styles.infoValue}>
                    {userProfile?.phone || "Not provided"}
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Address:</div>
                  <div className={styles.infoValue}>
                    {userProfile?.address || "Not provided"}
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Gender:</div>
                  <div className={styles.infoValue}>
                    {userProfile?.gender || "Not provided"}
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Birthday:</div>
                  <div className={styles.infoValue}>
                    {formatDate(userProfile?.birthday) || "Not provided"}
                  </div>
                </div>

                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form className={styles.editForm} onSubmit={handleSubmit}>
              <div className={styles.avatarEditSection}>
                <div
                  className={styles.avatarContainer}
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Avatar Preview"
                      className={styles.avatarImage}
                    />
                  ) : userProfile?.avatar ? (
                    <img
                      src={`http://localhost:8080${userProfile.avatar}`}
                      alt="Profile Avatar"
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {userProfile?.firstName?.charAt(0) ||
                        userProfile?.username?.charAt(0) ||
                        "U"}
                    </div>
                  )}
                  <div className={styles.avatarOverlay}>
                    <span>Change Photo</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="birthday">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formButtons}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserProfile;
