package com.tirashop.dto;

import com.tirashop.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostDTO {

    private Long id;
    private String name;
    private String topic;
    private String imageUrl;
    private String short_description;
    private String content;
    private LocalDate createdAt = LocalDate.now();
    private LocalDate updatedAt;

    private Long authorId;  // Chỉ lấy ID của tác giả
    private String authorName;  // Tên tác giả
    private String authorAvatar;  // URL ảnh đại diện tác giả
}

