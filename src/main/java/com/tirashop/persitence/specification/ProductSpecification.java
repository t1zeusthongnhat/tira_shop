package com.tirashop.persitence.specification;

import com.tirashop.persitence.entity.Product;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

@UtilityClass
public class ProductSpecification {

    public static Specification<Product> filterProducts(String productName,String size, Double minPrice, Double maxPrice, String category, String brand) {
        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate predicate = cb.conjunction();

            if (StringUtils.isNotBlank(size)) {
                // Sử dụng LIKE và TRIM
                predicate = cb.and(predicate, cb.like(cb.lower(cb.trim(root.get(Product.Fields.size))), "%" + size.trim().toLowerCase() + "%"));
            }
            if (minPrice != null) {
                // Kiểm tra giá lớn hơn hoặc bằng minPrice
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get(Product.Fields.price), minPrice));
            }
            if (maxPrice != null) {
                // Kiểm tra giá nhỏ hơn hoặc bằng maxPrice
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get(Product.Fields.price), maxPrice));
            }
            if (StringUtils.isNotBlank(category)) {
                // Sử dụng LIKE và TRIM
                predicate = cb.and(predicate, cb.like(cb.lower(cb.trim(root.join(Product.Fields.category).get("name"))), "%" + category.trim().toLowerCase() + "%"));
            }
            if (StringUtils.isNotBlank(brand)) {
                // Sử dụng LIKE và TRIM
                predicate = cb.and(predicate, cb.like(cb.lower(cb.trim(root.join(Product.Fields.brand).get("name"))), "%" + brand.trim().toLowerCase() + "%"));
            }
            if (StringUtils.isNotBlank(productName)) {
                // Sử dụng LIKE và TRIM
                predicate = cb.and(predicate, cb.like(cb.lower(cb.trim(root.get(Product.Fields.name))), "%" + productName.trim().toLowerCase() + "%"));
            }
            return predicate;
        };
    }
}


