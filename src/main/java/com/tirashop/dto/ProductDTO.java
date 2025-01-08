package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;

    private String name;

    private String code;

    private String description;

    private String material;

    private double price;

    private int quantity;

    private String status;

    private String size;

    private Long categoryId; // Thay đổi thành CategoryDTO

    private String categoryName;

    private Long brandId; // Thay đổi thành BrandDTO

    private String brandName;

    private int inventory;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate updatedAt;

    private List<String> imageUrls; // Danh sách URL ảnh
}
