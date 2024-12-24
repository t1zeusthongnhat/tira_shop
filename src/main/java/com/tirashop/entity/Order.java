package com.tirashop.entity;

import com.tirashop.validator.LocalDateAttributeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {
    //lưu thông tin về các đơn hàng của người dùng
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã đơn hàng (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Mã người dùng (Khóa ngoại)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;  // Mã voucher (Khóa ngoại, có thể NULL)

    @Column(name = "total_price", nullable = false)
    private double totalPrice;  // Tổng giá trị đơn hàng sau khi áp dụng giảm giá

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;  // Trạng thái đơn hàng

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;  // Trạng thái thanh toán

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;  // Địa chỉ giao hàng

    @Column(name = "created_at", updatable = false, nullable = false)
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo đơn hàng

    @Column(name = "updated_at")
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDateTime updatedAt;  // Thời gian cập nhật đơn hàng

    public enum OrderStatus {
        PENDING,  // Đơn hàng đang chờ xử lý
        COMPLETED,  // Đơn hàng đã hoàn thành
        CANCELLED  // Đơn hàng đã hủy
    }

    public enum PaymentStatus {
        PENDING,  // Thanh toán chưa hoàn tất
        PAID,  // Thanh toán thành công
        FAILED  // Thanh toán thất bại
    }

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shipment> shipments;

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments;
}
