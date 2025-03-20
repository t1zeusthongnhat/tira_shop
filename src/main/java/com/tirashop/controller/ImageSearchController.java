package com.tirashop.controller;

import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.ProductService;
import com.tirashop.service.openAi.ImageSearchService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/tirashop/product")
@RequiredArgsConstructor
public class ImageSearchController {

    private final ImageSearchService imageSearchService;
    private final ProductService productService;

    @PostMapping(value = "/search-by-image", consumes = "multipart/form-data")
    @Operation(summary = "Search products using an image", description = "Extract features from an image and search for related products")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<PagedData<ProductDTO>> searchByImage(
            @RequestParam("file") MultipartFile file, Pageable pageable) {
        try {
            String predictedLabel = imageSearchService.predictLabel(file);
            log.info("Predicted label: {}", predictedLabel);
            PagedData<ProductDTO> searchResults = productService.searchProductsByLabel(
                    predictedLabel, pageable);

            return new ApiResponse<>("success", 200, "Image search results retrieved successfully",
                    searchResults);
        } catch (IOException e) {
            return new ApiResponse<>("error", 500, "Error processing file: " + e.getMessage(),
                    null);
        }
    }

}
