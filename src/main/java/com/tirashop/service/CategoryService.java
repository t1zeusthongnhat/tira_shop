package com.tirashop.service;

import com.tirashop.dto.CategoryDTO;
import com.tirashop.dto.ProductDTO;
import com.tirashop.entity.Category;

import com.tirashop.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {

    CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCate(){
        List<Category> listCate = categoryRepository.findAll();
        return listCate.stream().map(this::toDTO).toList();
    }

    public CategoryDTO addNewCate(CategoryDTO categoryDTO) {
        // Kiểm tra tính hợp lệ của CategoryDTO
        if (categoryDTO == null || categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }

        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category name already exists");
        }

        // Chuyển đổi DTO thành Entity và lưu vào database
        Category category = toEntity(categoryDTO);
        category.setCreatedAt(LocalDate.now());
        Category savedCategory = categoryRepository.save(category);

        // Chuyển đổi lại từ Entity sang DTO và trả về
        return toDTO(savedCategory);
    }

    public CategoryDTO updateCate(Long id,CategoryDTO categoryDTO) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Cannot found cate has id: "+id));
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setCreatedAt(LocalDate.now());
        category.setUpdatedAt(LocalDate.now());
        // Kiểm tra tính hợp lệ của CategoryDTO
        if (categoryDTO == null || categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        Category savedCategory = categoryRepository.save(category);
        // Chuyển đổi lại từ Entity sang DTO và trả về
        return toDTO(savedCategory);
    }
    public void deleteCate(Long id) {
        // Kiểm tra xem danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Cannot find category with id: " + id);
        }
        // Thực hiện xóa
        categoryRepository.deleteById(id);
    }







    CategoryDTO toDTO(Category category){
        CategoryDTO categoryDTO = CategoryDTO.builder()
                .id(category.getId())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .description(category.getDescription())
                .name(category.getName())
                .build();
        return categoryDTO;
    }

    Category toEntity(CategoryDTO categoryDTO){
        Category category = Category.builder()
                .name(categoryDTO.getName())
                .description(categoryDTO.getDescription())
                .createdAt(LocalDate.now())
                .updatedAt(categoryDTO.getUpdatedAt())
                .build();
        return category;

    }



}
