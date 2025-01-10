package com.tirashop.service;

import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.request.ProductRequest;
import com.tirashop.dto.response.ProductResponse;
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

    public List<ProductDTO> filterProducts(String size, Double price, String category, String brand) {
        // Gọi repository để lấy danh sách sản phẩm
        List<Product> products = productRepository.filterProductsWithImages(size, price, category, brand);

        // Kiểm tra nếu không có sản phẩm nào
        if (products.isEmpty()) {
            log.info("No products found for the given filter: size={}, price={}, category={}, brand={}", size, price, category, brand);
            throw new RuntimeException("No products found for the given filter criteria.");
        }
        // Chuyển đổi từ Product sang ProductDTO
        return products.stream().map(this::toDTO).collect(Collectors.toList());
    }


    public List<ProductDTO> getAllProductsByBrandName(String brandName){
        log.info("In service");
        // Kiểm tra xem brand có tồn tại không
        Brand brand = brandRepository.findByName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand with name '" + brandName + "' does not exist"));

        // Lấy danh sách sản phẩm theo brand name
        List<Product> products = productRepository.findAllByBrandName(brandName);
        return products.stream().map(this::toDTO).toList();
    }


    public List<ProductDTO> getAllProductsByCategoryName(String cateName){
        log.info("In service");
        // Kiểm tra xem brand có tồn tại không
        Category cate = categoryRepository.findByName(cateName)
                .orElseThrow(() -> new RuntimeException("Brand with name '" + cateName + "' does not exist"));

        // Lấy danh sách sản phẩm theo cate name
        List<Product> products = productRepository.findAllByCateName(cateName);
        return products.stream().map(this::toDTO).toList();
    }

//    getAllProductsByCategoryName
//    getAllProductsPriceAtoZ
//    getAllProductsPriceZtoA


    public ProductResponse createProduct(ProductRequest request) {
        // Kiểm tra nếu tên sản phẩm đã tồn tại
        if (productRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Product name already exists");
        }

        // Kiểm tra giá trị hợp lệ
        if (request.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }

        if (request.getOriginalPrice() != null && request.getOriginalPrice() < request.getPrice()) {
            throw new IllegalArgumentException("Original price must be greater than current price");
        }

        // Chuyển đổi từ ProductRequest sang Product
        Product product = toEntity(request);

        // Gán giá gốc (nếu có)
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }

        // Lưu sản phẩm
        productRepository.save(product);
        return toResponse(product);
    }




    public ProductResponse updateProduct(ProductRequest request, Long id) {
        Product productUpdate = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot find product with ID: " + id));

        // Kiểm tra giá trị hợp lệ
        if (request.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }

        if (request.getOriginalPrice() != null && request.getOriginalPrice() < request.getPrice()) {
            throw new IllegalArgumentException("Original price must be greater than current price");
        }

        // Cập nhật các trường
        productUpdate.setName(request.getName());
        productUpdate.setCode(request.getCode());
        productUpdate.setDescription(request.getDescription());
        productUpdate.setMaterial(request.getMaterial());
        productUpdate.setPrice(request.getPrice());
        productUpdate.setQuantity(request.getQuantity());
        productUpdate.setStatus(request.getStatus());
        productUpdate.setSize(request.getSize());
        productUpdate.setInventory(request.getInventory());
        productUpdate.setUpdatedAt(LocalDate.now());

        // Xử lý giá gốc
        if (request.getOriginalPrice() != null) {
            productUpdate.setOriginalPrice(request.getOriginalPrice());
        } else {
            productUpdate.setOriginalPrice(null);
        }

        // Xử lý mối quan hệ Category và Brand (đã đúng, không cần chỉnh)

        // Lưu sản phẩm sau khi cập nhật
        productRepository.save(productUpdate);
        return toResponse(productUpdate);
    }


    public ProductResponse getProductById(Long id){
       Product product = productRepository.findById(id)
               .orElseThrow(()-> new RuntimeException("Cannot found product has id: "+id));
        return toResponse(product);
    }

    public void deleteProduct(Long id){
        productRepository.deleteById(id);
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
        productDTO.setUpdatedAt(product.getUpdatedAt());
        productDTO.setOriginalPrice(product.getOriginalPrice());
        // Lấy danh sách URL ảnh
        List<String> productUrl = product.getImages().stream().map(Image::getUrl).toList();
        productDTO.setImageUrls(productUrl);

        return productDTO;
    }

    // Chuyển đổi từ Product sang ProductResponse
    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setOriginalPrice(product.getOriginalPrice());
        response.setCode(product.getCode());
        response.setDescription(product.getDescription());
        response.setMaterial(product.getMaterial());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setStatus(product.getStatus());
        response.setSize(product.getSize());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        response.setInventory(product.getInventory());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    // Chuyển đổi từ ProductRequest sang Product
    private Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setId(request.getId());
        product.setName(request.getName());
        product.setCode(request.getCode());
        product.setDescription(request.getDescription());
        product.setMaterial(request.getMaterial());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setStatus(request.getStatus());
        product.setSize(request.getSize());
        product.setInventory(request.getInventory());
        product.setOriginalPrice(request.getOriginalPrice());

        // createdAt luôn là LocalDate.now() nếu là sản phẩm mới
        if (product.getId() == null) {
            product.setCreatedAt(LocalDate.now());
        } else {
            product.setCreatedAt(request.getCreatedAt());
        }

        product.setUpdatedAt(request.getUpdatedAt());

        // Xử lý mối quan hệ với Category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not exist"));
            product.setCategory(category);
        }

        // Xử lý mối quan hệ với Brand
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new IllegalArgumentException("Brand not exist"));
            product.setBrand(brand);
        }

        return product;
    }
}
