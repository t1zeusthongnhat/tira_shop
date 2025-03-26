import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

function PostList() {
  const [posts, setPosts] = useState([]); // Tất cả bài post
  const [currentPosts, setCurrentPosts] = useState([]); // Bài post hiển thị trong trang hiện tại
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại
  const postsPerPage = 3; // Số bài hiển thị mỗi lần
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view news.");
      }
      const url = "http://localhost:8080/tirashop/posts?author=duo";
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
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response Data:", data);

      if (data.status === "success" && data.data?.elementList?.length > 0) {
        setPosts(data.data.elementList); // Tất cả bài viết
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật các bài post hiển thị theo trang
  useEffect(() => {
    if (posts.length > 0) {
      const indexOfLastPost = (currentPage + 1) * postsPerPage;
      const indexOfFirstPost = indexOfLastPost - postsPerPage;
      setCurrentPosts(posts.slice(indexOfFirstPost, indexOfLastPost));
    }
  }, [posts, currentPage]);

  // Tự động chuyển trang nếu có dữ liệu mới
  useEffect(() => {
    fetchPosts();
  }, []); // Chỉ chạy khi mount

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const goToNextPage = () => {
    if ((currentPage + 1) * postsPerPage < posts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Tự động chuyển trang sau một khoảng thời gian hoặc khi bài viết mới được tải
  useEffect(() => {
    if (currentPosts.length === postsPerPage) {
      const nextPage = currentPage + 1;
      if (nextPage * postsPerPage <= posts.length) {
        const timeout = setTimeout(() => {
          setCurrentPage(nextPage); // Tự động chuyển sang trang tiếp theo
        }, 5000); // Chuyển trang sau 5 giây (hoặc thay đổi thời gian)
        return () => clearTimeout(timeout);
      }
    }
  }, [currentPosts, currentPage, posts]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading news...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.postListContainer}>
        <div className={styles.postHeader}>
          <h2 className={styles.postTitle}>News</h2>
          <div className={styles.postFilter}>
            <span className={styles.activeFilter}>All</span>
            <span>Latest</span>
            <span>Popular</span>
          </div>
        </div>

        {currentPosts.length > 0 ? (
          <div className={styles.postGrid}>
            {currentPosts.map((post) => {
              const imageUrl = post.imageUrl
                ? `http://localhost:8080${post.imageUrl}`
                : "https://via.placeholder.com/250";

              return (
                <div
                  key={post.id}
                  className={styles.postCard}
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className={styles.postImageWrapper}>
                    <img
                      src={imageUrl}
                      alt={post.name || "News Image"}
                      className={styles.postImage}
                    />
                    <div className={styles.postTopic}>
                      {post.topic || "General"}
                    </div>
                  </div>
                  <div className={styles.postDetails}>
                    <h3 className={styles.postName}>
                      {post.name || "Untitled"}
                    </h3>
                    <p className={styles.postShortDescription}>
                      {post.short_description || "No description available"}
                    </p>
                    <div className={styles.postMeta}>
                      <div className={styles.postAuthorInfo}>
                        <div className={styles.postAuthorAvatar}>
                          {(post.authorName || "A")[0].toUpperCase()}
                        </div>
                        <span className={styles.postAuthorName}>
                          {post.authorName || "Anonymous"}
                        </span>
                      </div>
                      <span className={styles.postDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyPostContainer}>
            <div className={styles.emptyPostIcon}>📭</div>
            <p>No news available at the moment</p>
            <button className={styles.refreshButton} onClick={fetchPosts}>
              Refresh
            </button>
          </div>
        )}

        {/* Các nút chuyển trang */}
        <div className={styles.pagination}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={(currentPage + 1) * postsPerPage >= posts.length}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default PostList;
