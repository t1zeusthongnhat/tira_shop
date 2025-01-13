package com.tirashop.service;

import com.tirashop.dto.ReviewDTO;
import com.tirashop.entity.Product;
import com.tirashop.entity.Review;
import com.tirashop.entity.User;
import com.tirashop.repository.ProductRepository;
import com.tirashop.repository.ReviewRepository;
import com.tirashop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private static final String REVIEW_IMAGE_DIR = System.getProperty("user.dir") + "/uploads/review";

    public ReviewDTO addReview(Long productId, String username, int rating, String reviewText, MultipartFile image) {
        // 1. Xác thực người dùng
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 2. Xác thực sản phẩm
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        // 3. Xử lý upload ảnh (nếu có)
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = handleImageUpload(image, REVIEW_IMAGE_DIR);
        }

        // 4. Lưu đánh giá
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setReview(reviewText);
        review.setImage(imageUrl);
        review.setCreatedAt(LocalDate.now());

        reviewRepository.save(review);

        // 5. Trả về ReviewDTO
        return new ReviewDTO(
                review.getId(),
                product.getId(),
                product.getName(),
                user.getId(),
                user.getUsername(),
                rating,
                reviewText,
                imageUrl,
                review.getCreatedAt()
        );
    }


    public boolean deletedReview(Long id){
        if(!reviewRepository.existsById(id)){
            throw new RuntimeException("Cannot found this reviews has id: "+id);
        }
        reviewRepository.deleteById(id);
        return true;
    }
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        // Kiểm tra sản phẩm có tồn tại hay không
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with ID: " + productId);
        }

        // Lấy danh sách review của sản phẩm
        List<Review> reviews = reviewRepository.findByProduct_Id(productId);

        // Chuyển đổi từ `Review` entity sang `ReviewDTO`
        return reviews.stream()
                .map(review -> new ReviewDTO(
                        review.getId(),
                        review.getProduct().getId(),
                        review.getProduct().getName(),
                        review.getUser().getId(),
                        review.getUser().getUsername(),
                        review.getRating(),
                        review.getReview(),
                        review.getImage(),
                        review.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByUser(String username) {
        // Kiểm tra người dùng tồn tại
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // Lấy danh sách review của người dùng
        List<Review> reviews = reviewRepository.findByUser_Id(user.getId());

        // Chuyển đổi từ `Review` entity sang `ReviewDTO`
        return reviews.stream()
                .map(review -> new ReviewDTO(
                        review.getId(),
                        review.getProduct().getId(),
                        review.getProduct().getName(),
                        review.getUser().getId(),
                        review.getUser().getUsername(),
                        review.getRating(),
                        review.getReview(),
                        review.getImage(),
                        review.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }


    // Hàm xử lý upload ảnh
    private String handleImageUpload(MultipartFile file, String uploadDir) {
        try {
            // Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Xử lý tên file
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;

            // Lưu file
            Path filePath = uploadPath.resolve(uniqueFileName);
            file.transferTo(filePath.toFile());

            // Trả về URL tương đối
            return "/uploads/review/" + uniqueFileName;
        } catch (IOException e) {
            log.error("Error uploading image: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
