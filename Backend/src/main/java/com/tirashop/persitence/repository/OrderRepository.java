package com.tirashop.persitence.repository;

import com.tirashop.persitence.entity.Order;
import com.tirashop.persitence.entity.Order.OrderStatus;
import java.util.Optional;
import javax.swing.text.html.Option;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>,
        JpaSpecificationExecutor<Order> {

    List<Order> findByUser_UsernameAndStatus(String username, Order.OrderStatus status);
    Page<Order> findByUser_UsernameAndStatus(String username, Order.OrderStatus status, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
}
