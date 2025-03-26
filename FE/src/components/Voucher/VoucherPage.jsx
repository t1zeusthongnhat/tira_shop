// src/components/Voucher/VoucherPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./VoucherPage.module.scss";
import Footer from "../Footer/Footer";

const VoucherPage = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
  const [error, setError] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view vouchers");
        navigate("/auth");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/tirashop/voucher/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setVouchers(data.data);
      } else {
        setError(data.message || "Failed to fetch vouchers");
        toast.error(data.message || "Failed to fetch vouchers");
      }
    } catch (err) {
      setError("Error fetching vouchers");
      toast.error("Error fetching vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(); // Chỉ gọi một lần khi component mount
  }, []); // Loại bỏ phụ thuộc navigate

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVouchers = vouchers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className={styles.voucherPage}>
        <h1>Vouchers</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : vouchers.length === 0 ? (
          <p>No vouchers found.</p>
        ) : (
          <>
            <div className={styles.voucherList}>
              {currentVouchers.map((voucher) => (
                <div key={voucher.id} className={styles.voucherCard}>
                  <h3>{voucher.code}</h3>
                  <p>
                    <strong>Discount: </strong>
                    {voucher.discountType === "PERCENTAGE"
                      ? `${voucher.discountValue}%`
                      : `$${voucher.discountValue}`}
                  </p>
                  <p>
                    <strong>Start Date: </strong>
                    {new Date(voucher.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>End Date: </strong>
                    {new Date(voucher.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status: </strong>
                    <span
                      className={
                        voucher.status === "ACTIVE"
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {voucher.status}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={styles.pageButton}
                    style={
                      currentPage === number
                        ? { backgroundColor: "#007bff", color: "white" }
                        : {}
                    }
                  >
                    {number}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
      <Footer></Footer>
    </>
  );
};

export default VoucherPage;
