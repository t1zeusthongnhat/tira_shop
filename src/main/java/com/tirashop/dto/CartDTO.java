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
public class CartDTO {

    private Long id;  // Mã giỏ hàng

    private Long userId;  // Mã người dùng (null nếu chưa đăng nhập)

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();  // Thời gian tạo giỏ hàng

    private String status;  // Trạng thái giỏ hàng (ACTIVE hoặc CHECKED_OUT)

    private List<CartItemDTO> items;  // Danh sách sản phẩm trong giỏ hàng

    private double totalValue;  // Mặc định là 0.0

}
