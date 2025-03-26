import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../Footer/Footer";
import styles from "./detailStyles.module.scss"; // Tạo file SCSS riêng cho styling

function DetailPostList() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams(); // Lấy postId từ URL
  const navigate = useNavigate();

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view post details.");
      }

      const url = `http://localhost:8080/tirashop/posts/${postId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const data = await response.json();
      console.log("Post Detail Data:", data);

      if (data.status === "success" && data.data) {
        setPost(data.data);
      } else {
        throw new Error("Post not found");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      toast.error(err.message);
      navigate("/posts"); // Quay lại danh sách nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [postId]); // Chạy lại khi postId thay đổi

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading post details...</p>
      </div>
    );
  }

  if (!post) {
    return null; // Hoặc có thể hiển thị thông báo "Post not found"
  }

  return (
    <>
      <div className={styles.detailContainer}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/posts")}
        >
          ← Back to News
        </button>

        <div className={styles.postHeader}>
          <h1 className={styles.postTitle}>{post.name || "Untitled"}</h1>
          <div className={styles.postMeta}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                {(post.authorName || "A")[0].toUpperCase()}
              </div>
              <span className={styles.authorName}>
                {post.authorName || "Anonymous"}
              </span>
            </div>
            <span className={styles.postDate}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className={styles.postContent}>
          <img
            src={post.imageUrl || "https://via.placeholder.com/800x400"}
            alt={post.name || "Post Image"}
            className={styles.postImage}
          />
          <div className={styles.postTopic}>{post.topic || "General"}</div>

          <div className={styles.postDescription}>
            <h3>Description</h3>
            <p>{post.shortDescription || "No description available"}</p>
          </div>

          {/* Nếu API có nội dung chi tiết thì thêm phần này */}
          {post.content && (
            <div className={styles.postFullContent}>
              <h3>Content</h3>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default DetailPostList;
