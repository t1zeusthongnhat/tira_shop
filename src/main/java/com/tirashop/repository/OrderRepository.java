package com.tirashop.repository;

import com.tirashop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order,Long> {
    List<Order> findByUser_UsernameAndStatus(String username, Order.OrderStatus status);
}
