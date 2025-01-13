package com.tirashop.controller;

import com.tirashop.dto.ReviewDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@Tag(name = "Review", description = "APIs for managing reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{productId}")
    @Operation(summary = "Create review", description = "Create review for product")
    public ApiResponse<ReviewDTO> addReview(
            @PathVariable Long productId,
            @RequestParam int rating,
            @RequestParam(required = false) String reviewText,
            @RequestParam(required = false) MultipartFile image,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        ReviewDTO review = reviewService.addReview(productId, username, rating, reviewText, image);

        return new ApiResponse<>("success", 200, "Review added successfully", review);
    }


    @DeleteMapping("/delete")
    @Operation(summary = "Delete review", description = "Delete review of product")
    public ApiResponse<Boolean> deletedReview(@RequestParam Long id){
        return new ApiResponse<>("success", 200, "Review added successfully", reviewService.deletedReview(id));

    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews by product", description = "Retrieve reviews for a specific product by product ID")
    public ApiResponse<List<ReviewDTO>> getReviewsByProduct(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByProductId(productId);
        return new ApiResponse<>("success", 200, "Reviews retrieved successfully", reviews);
    }

    @GetMapping("/user")
    @Operation(summary = "Get reviews by user", description = "Retrieve reviews created by the authenticated user")
    public ApiResponse<List<ReviewDTO>> getReviewsByUser(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<ReviewDTO> reviews = reviewService.getReviewsByUser(username);
        return new ApiResponse<>("success", 200, "User reviews retrieved successfully", reviews);
    }
}
