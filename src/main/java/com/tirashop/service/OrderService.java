package com.tirashop.service;

import com.tirashop.dto.OrderItemDTO;
import com.tirashop.dto.ShipmentDetailDTO;
import com.tirashop.dto.response.RevenueResponse;
import com.tirashop.dto.response.RevenueResponse.ProductPerformance;
import com.tirashop.dto.response.SearchOrderItem;
import com.tirashop.model.PagedData;
import com.tirashop.persitence.entity.Order;
import com.tirashop.persitence.entity.OrderItem;
import com.tirashop.persitence.entity.Product;
import com.tirashop.persitence.entity.Shipment;
import com.tirashop.persitence.entity.User;
import com.tirashop.persitence.repository.OrderRepository;
import com.tirashop.persitence.repository.ShipmentRepository;
import com.tirashop.persitence.specification.OrderSpecification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {


    //Quản lý Shipment
    ShipmentRepository shipmentRepository;
    OrderRepository orderRepository;

    public RevenueResponse getRevenueAndProductPerformance() {
        // Fetch all completed orders
        List<Order> completedOrders = orderRepository.findByStatus(Order.OrderStatus.COMPLETED);

        // Calculate total revenue and product performance
        double totalRevenue = 0.0;
        Map<Long, ProductPerformance> productPerformanceMap = new HashMap<>();

        for (Order order : completedOrders) {
            for (OrderItem orderItem : order.getOrderItems()) {
                Product product = orderItem.getProduct();
                double itemRevenue = orderItem.getPrice() * orderItem.getQuantity();
                totalRevenue += itemRevenue;

                // Update product performance
                productPerformanceMap.compute(product.getId(), (key, existing) -> {
                    if (existing == null) {
                        return new RevenueResponse.ProductPerformance(
                                product.getId(),
                                product.getName(),
                                product.getCode(),
                                orderItem.getQuantity(),
                                itemRevenue
                        );
                    } else {
                        existing.setTotalQuantitySold(
                                existing.getTotalQuantitySold() + orderItem.getQuantity());
                        existing.setTotalRevenue(existing.getTotalRevenue() + itemRevenue);
                        return existing;
                    }
                });
            }
        }

        // Convert map to list
        List<RevenueResponse.ProductPerformance> productPerformances = productPerformanceMap.values()
                .stream()
                .collect(Collectors.toList());

        return new RevenueResponse(totalRevenue, productPerformances);
    }

    public PagedData<SearchOrderItem> searchOrders(String keyword, Pageable pageable) {
        var orderSpec = OrderSpecification.searchOrders(keyword);
        var orderPage = orderRepository.findAll(orderSpec, pageable);

        List<SearchOrderItem> orderItems = orderPage.getContent().stream().flatMap(order ->
                order.getOrderItems().stream().map(orderItem ->
                        new SearchOrderItem(
                                order.getUser().getUsername(),
                                orderItem.getProduct().getName(),
                                orderItem.getProduct().getBrand() != null ? orderItem.getProduct()
                                        .getBrand().getName() : null,
                                orderItem.getProduct().getCategory() != null
                                        ? orderItem.getProduct().getCategory().getName() : null,
                                orderItem.getProduct().getSize(),
                                orderItem.getQuantity(),
                                orderItem.getPrice(),
                                orderItem.getProduct().getImages() != null
                                        && !orderItem.getProduct().getImages().isEmpty()
                                        ? orderItem.getProduct().getImages().get(0).getUrl()
                                        : null,
                                order.getCreatedAt()
                        )
                )
        ).collect(Collectors.toList());

        return new PagedData<>(
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderItems
        );
    }


    public List<OrderItemDTO> getProductsByStatus(String username, String status) {
        if (username == null) {
            throw new RuntimeException("User must be logged in");
        }

        // Chuyển đổi trạng thái từ String sang Enum
        Order.OrderStatus orderStatus;
        try {
            orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }

        // Lấy danh sách đơn hàng theo trạng thái
        List<Order> orders = orderRepository.findByUser_UsernameAndStatus(username, orderStatus);

        // Lấy sản phẩm từ các đơn hàng
        return orders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(orderItem -> {
                    Product product = orderItem.getProduct();
                    String productImage =
                            product.getImages() != null && !product.getImages().isEmpty()
                                    ? product.getImages().get(0).getUrl()
                                    : null;

                    return new OrderItemDTO(
                            product.getId(),
                            product.getName(),
                            product.getBrand() != null ? product.getBrand().getName() : null,
                            product.getCategory() != null ? product.getCategory().getName() : null,
                            product.getSize(),
                            product.getInventory(),
                            orderItem.getQuantity(),
                            orderItem.getPrice(),
                            productImage,
                            orderItem.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // Lấy danh sách Shipment cho đơn hàng
    public List<ShipmentDetailDTO> getShipmentDetails(Long orderId, String username) {
        List<Shipment> shipments = shipmentRepository.findByOrder_Id(orderId);

        return shipments.stream()
                .map(shipment -> toShipmentDetailDTO(shipment))
                .collect(Collectors.toList());
    }

    public void updateOrderStatus(Long orderId, String username, String status) {
        // Lấy thông tin đơn hàng từ ID
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Kiểm tra quyền sở hữu đơn hàng
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to update this order status.");
        }

        // Kiểm tra trạng thái truyền vào có hợp lệ hay không
        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status provided.");
        }

        // Cập nhật trạng thái đơn hàng
        order.setStatus(newStatus);
        orderRepository.save(order);
    }


    public List<OrderItemDTO> getPurchasedProducts(String username) {
        if (username == null) {
            throw new RuntimeException("User must be logged in");
        }

        // Tìm danh sách các đơn hàng đã hoàn tất (COMPLETED) của người dùng
        List<Order> completedOrders = orderRepository.findByUser_UsernameAndStatus(username,
                Order.OrderStatus.COMPLETED);

        // Từ các đơn hàng, lấy danh sách sản phẩm đã mua
        return completedOrders.stream()
                .flatMap(order -> order.getOrderItems()
                        .stream()) // Lấy tất cả sản phẩm từ các đơn hàng
                .map(orderItem -> {
                    Product product = orderItem.getProduct();
                    String productImage =
                            product.getImages() != null && !product.getImages().isEmpty()
                                    ? product.getImages().get(0).getUrl()
                                    : null;

                    return new OrderItemDTO(
                            product.getId(),
                            product.getName(),
                            product.getBrand() != null ? product.getBrand().getName() : null,
                            product.getCategory() != null ? product.getCategory().getName() : null,
                            product.getSize(),
                            product.getInventory(),
                            orderItem.getQuantity(),
                            orderItem.getPrice(),
                            productImage,
                            orderItem.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // Xác nhận đã nhận hàng (User)
    public void confirmDelivery(Long shipmentId, String username) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (!shipment.getOrder().getUser().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to confirm this shipment.");
        }

        if (shipment.getStatus() != Shipment.ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Shipment must be in DELIVERED status to confirm.");
        }

        shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
        shipmentRepository.save(shipment);
    }

    // Admin: Cập nhật trạng thái giao hàng
    public void updateShipmentStatus(Long shipmentId, Shipment.ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        shipment.setStatus(status);
        shipmentRepository.save(shipment);
    }

    private ShipmentDetailDTO toShipmentDetailDTO(Shipment shipment) {
        OrderItem orderItem = shipment.getOrderItem();
        String productImage = orderItem != null && orderItem.getProduct().getImages() != null
                && !orderItem.getProduct().getImages().isEmpty()
                ? orderItem.getProduct().getImages().get(0).getUrl()
                : null;

        return new ShipmentDetailDTO(
                shipment.getTrackingNumber(),
                shipment.getShippingMethod(),
                shipment.getStatus().name(),
                orderItem != null ? orderItem.getProduct().getId() : null,
                orderItem != null ? orderItem.getProduct().getName() : null,
                productImage,
                orderItem != null ? orderItem.getQuantity() : 0,
                shipment.getCreatedAt()
        );
    }
}
