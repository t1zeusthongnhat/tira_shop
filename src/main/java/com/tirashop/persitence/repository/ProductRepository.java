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

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :label, '%')) " +
            "OR LOWER(p.tagName) LIKE LOWER(CONCAT('%', :label, '%'))")
    Page<Product> findByCategoryOrBrandOrName(@Param("label") String label, Pageable pageable);

}

