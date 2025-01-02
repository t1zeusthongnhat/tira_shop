package com.tirashop.service;

import com.tirashop.dto.ProductDTO;
import com.tirashop.entity.Brand;
import com.tirashop.entity.Category;
import com.tirashop.entity.Image;
import com.tirashop.entity.Product;
import com.tirashop.repository.BrandRepository;
import com.tirashop.repository.CategoryRepository;
import com.tirashop.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {

    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    BrandRepository brandRepository;

    public List<ProductDTO> getAllProductsWithImages() {
        List<Product> products = productRepository.findAllWithImages();
        return products.stream()
                .map(this::toDTO) // Sử dụng phương thức toDTO để map
                .collect(Collectors.toList());
    }

    // Chuyển đổi từ Product sang ProductDTO
    private ProductDTO toDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setCode(product.getCode());
        productDTO.setDescription(product.getDescription());
        productDTO.setMaterial(product.getMaterial());
        productDTO.setPrice(product.getPrice());
        productDTO.setQuantity(product.getQuantity());
        productDTO.setStatus(product.getStatus());
        productDTO.setSize(product.getSize());
        productDTO.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        productDTO.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        productDTO.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        productDTO.setBrandName(product.getBrand() != null ? product.getBrand().getName() : null);
        productDTO.setInventory(product.getInventory());
        productDTO.setCreatedAt(product.getCreatedAt());


        // Lấy danh sách URL ảnh
        List<String> productUrl = product.getImages().stream().map(Image::getUrl).toList();
        productDTO.setImageUrls(productUrl);

        return productDTO;
    }

    // Chuyển đổi từ ProductDTO sang Product (xử lý thêm createdAt và các mối quan hệ)
    private Product toEntity(ProductDTO productDTO) {
        Product product = new Product();
        product.setId(productDTO.getId());
        product.setName(productDTO.getName());
        product.setCode(productDTO.getCode());
        product.setDescription(productDTO.getDescription());
        product.setMaterial(productDTO.getMaterial());
        product.setPrice(productDTO.getPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setStatus(productDTO.getStatus());
        product.setSize(productDTO.getSize());
        product.setInventory(productDTO.getInventory());

        // createdAt luôn là LocalDate.now(), không chỉnh sửa
        if (product.getId() == null) { // Kiểm tra nếu là sản phẩm mới
            product.setCreatedAt(LocalDate.now());
        } else {
            product.setCreatedAt(productDTO.getCreatedAt());
        }

        // updatedAt để trống hoặc do cơ sở dữ liệu tự cập nhật
        product.setUpdatedAt(null);

        // Xử lý mối quan hệ với Category
        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not exist"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Xử lý mối quan hệ với Brand
        if (productDTO.getBrandId() != null) {
            Brand brand = brandRepository.findById(productDTO.getBrandId())
                    .orElseThrow(() -> new IllegalArgumentException("Brand not exist"));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        return product;
    }
}
