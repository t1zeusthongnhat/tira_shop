package com.tirashop.persitence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import java.util.ArrayList;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cart")
public class Cart {
    //chứa thông tin tổng quan của giỏ hàng người dùng, không lưu thông tin sản phẩm trực tiếp
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã giỏ hàng (Primary Key)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;  // Mã người dùng (Khóa ngoại)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo giỏ hàng

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // Thời gian cập nhật giỏ hàng

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CartStatus status;  // Trạng thái giỏ hàng

    public enum CartStatus {
        ACTIVE,  // Giỏ hàng chưa thanh toán
        CHECKED_OUT  // Giỏ hàng đã thanh toán
    }

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>(); // Khởi tạo danh sách rỗng mặc định
}

