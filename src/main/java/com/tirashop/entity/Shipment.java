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
@Table(name = "shipment")
public class Shipment {
    //lưu thông tin về vận chuyển của đơn hàng, bao gồm trạng thái giao hàng
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã vận chuyển (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;  // Mã đơn hàng (Khóa ngoại)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = true)
    private OrderItem orderItem; // Mã sản phẩm trong đơn hàng (có thể NULL nếu shipment chung cho cả đơn hàng)

    @Column(name = "tracking_number", nullable = false)
    private String trackingNumber;  // Số theo dõi vận chuyển

    @Column(name = "shipping_method", nullable = false)
    private String shippingMethod;  // Phương thức giao hàng (ví dụ: giao hàng nhanh, giao hàng tiêu chuẩn)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ShipmentStatus status;  // Trạng thái giao hàng

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo vận chuyển


    public enum ShipmentStatus {
        PENDING,  // Vận chuyển đang chờ
        SHIPPED,  // Vận chuyển đã gửi
        DELIVERED,  // Vận chuyển đã giao
        FAILED  // Vận chuyển thất bại
    }
}
