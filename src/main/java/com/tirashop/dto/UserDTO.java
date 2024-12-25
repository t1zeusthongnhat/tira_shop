package com.tirashop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;

    @Size(min = 6, message = "Username must be at least 6 characters!")
    private String username;
    private String firstname;
    private String lastname;

    @Size(min = 3, message = "Password must be at least 3 characters!")
    private String password;
    @Email(message = "Email must be in valid format !!!")
    private String email;
    private String phone;
    private String address;
    private String gender;
    private String status;
    private  String avatar;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate birthday;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate createdAt = LocalDate.now();

    Set<RoleDTO> role;
}
