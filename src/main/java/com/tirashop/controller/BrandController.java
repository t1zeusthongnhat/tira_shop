package com.tirashop.controller;

import com.tirashop.dto.BrandDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/brand")
@Tag(name = "Brand", description = "APIs for managing brands")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandController {

    BrandService brandService;


    @GetMapping()
    @Operation(summary = "Filter brands with pagination", description = "Filter brands by name with pagination support")
    public ApiResponse<PagedData<BrandDTO>> filterBrands(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") int pageNo, // Mặc định là trang 1
            @RequestParam(defaultValue = "10") int elementPerPage // Mặc định 10 phần tử/trang
    ) {
        PagedData<BrandDTO> pagedData = brandService.filterBrands(name, pageNo, elementPerPage);
        return new ApiResponse<>("success", 200, "Filtered brands retrieved successfully", pagedData);
    }


    @GetMapping("/list")
    @Operation(summary = "Get all brands", description = "Retrieve all brands with their details")
    public ApiResponse<List<BrandDTO>> getAllBrands() {
        List<BrandDTO> brands = brandService.getAllBrands();
        return new ApiResponse<>("success", 200, "Get Brands success", brands);
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Add new brand", description = "Add a new brand with its details and upload logo")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BrandDTO> addBrand(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        BrandDTO response = brandService.createBrand(name, description, logo);
        return new ApiResponse<>("success", 201, "Add Brand success", response);
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update brand", description = "Update brand details and logo by ID")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<BrandDTO> updateBrand(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        BrandDTO response = brandService.updateBrand(id, name, description, logo);
        return new ApiResponse<>("success", 200, "Update Brand success", response);
    }


    @GetMapping("/get/{id}")
    @Operation(summary = "Get brand by ID", description = "Retrieve brand details by ID")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<BrandDTO> getBrandById(@PathVariable Long id) {
        BrandDTO response = brandService.getBrandById(id);
        return new ApiResponse<>("success", 200, "Get Brand success", response);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete brand by ID", description = "Delete brand details by ID")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return new ApiResponse<>("success", 200, "Get Brand success", null);
    }
}
