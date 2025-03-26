package com.tirashop.persitence.repository;

import com.tirashop.persitence.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);

    @Query("SELECT p FROM Product p WHERE LOWER(p.tagName) LIKE LOWER(CONCAT('%', :label, '%'))")
    Page<Product> findByTagName(@Param("label") String label, Pageable pageable);

    @Query(value = "SELECT * FROM product WHERE " +
            "(:word1 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word1, '%')))",
            countQuery = "SELECT COUNT(*) FROM product WHERE " +
                    "(:word1 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word1, '%')))",
            nativeQuery = true)
    Page<Product> findByNameContainingVietnamese(@Param("word1") String word1, Pageable pageable);

    @Query(value = "SELECT * FROM product WHERE " +
            "(:word1 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word1, '%'))) " +
            "OR (:word2 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word2, '%')))",
            countQuery = "SELECT COUNT(*) FROM product WHERE " +
                    "(:word1 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word1, '%'))) " +
                    "OR (:word2 IS NOT NULL AND LOWER(name) LIKE LOWER(CONCAT('%', :word2, '%')))",
            nativeQuery = true)
    Page<Product> findByNameContainingEnglish(@Param("word1") String word1, @Param("word2") String word2, Pageable pageable);

}



