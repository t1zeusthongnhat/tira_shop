package com.tirashop.service;

import com.tirashop.dto.RoleDTO;
import com.tirashop.dto.UserDTO;
import com.tirashop.entity.Role;
import com.tirashop.entity.User;
import com.tirashop.repository.RoleRepository;
import com.tirashop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);



    public void updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot found user has id: " + id));

        if (!status.equalsIgnoreCase("Active") && !status.equalsIgnoreCase("Deactive")) {
            throw new IllegalArgumentException("Invalid status value. Allowed: Active, Deactive");
        }

        user.setStatus(status);
        userRepository.save(user);
        log.info("Updated status for user {} to {}", id, status);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<UserDTO> getListUser(){
        return userRepository.findAll().stream().map(this::toDTO).toList();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO createUser(UserDTO userDTO, MultipartFile avatar) {
        log.info("In method create user");

        User user = toEntity(userDTO);

        // Xử lý upload avatar
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = handleImageUpload(avatar);
            user.setAvatar(avatarUrl);
        }

        user.setCreatedAt(LocalDate.now());
        userRepository.save(user);
        return toDTO(user);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO updateUser(Long id, UserDTO userDTO, MultipartFile avatar) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot found user has id: " + id));

        user.setUsername(userDTO.getUsername());
        user.setFirstname(userDTO.getFirstname());
        user.setLastname(userDTO.getLastname());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        user.setGender(userDTO.getGender());
        user.setStatus(userDTO.getStatus());
        user.setBirthday(userDTO.getBirthday());

        // Xử lý role
        Set<Role> role = userDTO.getRole().stream()
                .map(userRole -> roleRepository.findByName(userRole.getName())
                        .orElseThrow(() -> new RuntimeException("Cannot found role!")))
                .collect(Collectors.toSet());
        user.setRole(role);

        // Xử lý avatar nếu có
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = handleImageUpload(avatar);
            user.setAvatar(avatarUrl);
        }

        userRepository.save(user);
        return toDTO(user);
    }

    // Hàm xử lý upload ảnh
    private String handleImageUpload(MultipartFile file) {
        String uploadDir = System.getProperty("user.dir") + "/uploads/avatar";
        try {
            // Xử lý tên file
            String originalFileName = file.getOriginalFilename();
            String avatarFileName = System.currentTimeMillis() + "_" + originalFileName;
            log.info("Avatar file name: {}", avatarFileName);

            // Tạo thư mục nếu chưa tồn tại
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath); // Tạo thư mục uploads/avatar nếu chưa có
            }

            // Đường dẫn file
            java.nio.file.Path filePath = uploadPath.resolve(avatarFileName);

            // Lưu file vào thư mục
            file.transferTo(filePath.toFile());

            // Trả về đường dẫn URL tương đối
            return "/uploads/avatar/" + avatarFileName;

        } catch (IOException e) {
            log.error("Error occurred while uploading image: {}", e.getMessage());
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    private User toEntity(UserDTO userDTO) {
        Set<Role> roles = userDTO.getRole() != null ? userDTO.getRole().stream()
                .map(roleDTO -> roleRepository.findByName(roleDTO.getName())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleDTO.getName())))
                .collect(Collectors.toSet())
                : new HashSet<>();

        return User.builder()
                .id(userDTO.getId())
                .username(userDTO.getUsername())
                .firstname(userDTO.getFirstname())
                .lastname(userDTO.getLastname())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .email(userDTO.getEmail())
                .phone(userDTO.getPhone())
                .address(userDTO.getAddress())
                .gender(userDTO.getGender())
                .status(userDTO.getStatus())
                .avatar(userDTO.getAvatar())
                .birthday(userDTO.getBirthday())
                .createdAt(userDTO.getCreatedAt() != null ? userDTO.getCreatedAt() : LocalDate.now())
                .role(roles)
                .build();
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .password(user.getPassword())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .gender(user.getGender())
                .status(user.getStatus())
                .avatar(user.getAvatar())
                .birthday(user.getBirthday())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDate.now())
                .role(user.getRole() != null ? user.getRole().stream()
                        .map(role -> RoleDTO.builder()
                                .name(role.getName())
                                .description(role.getDescription())
                                .build()).collect(Collectors.toSet())
                        : new HashSet<>())
                .build();
    }
}
