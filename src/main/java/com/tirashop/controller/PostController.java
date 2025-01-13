package com.tirashop.controller;

import com.tirashop.dto.PostDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.entity.User;
import com.tirashop.repository.UserRepository;
import com.tirashop.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
@Tag(name = "Post", description = "APIs for managing posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {

    PostService postService;


    @PostMapping("/create")
    @Operation(summary = "Create new post", description = "Create a new post with optional image")
    public ApiResponse<PostDTO> createPost(
            @RequestParam String name,
            @RequestParam String topic,
            @RequestParam String shortDescription,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile image,
            Authentication authentication) {

        String username = authentication.getName();  // Get username from authentication

        PostDTO postDTO = postService.createPost(name, topic, shortDescription, content, image, username);
        return new ApiResponse<>("success", 200, "Post created successfully", postDTO);
    }


    @PutMapping("/{postId}/update")
    @Operation(summary = "Update post", description = "Update an existing post")
    public ApiResponse<PostDTO> updatePost(
            @PathVariable Long postId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String shortDescription,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile image,
            Authentication authentication) {

        String username = authentication.getName();  // Get username from authentication
        PostDTO postDTO = postService.updatePost(postId, name, topic, shortDescription, content, image, username);
        return new ApiResponse<>("success", 200, "Post updated successfully", postDTO);
    }


    @DeleteMapping("/{postId}/delete")
    @Operation(summary = "Delete post", description = "Delete an existing post")
    public ApiResponse<Boolean> deletePost(
            @PathVariable Long postId,
            Authentication authentication) {

        String username = authentication.getName();  // Get username from authentication
        boolean success = postService.deletePost(postId, username);
        return new ApiResponse<>("success", 200, "Post deleted successfully", success);
    }


    @GetMapping("/{postId}")
    @Operation(summary = "Get post by ID", description = "Retrieve a specific post by its ID")
    public ApiResponse<PostDTO> getPostById(@PathVariable Long postId) {
        PostDTO postDTO = postService.getPostById(postId);
        return new ApiResponse<>("success", 200, "Post retrieved successfully", postDTO);
    }


    @GetMapping("/all")
    @Operation(summary = "Get all posts", description = "Retrieve all posts")
    public ApiResponse<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return new ApiResponse<>("success", 200, "All posts retrieved successfully", posts);
    }
}



