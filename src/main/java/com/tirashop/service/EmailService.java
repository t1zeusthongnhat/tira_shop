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
            log.error("Email mismatch: provided email ({}) does not match user's email ({}) for order ID: {}",
                    toEmail, order.getUser().getEmail(), orderId);
            throw new RuntimeException("Provided email does not match user's email.");
        }

        if (orderDTO.getItems() == null || orderDTO.getItems().isEmpty()) {
            log.error("Order ID: {} has no items. Cannot send confirmation email.", orderId);
            throw new RuntimeException("Order has no items, cannot send confirmation email.");
        }

        String subject = "Order Confirmation - TiraShop";
        StringBuilder content = new StringBuilder();

        content.append("<h2>Thank you for your order, ").append(orderDTO.getUserName()).append("!</h2>");
        content.append("<p>Your order has been successfully placed. Below are your order details:</p>");
        content.append("<p><strong>Order ID:</strong> ").append(orderDTO.getOrderId()).append("</p>");
        content.append("<p><strong>Shipping Address:</strong> ").append(orderDTO.getShippingAddress()).append("</p>");
        content.append("<p><strong>Total Price:</strong> $").append(orderDTO.getTotalPrice()).append("</p>");
        content.append("<p><strong>Payment Status:</strong> ").append(orderDTO.getPaymentStatus()).append("</p>");

        content.append("<h3>Ordered Items:</h3>");
        content.append("<ul>");

        String baseUrl = "https://distinct-spider-cheaply.ngrok-free.app";
        for (OrderItemDTO item : orderDTO.getItems()) {
            String imageUrl = (item.getProductImage() != null && !item.getProductImage().isEmpty())
                    ? baseUrl + item.getProductImage()
                    : "No Image";

            content.append("<li>")
                    .append("<img src='").append(imageUrl).append("' width='50' height='50' alt='Product Image'/>")
                    .append(" <strong>").append(item.getProductName()).append("</strong> - ")
                    .append("Quantity: ").append(item.getQuantity())
                    .append(", Price: $").append(item.getPrice())
                    .append("</li>");
        }
        content.append("</ul>");

        log.info("Sending order confirmation email to: {}", toEmail);
        log.info("Order Data: {}", orderDTO);

        sendEmail(new SendEmailRequest(toEmail, subject, content.toString()));
    }

    public void sendRegistrationEmail(String toEmail, String username) {
        String subject = "Welcome to TiraShop!";
        String content = "<p>Hello " + username + ",</p>"
                + "<p>You have successfully registered at TiraShop!</p>"
                + "<p>Enjoy your shopping experience.</p>";
        sendEmail(new SendEmailRequest(toEmail, subject, content));
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

        String subject = "Password Reset Request";
        String content = "<p>Your verification code is: <strong>" + resetCode + "</strong></p>"
                + "<p>Please enter this code to reset your password.</p>";
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

}
