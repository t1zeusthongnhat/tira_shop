package com.tirashop.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class InvalidatedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động sinh ID nếu cần
    Long id;

    @Column(nullable = false, unique = true)
    String token; // Token bị logout

    @Column(nullable = false)
    Date expiryTime; // Thời gian hết hạn của token
}

