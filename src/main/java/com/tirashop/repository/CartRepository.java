package com.tirashop.repository;

import com.tirashop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {

    // Tìm giỏ hàng theo userId và trạng thái (ACTIVE)
    Optional<Cart> findByUserIdAndStatus(Long userId, Cart.CartStatus status);
}
