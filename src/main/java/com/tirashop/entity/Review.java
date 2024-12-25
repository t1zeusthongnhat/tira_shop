package com.tirashop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // ID của đánh giá

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;  // Sản phẩm mà người dùng đánh giá

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Người dùng đánh giá

    @Column(name = "rating", nullable = false)
    private int rating;  // Điểm đánh giá, giả sử là số nguyên từ 1 đến 5

    @Column(name = "review", length = 500)
    private String review;  // Mô tả đánh giá

    @Column(name = "image")
    private String image;  // URL của ảnh (nếu có ảnh đánh giá)

    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt = LocalDate.now();  // Thời gian tạo đánh giá

    @Column(name = "updated_at")
    private LocalDate updatedAt;  // Thời gian cập nhật (nếu có thay đổi)

}
