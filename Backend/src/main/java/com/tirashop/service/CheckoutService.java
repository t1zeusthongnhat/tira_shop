package com.tirashop.service;

import com.tirashop.dto.CheckoutRequestDTO;
import com.tirashop.dto.OrderDTO;
import com.tirashop.dto.OrderItemDTO;
import com.tirashop.persitence.entity.*;
import com.tirashop.persitence.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {

    CartRepository cartRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    PaymentRepository paymentRepository;
    ShipmentRepository shipmentRepository;
    ProductRepository productRepository;
    UserRepository userRepository;
    VoucherRepository voucherRepository;

    public OrderDTO checkout(String username, CheckoutRequestDTO request) {
        // 1. Lấy người dùng từ username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // 2. Lấy giỏ hàng ACTIVE của người dùng
        Cart cart = cartRepository.findByUserIdAndStatus(user.getId(), Cart.CartStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active cart found for user: " + username));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty, cannot proceed to checkout.");
        }

        // 3. Tính tổng giá trị đơn hàng
        double totalPrice = 0;
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            if (product.getInventory() < cartItem.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " is out of stock.");
            }

            totalPrice += cartItem.getQuantity() * product.getPrice();
        }

        // 4. Áp dụng voucher nếu có
        Voucher voucher = null;
        if (request.getVoucherId() != null) {
            voucher = voucherRepository.findById(request.getVoucherId())
                    .orElseThrow(() -> new RuntimeException("Voucher not found with ID: " + request.getVoucherId()));

            if (voucher.getStatus() != Voucher.VoucherStatus.ACTIVE) {
                throw new RuntimeException("Voucher is not active.");
            }

            if (voucher.getEndDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("Voucher has expired.");
            }

            if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
                totalPrice -= totalPrice * (voucher.getDiscountValue() / 100);
            } else if (voucher.getDiscountType() == Voucher.DiscountType.FIXED) {
                totalPrice -= voucher.getDiscountValue();
            }

            totalPrice = Math.max(totalPrice, 0);
        }

        // 5. Tạo đơn hàng (Order)
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalPrice(totalPrice);
        order.setStatus(Order.OrderStatus.COMPLETED); // Đặt OrderStatus là COMPLETED
        order.setPaymentStatus(Order.PaymentStatus.PENDING); // Đặt PaymentStatus là PENDING
        order.setVoucher(voucher);
        order.setOrderItems(new ArrayList<>());
        orderRepository.save(order);

        // 6. Tạo OrderItem cho từng sản phẩm
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItem.setCreatedAt(LocalDateTime.now());

            order.getOrderItems().add(orderItem);
            orderItemRepository.save(orderItem);

            Product product = cartItem.getProduct();
            product.setInventory(product.getInventory() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // 7. Xử lý thanh toán
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        payment.setAmount(totalPrice);
        payment.setPaymentMethod(Payment.PaymentMethod.COD);
        payment.setStatus(Payment.PaymentStatus.PENDING); // Đặt PaymentStatus là PENDING
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 8. Tạo vận chuyển (Shipment) cho từng OrderItem
        for (OrderItem orderItem : order.getOrderItems()) {
            Shipment shipment = new Shipment();
            shipment.setOrder(order);
            shipment.setOrderItem(orderItem);
            shipment.setTrackingNumber(UUID.randomUUID().toString());
            shipment.setShippingMethod("Standard Shipping");
            shipment.setStatus(Shipment.ShipmentStatus.SHIPPED); // Đặt ShipmentStatus là SHIPPED
            shipment.setCreatedAt(LocalDateTime.now());

            shipmentRepository.save(shipment);
        }

        // 9. Dọn dẹp giỏ hàng
        cart.getCartItems().clear();
        cart.setStatus(Cart.CartStatus.CHECKED_OUT);
        cartRepository.save(cart);

        // 10. Trả về thông tin đơn hàng qua DTO
        return toOrderDTO(order);
    }

    public OrderDTO toOrderDTO(Order order) {
        return new OrderDTO(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getTotalPrice(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getOrderItems() != null
                        ? order.getOrderItems().stream()
                        .map(this::toOrderItemDTO)
                        .collect(Collectors.toList())
                        : new ArrayList<>()
        );
    }

    private OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        Product product = orderItem.getProduct();
        String productImage = product.getImages() != null && !product.getImages().isEmpty()
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
    }
}