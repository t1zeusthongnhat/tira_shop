package com.tirashop.controller;

import com.tirashop.dto.OrderItemDTO;
import com.tirashop.dto.ShipmentDetailDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.entity.Shipment;
import com.tirashop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    // OrderController.java

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status", description = "Update the status of an order (PENDING, COMPLETED, CANCELLED)")
    public ApiResponse<String> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        orderService.updateOrderStatus(orderId, username, status);
        return new ApiResponse<>("success", 200, "Order status updated to " + status, null);
    }
    @GetMapping("/pending")
    @Operation(summary = "Get pending products", description = "Retrieve all products in PENDING orders by the user")
    public ApiResponse<List<OrderItemDTO>> getPendingProducts(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<OrderItemDTO> pendingProducts = orderService.getProductsByStatus(username, "PENDING");
        return new ApiResponse<>("success", 200, "Pending products retrieved", pendingProducts);
    }

    @GetMapping("/cancelled")
    @Operation(summary = "Get cancelled products", description = "Retrieve all products in CANCELLED orders by the user")
    public ApiResponse<List<OrderItemDTO>> getCancelledProducts(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<OrderItemDTO> cancelledProducts = orderService.getProductsByStatus(username, "CANCELLED");
        return new ApiResponse<>("success", 200, "Cancelled products retrieved", cancelledProducts);
    }


    @GetMapping("/{orderId}/shipments")
    @Operation(summary = "Get shipment details", description = "Retrieve shipment details for an order")
    public ApiResponse<List<ShipmentDetailDTO>> getShipmentDetails(
            @PathVariable Long orderId,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<ShipmentDetailDTO> shipmentDetails = orderService.getShipmentDetails(orderId, username);
        return new ApiResponse<>("success", 200, "Shipment details retrieved", shipmentDetails);
    }

    @GetMapping("/purchased")
    @Operation(summary = "Get purchased products", description = "Retrieve all purchased products by the user")
    public ApiResponse<List<OrderItemDTO>> getPurchasedProducts(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<OrderItemDTO> purchasedProducts = orderService.getPurchasedProducts(username);
        return new ApiResponse<>("success", 200, "Purchased products retrieved", purchasedProducts);
    }

    @PutMapping("/shipments/{shipmentId}/confirm")
    @Operation(summary = "Confirm delivery", description = "Confirm delivery for a shipment by the user")
    public ApiResponse<String> confirmDelivery(
            @PathVariable Long shipmentId,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        orderService.confirmDelivery(shipmentId, username);
        return new ApiResponse<>("success", 200, "Delivery confirmed", null);
    }

    @PutMapping("/shipments/{shipmentId}/status")
    @Operation(summary = "Update shipment status", description = "Update the status of a shipment (Admin only)")
    public ApiResponse<String> updateShipmentStatus(
            @PathVariable Long shipmentId,
            @RequestParam String status) {
        Shipment.ShipmentStatus shipmentStatus = Shipment.ShipmentStatus.valueOf(status.toUpperCase());
        orderService.updateShipmentStatus(shipmentId, shipmentStatus);
        return new ApiResponse<>("success", 200, "Shipment status updated", null);
    }
}
