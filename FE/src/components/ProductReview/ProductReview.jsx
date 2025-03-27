import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

function ProductReview() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho form thêm review
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8080/tirashop/reviews/product/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
         
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.status === "success") {
          setReviews(data.data.elementList || []);
        } else {
          setError(data.message || "Failed to fetch reviews");
          toast.error(data.message || "Failed to fetch reviews", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Hàm xử lý gửi review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to submit a review", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      if (reviewText) formData.append("reviewText", reviewText);
      if (image) formData.append("image", image);

      const response = await fetch(
        `http://localhost:8080/tirashop/reviews/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
       
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        toast.success("Review added successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        setReviews((prevReviews) => [data.data, ...prevReviews]);
        setRating(0);
        setReviewText("");
        setImage(null);
      } else {
        toast.error(data.message || "Failed to add review", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error(
        err.message || "An error occurred while submitting the review",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm render sao
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? styles.filledStar : styles.emptyStar}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Hàm chọn sao cho form
  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const renderStarInput = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => handleStarClick(i)}
          className={i <= rating ? styles.filledStar : styles.emptyStar}
          style={{ cursor: "pointer" }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString;
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className={styles.reviewsContainer}>
      <h3 className={styles.reviewsTitle}>What Our Customers Say</h3>

      {/* Form thêm review */}
      <div className={styles.reviewForm}>
        <h4>Write a Review</h4>
        <form onSubmit={handleSubmitReview}>
          <div className={styles.formGroup}>
            <label>Rating (required):</label>
            <div>{renderStarInput()}</div>
          </div>

          <div className={styles.formGroup}>
            <label>Review (optional):</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              rows="4"
              className={styles.reviewTextArea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Upload Image (optional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className={styles.imageInput}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.submitButton}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Danh sách review */}
      {reviews.length === 0 ? (
        <p className={styles.noReviews}>No reviews yet for this product.</p>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewUser}>{review.username}</div>
                <div className={styles.reviewDate}>
                  {formatDate(review.createdAt)}
                </div>
              </div>

              <div className={styles.reviewRating}>
                {renderStars(review.rating)}
              </div>

              <div className={styles.reviewText}>{review.reviewText}</div>

              {review.image && (
                <div className={styles.reviewImage}>
                  <img
                    src={`http://localhost:8080${review.image}`}
                    alt="Review"
                    className={styles.reviewImg}
                  />
                </div>
              )}

              <div className={styles.reviewUserInfo}>
                <img
                  src="https://via.placeholder.com/50"
                  alt={review.username}
                />
                <div className={styles.reviewUserDetails}>
                  <span className={styles.reviewUser}>{review.username}</span>
                  <span className={styles.reviewUserRole}>Customer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductReview;
