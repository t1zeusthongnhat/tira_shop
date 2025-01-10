package com.tirashop.controller;

import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.request.ProductRequest;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.dto.response.ProductResponse;
import com.tirashop.entity.Product;
import com.tirashop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@Slf4j
@RestController
@RequestMapping("/product")
@Tag(name = "Product", description = "APIs for managing products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

    ProductService productService;

    @GetMapping("/list")
    @Operation(summary = "Get all products", description = "Retrieve all products with their details")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Products retrieved successfully")
    public ApiResponse<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProductsWithImages();
        return new ApiResponse<>("success", 200, "Get Product success!", products);
    }

    //filter san pham
    @GetMapping("/filter")
    public ApiResponse<List<ProductDTO>> getFilteredProducts(
            @RequestParam(required = false) String size,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand
    ) {
        // Gọi service để xử lý filter
        List<ProductDTO> products = productService.filterProducts(size, price, category, brand);
        return new ApiResponse<>("success", 200, "Filtered products retrieved successfully", products);
    }

    @PostMapping("/add")
    @Operation(summary = "Add new product", description = "Add a new product with its details")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product added successfully")
    @ResponseStatus(HttpStatus.CREATED) // Trả về mã 201 (Created)
    public ApiResponse<ProductResponse> addProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ApiResponse<>("success", 201, "Add Product success", response);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update product", description = "Update product details by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated successfully")
    @ResponseStatus(HttpStatus.OK) // Trả về mã 200 (OK)
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(request, id);
        return new ApiResponse<>("success", 200, "Update Product success", response);
    }


    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete product", description = "Delete a product by its ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deleted successfully")
    @ResponseStatus(HttpStatus.OK) // Trả về mã 200 (OK)
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ApiResponse<>("success", 200, "Delete Product success", null);
    }

    @GetMapping("get/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve product details by its ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product retrieved successfully")
    @ResponseStatus(HttpStatus.OK) // Trả về mã 200 (OK)
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return new ApiResponse<>("success", 200, "Get Product success", response);
    }

    @GetMapping("/brand")
    public ApiResponse<List<ProductDTO>> getProductByBrandName(@RequestParam String name){
        log.info("In controller");
        List<ProductDTO> list = productService.getAllProductsByBrandName(name);
        return new ApiResponse<>("sucess",200,"Get Product by Brand name success",list);
    }

    @GetMapping("/category")
    public ApiResponse<List<ProductDTO>> getProductByCateName(@RequestParam String name){
        log.info("In controller");
        List<ProductDTO> list = productService.getAllProductsByCategoryName(name);
        return new ApiResponse<>("sucess",200,"Get Product by Category name success",list);
    }



}

