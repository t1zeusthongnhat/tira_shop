package com.tirashop.persitence.entity;

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
@Table(name = "order_item")
public class OrderItem {
    //lưu thông tin về các sản phẩm trong đơn hàng, bao gồm cả số lượng và giá của từng sản phẩm
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã sản phẩm trong đơn hàng (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;  // Mã đơn hàng (Khóa ngoại)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;  // Mã sản phẩm (Khóa ngoại)

    @Column(name = "quantity", nullable = false)
    private int quantity;  // Số lượng sản phẩm trong đơn hàng

    @Column(name = "price", nullable = false)
    private double price;  // Giá của sản phẩm tại thời điểm đặt hàng

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian thêm sản phẩm vào đơn hàng

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // Thời gian cập nhật sản phẩm trong đơn hàng
}
