// src/components/Voucher/VoucherForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./VoucherForm.module.scss";

const VoucherForm = ({
  subtotal,
  setVoucherDiscount,
  voucherCode,
  setVoucherCode,
}) => {
  const [loading, setLoading] = useState(false);

  const applyVoucher = async () => {
    if (!voucherCode) {
      toast.error("Please enter a voucher code");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to apply a voucher");
        return;
      }

      // Gọi API để lấy danh sách voucher
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
        // Tìm voucher khớp với mã người dùng nhập
        const voucher = data.data.find(
          (v) =>
            v.code.toLowerCase() === voucherCode.toLowerCase() &&
            v.status === "ACTIVE" &&
            new Date(v.startDate) <= new Date() &&
            new Date(v.endDate) >= new Date()
        );

        if (voucher) {
          let discount = 0;
          if (voucher.discountType === "PERCENTAGE") {
            discount = (subtotal * voucher.discountValue) / 100;
            discount = Math.min(discount, subtotal); // Giới hạn giảm giá tối đa bằng subtotal
          } else {
            discount = voucher.discountValue || 0;
          }
          setVoucherDiscount(discount);
          toast.success("Voucher applied successfully!");
        } else {
          setVoucherDiscount(0);
          toast.error("Invalid or expired voucher code");
        }
      } else {
        setVoucherDiscount(0);
        toast.error(data.message || "Failed to fetch vouchers");
      }
    } catch (err) {
      setVoucherDiscount(0);
      toast.error("Error applying voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <h3>Voucher (Optional)</h3>
      <div className={styles.voucherInput}>
        <input
          type="text"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
          placeholder="Enter voucher code"
          className={styles.voucherField}
        />
        <button
          type="button"
          onClick={applyVoucher}
          disabled={loading || !voucherCode}
          className={styles.applyVoucherBtn}
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
    </div>
  );
};

export default VoucherForm;
