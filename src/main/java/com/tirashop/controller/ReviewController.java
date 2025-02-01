package com.tirashop.controller;

import com.tirashop.dto.ReviewDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tirashop/reviews")
@Tag(name = "Review", description = "APIs for managing reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;


    @GetMapping("")
    @Operation(summary = "Filter and list all reviews", description = "Retrieve all reviews")
    public ApiResponse<PagedData<ReviewDTO>> getAllReviews(
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "username", required = false) String username,
            @PageableDefault(page = 0,size = 25,sort = "createdAt",direction = Direction.DESC) Pageable pageable
    ) {
        var reviews = reviewService.searchReview(rating, username, pageable);
        return new ApiResponse<>("success", 200, "All reviews retrieved successfully", reviews);
    }

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
    public ApiResponse<Boolean> deletedReview(@RequestParam Long id) {
        return new ApiResponse<>("success", 200, "Review added successfully",
                reviewService.deletedReview(id));

    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews by product ID", description = "Retrieve all reviews for a product with pagination")
    public ApiResponse<PagedData<ReviewDTO>> getReviewsByProductId(
            @PathVariable Long productId,
            Pageable pageable
    ) {
        var reviews = reviewService.getReviewsByProductId(productId, pageable);
        return new ApiResponse<>("success", 200, "Reviews retrieved successfully", reviews);
    }


    @GetMapping("/user/{username}")
    @Operation(summary = "Get reviews by username", description = "Retrieve all reviews by a user with pagination")
    public ApiResponse<PagedData<ReviewDTO>> getReviewsByUser(
            @PathVariable String username,
            Pageable pageable
    ) {
        var reviews = reviewService.getReviewsByUser(username, pageable);
        return new ApiResponse<>("success", 200, "Reviews retrieved successfully", reviews);
    }

}
