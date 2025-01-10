package com.tirashop.repository;

import com.tirashop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    //Lấy tất cả các Product cùng với danh sách các Image liên kết của chúng.
    //Sử dụng LEFT JOIN FETCH để tránh Lazy Loading, đảm bảo dữ liệu images được tải ngay lập tức khi truy vấn Product.
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images")
    List<Product> findAllWithImages();

    @Query("SELECT DISTINCT p FROM Product p LEFT join FETCH p.brand WHERE p.brand.name = :brandName")
    List<Product> findAllByBrandName(String brandName);


    @Query("SELECT DISTINCT p FROM Product p LEFT join FETCH p.category WHERE p.category.name = :cateName")
    List<Product> findAllByCateName(String cateName);

    boolean existsByName(String name);

    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.images " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.brand " +
            "WHERE (:size IS NULL OR p.size = :size) " +
            "AND (:price IS NULL OR p.price = :price) " +
            "AND (:category IS NULL OR p.category.name = :category) " +
            "AND (:brand IS NULL OR p.brand.name = :brand)")
    List<Product> filterProductsWithImages(
            @Param("size") String size,
            @Param("price") Double price,
            @Param("category") String category,
            @Param("brand") String brand
    );

}
