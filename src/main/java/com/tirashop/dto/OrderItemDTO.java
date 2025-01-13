package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long productId;       // Mã sản phẩm
    private String productName;   // Tên sản phẩm
    private String brandName;     // Tên thương hiệu
    private String categoryName;  // Tên danh mục
    private String size;          // Kích thước sản phẩm
    private int inventory;        // Số lượng tồn kho
    private int quantity;         // Số lượng sản phẩm trong đơn hàng
    private double price;         // Giá sản phẩm tại thời điểm đặt hàng
    private String productImage;  // URL ảnh sản phẩm

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt; // Thời gian thêm sản phẩm vào đơn hàng
}
