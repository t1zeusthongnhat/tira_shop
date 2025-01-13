package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDetailDTO {
    private String trackingNumber;      // Mã vận chuyển
    private String shippingMethod;      // Phương thức giao hàng
    private String status;              // Trạng thái giao hàng
    private Long productId;             // Mã sản phẩm
    private String productName;         // Tên sản phẩm
    private String productImage;        // Ảnh sản phẩm
    private int quantity;               // Số lượng

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;    // Ngày tạo vận chuyển
}

