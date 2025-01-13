package com.tirashop.service;

import com.tirashop.dto.PostDTO;
import com.tirashop.entity.Post;
import com.tirashop.entity.User;
import com.tirashop.repository.PostRepository;
import com.tirashop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {

    PostRepository postRepository;
    UserRepository userRepository;

    private static final String POST_IMAGE_DIR = System.getProperty("user.dir") + "/uploads/post";

    // Tạo bài viết mới
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public PostDTO createPost(String name, String topic, String shortDescription, String content, MultipartFile image, String username) {
        // Tìm người dùng theo username
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Xử lý upload ảnh
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = handleImageUpload(image, POST_IMAGE_DIR);
        }

        // Tạo bài viết mới
        Post post = new Post();
        post.setName(name);
        post.setTopic(topic);
        post.setShort_description(shortDescription);
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setAuthor(author);
        post.setCreatedAt(LocalDate.now());

        postRepository.save(post);

        return toDTO(post);
    }

    // Cập nhật bài viết
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public PostDTO updatePost(Long postId, String name, String topic, String shortDescription, String content, MultipartFile image, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Kiểm tra quyền sở hữu bài viết
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to update this post.");
        }

        // Cập nhật thông tin bài viết
        if (name != null) post.setName(name);
        if (topic != null) post.setTopic(topic);
        if (shortDescription != null) post.setShort_description(shortDescription);
        if (content != null) post.setContent(content);

        // Xử lý ảnh (nếu có)
        if (image != null && !image.isEmpty()) {
            String imageUrl = handleImageUpload(image, POST_IMAGE_DIR);
            post.setImageUrl(imageUrl);
        }

        post.setUpdatedAt(LocalDate.now());
        postRepository.save(post);

        return toDTO(post);
    }

    // Xóa bài viết
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public boolean deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Kiểm tra quyền sở hữu bài viết
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to delete this post.");
        }

        postRepository.delete(post);
        return true;
    }

    // Lấy thông tin bài viết
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return toDTO(post);
    }

    // Lấy tất cả bài viết
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Chuyển đổi từ Post Entity sang DTO
    public PostDTO toDTO(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .name(post.getName())
                .topic(post.getTopic())
                .imageUrl(post.getImageUrl())
                .short_description(post.getShort_description())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .authorId(post.getAuthor().getId())  // Lấy ID của tác giả
                .authorName(post.getAuthor().getUsername())  // Lấy tên tác giả
                .authorAvatar(post.getAuthor().getAvatar())  // Lấy URL avatar của tác giả
                .build();
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
            return "/uploads/post/" + uniqueFileName;
        } catch (IOException e) {
            log.error("Error uploading image: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}


