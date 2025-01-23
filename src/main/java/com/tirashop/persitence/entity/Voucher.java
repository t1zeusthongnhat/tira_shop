package com.tirashop.persitence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import lombok.experimental.FieldNameConstants;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "voucher")
@FieldNameConstants
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Mã giảm giá (Primary Key)

    @Column(name = "code", unique = true, nullable = false)
    private String code;  // Mã voucher

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;  // Loại giảm giá (percentage hoặc fixed)

    @Column(name = "discount_value", nullable = false)
    private double discountValue;  // Giá trị giảm giá

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;  // Ngày bắt đầu áp dụng voucher

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;  // Ngày kết thúc áp dụng voucher

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VoucherStatus status;  // Trạng thái của voucher (active, expired, used)

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDate createdAt = LocalDate.now();  // Thời gian tạo voucher

    @Column(name = "updated_at")
    private LocalDate updatedAt;  // Thời gian cập nhật voucher

    public enum DiscountType {
        PERCENTAGE,  // Giảm giá theo phần trăm
        FIXED        // Giảm giá theo số tiền cố định
    }

    public enum VoucherStatus {
        ACTIVE,  // Voucher còn hiệu lực
        EXPIRED, // Voucher đã hết hạn
        USED     // Voucher đã được sử dụng
    }

    @OneToMany(mappedBy = "voucher")
    private List<Order> orders;
}
