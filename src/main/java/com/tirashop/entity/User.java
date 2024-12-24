package com.tirashop.entity;

import com.tirashop.validator.LocalDateAttributeConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true)
    private String username;

    private String firstname;
    private String lastname;
    private String password;

    @Column(name = "email", unique = true)
    private String email;

    private String phone;
    private String address;
    private String gender;
    private String status;


    private String avatar; // URL của avatar trong file system

    @OneToMany(mappedBy = "author")
    private Set<Post> author;

    @ManyToMany
    Set<Role> role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();  // Mối quan hệ One-to-Many với Review

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cart> carts = new ArrayList<>();  // Mối quan hệ One-to-Many với Cart

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();  // Mối quan hệ One-to-Many với Oder

    @Column(name = "birthday")
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate birthday;

    @Column(name = "created_at", updatable = false)
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at")
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate updatedAt;

    @Column(name = "deleted_at")
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate deletedAt;
}
