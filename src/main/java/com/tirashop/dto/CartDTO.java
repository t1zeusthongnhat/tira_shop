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

    private Long id;
    private Long userId;  // Mã người dùng (để tham chiếu)

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDateTime createdAt = LocalDateTime.now();

    private String status;  // Trạng thái giỏ hàng (ACTIVE hoặc CHECKED_OUT)

    private List<CartItemDTO> cartItems;

}
