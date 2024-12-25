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
@Table(name = "cart_item")
public class CartItem {
    //lưu thông tin về các sản phẩm trong giỏ hàng
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã sản phẩm trong giỏ hàng (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;  // Mã giỏ hàng (Khóa ngoại)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;  // Mã sản phẩm (Khóa ngoại)

    @Column(name = "quantity", nullable = false)
    private int quantity;  // Số lượng sản phẩm

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian thêm sản phẩm vào giỏ hàng

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // Thời gian cập nhật sản phẩm trong giỏ hàng
}
