package com.tirashop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã thanh toán (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;  // Mã đơn hàng (Khóa ngoại)
    //một đơn hàng có thể có nhiều lần thanh toán (nếu có các phương thức thanh toán khác nhau,
    // hoặc các bước thanh toán khác nhau)

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;  // Phương thức thanh toán

    @Column(name = "amount", nullable = false)
    private double amount;  // Số tiền thanh toán

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;  // Trạng thái thanh toán

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian thanh toán

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // Thời gian cập nhật thanh toán

    public enum PaymentMethod {
        CREDIT_CARD,  // Thanh toán qua thẻ tín dụng
        PAYPAL,  // Thanh toán qua PayPal
        BANK_TRANSFER,  // Thanh toán qua chuyển khoản ngân hàng
        COD  // Thanh toán khi nhận hàng (Cash On Delivery)
    }

    public enum PaymentStatus {
        PENDING,  // Thanh toán chưa hoàn tất
        COMPLETED,  // Thanh toán thành công
        FAILED  // Thanh toán thất bại
    }
}
