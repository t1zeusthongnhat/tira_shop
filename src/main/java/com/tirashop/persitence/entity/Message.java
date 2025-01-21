package com.tirashop.persitence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chat_room_id", nullable = false) // Liên kết với phòng chat
    private ChatRoom chatRoom;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false) // Liên kết với người gửi (user hoặc admin)
    private User sender;

    @Column(columnDefinition = "TEXT") // Nội dung tin nhắn dạng văn bản
    private String content;

    @Column(name = "file_url") // URL file tải lên (ảnh, video, tài liệu, v.v.)
    private String fileUrl;

    @Column(name = "file_type") // Loại file (image, video, document)
    private String fileType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

