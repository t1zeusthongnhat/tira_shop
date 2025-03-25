package com.tirashop.service;

import com.tirashop.dto.OrderDTO;
import com.tirashop.dto.OrderItemDTO;
import com.tirashop.dto.request.EmailRequest;
import com.tirashop.dto.request.SendEmailRequest;
import com.tirashop.dto.response.EmailResponse;
import com.tirashop.persitence.entity.Order;
import com.tirashop.persitence.entity.User;
import com.tirashop.persitence.repository.OrderRepository;
import com.tirashop.persitence.repository.UserRepository;
import com.tirashop.persitence.repository.httpclient.EmailClient;
import feign.FeignException;

import java.util.Optional;
import java.util.Random;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailClient emailClient;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final CheckoutService checkoutService;

    @Value("${email.brevo.key}")
    private String apiKey;

    @Value("${email.brevo.sender}")
    private String senderEmail;

    @Value("${email.brevo.name}")
    private String senderName;

    public EmailResponse sendEmail(SendEmailRequest request) {
        EmailRequest emailRequest = EmailRequest.builder()
                .sender(EmailRequest.Sender.builder()
                        .name(senderName)
                        .email(senderEmail)
                        .build())
                .to(List.of(new EmailRequest.Recipient(request.getTo())))
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .build();
        try {
            return emailClient.sendEmail(apiKey, emailRequest);
        } catch (FeignException e) {
            log.error("Error sending email: {}", e.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }

    public void sendOrderConfirmationEmail(String toEmail, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        OrderDTO orderDTO = checkoutService.toOrderDTO(order);

        if (!order.getUser().getEmail().equalsIgnoreCase(toEmail)) {
            log.error(
                    "Email mismatch: provided email ({}) does not match user's email ({}) for order ID: {}",
                    toEmail, order.getUser().getEmail(), orderId);
            throw new RuntimeException("Provided email does not match user's email.");
        }

        if (orderDTO.getItems() == null || orderDTO.getItems().isEmpty()) {
            log.error("Order ID: {} has no items. Cannot send confirmation email.", orderId);
            throw new RuntimeException("Order has no items, cannot send confirmation email.");
        }

        String subject = "🛍️ ORDER CONFIRMATION - TiraShop";
        StringBuilder content = new StringBuilder();

        content.append(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; ");
        content.append(
                "border: 1px solid #d6d6d6; border-radius: 10px; background-color: #fdf3f3; text-align: center;'>");

        content.append(
                "<img src='https://distinct-spider-cheaply.ngrok-free.app/uploads/logo/LogoBTEC.png' alt='TiraShop Logo' ");
        content.append("style='width: 120px; margin-bottom: 20px;'>");

        content.append("<h2 style='color: #e57373; text-transform: uppercase;'>🎉 THANK YOU "
                + orderDTO.getUserName()
                + " FOR YOUR ORDER!</h2>");
        content.append(
                "<p style='font-size: 16px; color: #555;'>Your order has been successfully placed. Here are the details:</p>");

        content.append(
                "<p style='font-size: 16px; color: #444;'><strong>Order Status:</strong> <span style='color: #e57373;'>"
                        + orderDTO.getStatus() + "</span></p>");
        content.append(
                "<p style='font-size: 16px; color: #444;'><strong>Shipping Address:</strong> "
                        + orderDTO.getShippingAddress() + "</p>");

        content.append("<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>");
        content.append("<tr style='background-color: #e57373; color: white;'>");
        content.append("<th style='padding: 12px; border: 1px solid #ddd;'>Product</th>");
        content.append("<th style='padding: 12px; border: 1px solid #ddd;'>Quantity</th>");
        content.append("<th style='padding: 12px; border: 1px solid #ddd;'>Price</th>");
        content.append("</tr>");

        for (OrderItemDTO item : orderDTO.getItems()) {
            content.append("<tr style='background-color: #ffefef;'>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd; text-align: left;'>");
            content.append(
                    "<img src='https://distinct-spider-cheaply.ngrok-free.app"
                            + item.getProductImage() + "' ");
            content.append("alt='" + item.getProductName()
                    + "' style='width: 95px; height: 95px; margin-right: 10px; vertical-align: middle;'>");
            content.append(item.getProductName() + "</td>");
            content.append(
                    "<td style='padding: 12px; border: 1px solid #ddd;'>" + item.getQuantity()
                            + "</td>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd;'>$" + item.getPrice()
                    + "</td>");
            content.append("</tr>");
        }
        content.append("</table>");

        content.append(
                "<p style='font-size: 18px; font-weight: bold; margin-top: 20px; color: #e57373;'>Total: $"
                        + orderDTO.getTotalPrice() + "</p>");

        content.append("</div>");

        sendEmail(new SendEmailRequest(toEmail, subject, content.toString()));
    }


    public void sendRegistrationEmail(String toEmail, String username) {
        String subject = "🎉 Welcome to TiraShop!";
        String content = "<p>Hello " + username + ",</p>"
                + "<p>You have successfully registered at TiraShop!</p>"
                + "<p>Enjoy your shopping experience.</p>";
        sendEmail(new SendEmailRequest(toEmail, subject, content));
    }

    public void resetPassword(String toEmail, String resetCode, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(toEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Email does not exist.");
        }

        User user = userOpt.get();
        if (!user.getResetCode().equals(resetCode)) {
            throw new RuntimeException("Invalid verification code.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        userRepository.save(user);
    }

    public void sendForgotPasswordEmail(String toEmail) {
        Optional<User> userOpt = userRepository.findByEmail(toEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Email does not exist in our system.");
        }

        String resetCode = String.format("%06d", new Random().nextInt(999999));
        User user = userOpt.get();
        user.setResetCode(resetCode);
        userRepository.save(user);

        String subject = "🔑 Password Reset Request";
        String content = "<div style='text-align: center;'>"
                + "<h2>Your verification code</h2>"
                + "<p style='font-size: 22px; font-weight: bold; color: #2E86C1; border: 1px solid #ddd; padding: 10px; display: inline-block; border-radius: 5px;'>"
                + resetCode + "</p>"
                + "<p>Enter this code to reset your password.</p>"
                + "</div>";

        sendEmail(new SendEmailRequest(toEmail, subject, content));
    }
}
