package com.tirashop.controller;

import com.tirashop.dto.ImageDTO;
import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.request.ProductRequest;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.dto.response.ProductResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/tirashop/product")
@Tag(name = "Product", description = "APIs for managing products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

    ProductService productService;

    @GetMapping()
    @Operation(summary = "Filter products with pagination", description = "Filter products by size, price range, category, and brand with pagination support")
    public ApiResponse<PagedData<ProductDTO>> getFilteredProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @PageableDefault(page = 0, size = 25, sort = "createdAt", direction = Direction.DESC) Pageable pageable

    ) {
        PagedData<ProductDTO> pagedData = productService.filterProductsWithPaging(name, size,
                minPrice, maxPrice, category, brand, pageable);
        return new ApiResponse<>("success", 200, "Filtered products retrieved successfully",
                pagedData);
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Delete all image by product")
    public ApiResponse<Void> addProduct(@PathVariable Long id) {
        productService.deleteImageProduct(id);
        return new ApiResponse<>("success", 200, "Delete all img success", null);
    }

    @PostMapping("/add")
    @Operation(summary = "Add new product", description = "Add a new product with its details")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product added successfully")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> addProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ApiResponse<>("success", 201, "Add Product success", response);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update product", description = "Update product details by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated successfully")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id,
            @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(request, id);
        return new ApiResponse<>("success", 200, "Update Product success", response);
    }


    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete product", description = "Delete a product by its ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deleted successfully")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ApiResponse<>("success", 200, "Delete Product success", null);
    }

    @GetMapping("get/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve product details by its ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product retrieved successfully")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return new ApiResponse<>("success", 200, "Get Product success", response);
    }

    @PostMapping("/{productId}/images/upload")
    public ApiResponse<ImageDTO> uploadImageToProduct(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            ImageDTO imageDTO = productService.uploadImageToProduct(productId, file);
            return new ApiResponse<>("success", 201, "Image uploaded successfully", imageDTO);
        } catch (Exception e) {
            return new ApiResponse<>("error", 500, e.getMessage(), null);
        }
    }

    @GetMapping("/{productId}/images")
    public ApiResponse<List<ImageDTO>> getAllImagesByProductId(@PathVariable Long productId) {
        List<ImageDTO> images = productService.getAllImagesByProductId(productId);
        return new ApiResponse<>("success", 200, "Images retrieved successfully", images);
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ApiResponse<Void> deleteImageById(
            @PathVariable Long productId,
            @PathVariable Long imageId
    ) {
        productService.deleteImageById(productId, imageId);
        return new ApiResponse<>("success", 200, "Image deleted successfully", null);
    }

    @PutMapping("/{productId}/images/{imageId}")
    public ApiResponse<ImageDTO> updateImage(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestParam("file") MultipartFile file
    ) {
        ImageDTO updatedImage = productService.updateImage(productId, imageId, file);
        return new ApiResponse<>("success", 200, "Image updated successfully", updatedImage);
    }
}

