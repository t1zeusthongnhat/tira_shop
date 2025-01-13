package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;               // Mã đơn hàng
    private Long userId;                // Mã người dùng
    private String userName;            // Tên người dùng
    private double totalPrice;          // Tổng giá trị đơn hàng
    private String status;              // Trạng thái đơn hàng (PENDING, COMPLETED, CANCELLED)
    private String paymentStatus;       // Trạng thái thanh toán (PENDING, PAID, FAILED)
    private String shippingAddress;     // Địa chỉ giao hàng

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;    // Thời gian tạo đơn hàng

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;    // Thời gian cập nhật đơn hàng

    private List<OrderItemDTO> items;   // Danh sách sản phẩm trong đơn hàng
}
