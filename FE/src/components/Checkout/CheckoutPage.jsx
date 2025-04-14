import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { useAppContext } from "../../context/AppContext";
import Footer from "../Footer/Footer";
import VoucherForm from "../Voucher/VoucherForm";

function CheckoutPage() {
  const { cart, fetchCart, setCart } = useAppContext();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [pendingItems, setPendingItems] = useState([]);
  // Thêm state cho phần trăm giảm giá
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const shippingFee = 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to proceed with checkout");
      navigate("/auth");
      return;
    }
    fetchCart();
    fetchPendingItems();
  }, [navigate, fetchCart]);

  const fetchPendingItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/tirashop/orders/pending", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        setPendingItems(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch pending items");
      }
    } catch (err) {
      toast.error("Error fetching pending items: " + err.message);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.productPrice || 0) * (item.quantity || 0),
    0
  );
  const total = subtotal + shippingFee - voucherDiscount;

  const handleNextStep = () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (paymentMethod !== "cod") {
      toast.error("Only Cash on Delivery (COD) is supported in this flow");
      return;
    }

    const confirmCheckout = window.confirm(
      "Are you sure you want to place this order?"
    );
    if (!confirmCheckout) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/tirashop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          voucherCode: voucherCode || null,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout API request failed");
      }

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Order placed successfully!");
        setCart([]);
        setVoucherCode("");
        setVoucherDiscount(0);
        setDiscountPercentage(0); // Reset phần trăm sau khi checkout
        setTimeout(() => navigate("/order-success"), 1500);
      } else {
        setError(data.message || "Checkout failed");
        toast.error(data.message || "Checkout failed");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Checkout failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [{ id: "cod", name: "Cash on Delivery (COD)" }];

  return (
    <div className={styles.checkoutPageWrapper}>
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutHeader}>
          <h1>Checkout</h1>
          <div className={styles.checkoutSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
              <div className={styles.stepNumber}>1</div>
              <span>Shipping Information</span>
            </div>
            <div className={styles.stepDivider}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
              <div className={styles.stepNumber}>2</div>
              <span>Payment Method</span>
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className={styles.emptyCartContainer}>
            <div className={styles.emptyCartIcon}>🛒</div>
            <p className={styles.emptyCart}>
              Your cart is empty. Add items to proceed.
            </p>
            <button
              className={styles.continueShoppingBtn}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className={styles.checkoutContainer}>
            <div className={styles.checkoutContent}>
              {step === 1 && (
                <div className={styles.shippingStep}>
                  <div className={styles.formSection}>
                    <h2>Shipping Address</h2>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullname">Full Name</label>
                      <input
                        type="text"
                        id="fullname"
                        placeholder="John Doe"
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          placeholder="(123) 456-7890"
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="example@email.com"
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="address">Detailed Address</label>
                      <textarea
                        id="address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street address, apartment, city, state, zip code"
                        required
                        rows="3"
                        className={styles.addressInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="note">Order Notes (optional)</label>
                      <textarea
                        id="note"
                        placeholder="Notes about your order, e.g. special delivery instructions."
                        rows="2"
                        className={styles.noteInput}
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => navigate("/cart")}
                    >
                      Back to Cart
                    </button>
                    <button
                      type="button"
                      className={styles.continueBtn}
                      onClick={handleNextStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.paymentStep}>
                  <h2>Payment Method</h2>
                  <div className={styles.paymentMethods}>
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`${styles.paymentMethod} ${
                          paymentMethod === method.id ? styles.selected : ""
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className={styles.paymentMethodRadio}>
                          <input
                            type="radio"
                            id={method.id}
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <span className={styles.radioCheckmark}></span>
                        </div>
                        <label htmlFor={method.id}>{method.name}</label>
                      </div>
                    ))}
                  </div>

                  <div className={styles.voucherSection}>
                    <h3>Discount Code</h3>
                    <VoucherForm
                      subtotal={subtotal}
                      setVoucherDiscount={setVoucherDiscount}
                      voucherCode={voucherCode}
                      setVoucherCode={setVoucherCode}
                      setDiscountPercentage={setDiscountPercentage} // Truyền prop mới
                    />
                  </div>

                  {error && <p className={styles.errorMessage}>{error}</p>}

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={handlePreviousStep}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={loading || !paymentMethod}
                      className={styles.placeOrderBtn}
                      onClick={handleCheckout}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.orderSummary}>
              <h2>Order Summary</h2>
              <div className={styles.cartItems}>
                {cart.map((item) => (
                  <div key={item.cartId} className={styles.cartItem}>
                    <div className={styles.itemImageContainer}>
                      <img
                        src={
                          item.productImage || "https://via.placeholder.com/60"
                        }
                        alt={item.productName || "Product"}
                        className={styles.itemImage}
                      />
                      <span className={styles.itemQuantity}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.productName || "Unknown Product"}</h3>
                      <p className={styles.itemSize}>
                        Size: {item.size || "N/A"}
                      </p>
                    </div>
                    <p className={styles.itemPrice}>
                      ${(item.productPrice * item.quantity).toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString("en-US")} $</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping Fee:</span>
                  <span>{shippingFee === 0 ? "Free" : `${shippingFee.toLocaleString("en-US")} $`}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className={styles.summaryRow}>
                    <span>
                      Discount ({voucherCode || "Voucher"}
                      {discountPercentage > 0 ? ` - ${discountPercentage}%` : ""}):
                    </span>
                    <span className={styles.discountValue}>
                      -{voucherDiscount.toLocaleString("en-US")} $
                    </span>
                  </div>
                )}
                <div className={styles.divider}></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>
                    {total.toLocaleString("en-US")} $
                  </span>
                </div>
                <div className={styles.taxNote}>
                  <p>Includes VAT (if applicable)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CheckoutPage;