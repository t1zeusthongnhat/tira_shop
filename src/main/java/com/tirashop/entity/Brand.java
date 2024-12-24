package com.tirashop.entity;

import com.tirashop.validator.LocalDateAttributeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "brand")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String logo; // Lưu trữ URL của logo

    @Column(name = "created_at", updatable = false)
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at")
    @Convert(converter = LocalDateAttributeConverter.class)
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "brand")
    private List<Product> products;
}
