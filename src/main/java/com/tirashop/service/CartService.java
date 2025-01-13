package com.tirashop.service;

import com.tirashop.dto.CartDTO;
import com.tirashop.dto.CartItemDTO;
import com.tirashop.dto.request.AddToCartRequest;
import com.tirashop.entity.Cart;
import com.tirashop.entity.CartItem;
import com.tirashop.entity.Product;
import com.tirashop.entity.User;
import com.tirashop.repository.CartItemRepository;
import com.tirashop.repository.CartRepository;
import com.tirashop.repository.ProductRepository;
import com.tirashop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {

      CartRepository cartRepository;
      CartItemRepository cartItemRepository;
      ProductRepository productRepository;
      UserRepository userRepository;

    public CartDTO getCartByUsername(String username) {
        Cart cart;

        if (username != null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
            cart = cartRepository.findByUserIdAndStatus(user.getId(), Cart.CartStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Active cart not found for user"));
        } else {
            cart = createTemporaryCart();
        }

        return toCartDTO(cart);
    }

    public CartDTO removeItemFromCart(String username, Long itemId) {
        Cart cart = getCartForUser(username);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cart.getCartItems().remove(item);
        cartItemRepository.delete(item);

        return toCartDTO(cartRepository.save(cart));
    }

    public CartDTO clearCart(String username) {
        Cart cart = getCartForUser(username);
        cart.getCartItems().clear();
        cartItemRepository.deleteAll(cart.getCartItems());

        return toCartDTO(cartRepository.save(cart));
    }

    public CartDTO updateItemInCart(String username, CartItemDTO request) {
        Cart cart = getCartForUser(username);

        // Tìm sản phẩm trong giỏ hàng theo CartItem ID
        CartItem item = cart.getCartItems().stream()
                .filter(i -> i.getId().equals(request.getId())) // Kiểm tra ID sản phẩm
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found in the cart"));

        // Cập nhật số lượng nếu hợp lệ
        if (request.getQuantity() > 0) {
            item.setQuantity(request.getQuantity());
        } else {
            throw new RuntimeException("Invalid quantity. Must be greater than 0.");
        }

        // Cập nhật kích thước nếu có thay đổi
        if (request.getProductSize() != null) {
            item.getProduct().setSize(request.getProductSize());
        }

        // Cập nhật thời gian chỉnh sửa
        item.setUpdatedAt(LocalDateTime.now());
        cartItemRepository.save(item);

        // Cập nhật giỏ hàng và trả về DTO
        return toCartDTO(cart);
    }


    private Cart getCartForUser(String username) {
        if (username != null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return cartRepository.findByUserIdAndStatus(user.getId(), Cart.CartStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Active cart not found for user"));
        } else {
            throw new RuntimeException("User must be logged in to perform this operation");
        }
    }
    // Thêm sản phẩm vào giỏ hàng
    public CartDTO addToCartByUsername(AddToCartRequest request, String username) {
        Cart cart;

        // Nếu username không null, lấy thông tin User từ username
        if (username != null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

            // Tìm giỏ hàng ACTIVE của user hoặc tạo mới
            cart = cartRepository.findByUserIdAndStatus(user.getId(), Cart.CartStatus.ACTIVE)
                    .orElseGet(() -> createNewCartForUser(user.getId()));
        } else {
            // Nếu người dùng chưa đăng nhập, tạo giỏ hàng tạm thời
            cart = createTemporaryCart();
        }

        // Kiểm tra sản phẩm
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Nếu sản phẩm đã tồn tại, tăng số lượng
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setUpdatedAt(LocalDateTime.now());
        } else {
            // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setCreatedAt(LocalDateTime.now());
            newItem.setUpdatedAt(LocalDateTime.now());
            cart.getCartItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return toCartDTO(cart);
    }


    private Cart createNewCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setStatus(Cart.CartStatus.ACTIVE);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setCartItems(new ArrayList<>()); // Khởi tạo danh sách rỗng
        return cartRepository.save(cart);
    }

    private Cart createTemporaryCart() {
        Cart cart = new Cart();
        cart.setStatus(Cart.CartStatus.ACTIVE);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setCartItems(new ArrayList<>()); // Khởi tạo danh sách rỗng
        return cartRepository.save(cart);
    }


    private CartDTO toCartDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setUserId(cart.getUser() != null ? cart.getUser().getId() : null);
        cartDTO.setStatus(cart.getStatus().name());
        cartDTO.setCreatedAt(cart.getCreatedAt());

        if (cart.getCartItems() != null) {
            cartDTO.setItems(cart.getCartItems().stream()
                    .map(this::toCartItemDTO)
                    .collect(Collectors.toList()));

            double totalValue = cart.getCartItems().stream()
                    .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                    .sum();
            cartDTO.setTotalValue(totalValue); // Thêm trường tổng giá trị đơn hàng
        } else {
            cartDTO.setItems(new ArrayList<>());
            cartDTO.setTotalValue(0.0);
        }

        return cartDTO;
    }



    // Chuyển đổi CartItem thành CartItemDTO
    private CartItemDTO toCartItemDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setCartId(cartItem.getCart().getId());
        dto.setProductId(cartItem.getProduct().getId());
        dto.setProductName(cartItem.getProduct().getName());
        dto.setProductCategory(cartItem.getProduct().getCategory().getName());
        dto.setProductSize(cartItem.getProduct().getSize());
        dto.setProductPrice(cartItem.getProduct().getPrice());
        dto.setProductImage(cartItem.getProduct().getImages().isEmpty() ? null : cartItem.getProduct().getImages().get(0).getUrl());
        dto.setQuantity(cartItem.getQuantity());
        dto.setCreatedAt(cartItem.getCreatedAt());
        return dto;
    }
}
