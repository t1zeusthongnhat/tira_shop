package com.tirashop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequestDTO {
    private String shippingAddress; // Địa chỉ nhận hàng
    private String paymentMethod;   // COD, PAYPAL, VNPay
    private Long voucherId;         // Mã voucher (nếu có)
}

