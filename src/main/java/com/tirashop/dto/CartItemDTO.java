package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;  // Mã sản phẩm trong giỏ hàng

    private Long cartId;  // Mã giỏ hàng (để tham chiếu)
    //nested
    private Long productId;  // Mã sản phẩm

    private String productName;

    private String productCategory;

    private String productSize;

    private double productPrice;

    private String productImage;

    private int quantity;  // Số lượng sản phẩm


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDateTime createdAt;  // Thời gian thêm sản phẩm vào giỏ hàng
}
