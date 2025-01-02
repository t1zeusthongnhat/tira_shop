package com.tirashop.repository;

import com.tirashop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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







}
