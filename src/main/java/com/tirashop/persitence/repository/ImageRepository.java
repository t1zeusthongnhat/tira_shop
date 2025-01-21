package com.tirashop.persitence.repository;
import com.tirashop.persitence.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image,Long> {
    // Lấy tất cả các ảnh liên quan đến một sản phẩm
    List<Image> findByProductId(Long productId);

    // Xóa tất cả các ảnh liên quan đến một sản phẩm
    void deleteByProductId(Long productId);

    boolean existsByUrl(String url);
}
