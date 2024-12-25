package com.tirashop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tirashop.dto.RoleDTO;
import com.tirashop.dto.UserDTO;
import com.tirashop.entity.User;
import com.tirashop.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @GetMapping("/list")
    public List<UserDTO> getListUser (){
        return userService.getListUser();
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> createUser(
            @RequestParam("username") String username,
            @RequestParam("firstname") String firstname,
            @RequestParam("lastname") String lastname,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "birthday", required = false) String birthday,
            @RequestParam(value = "role", required = false) List<String> roles, // Truyền danh sách role
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        // Xử lý format ngày tháng
        LocalDate parsedBirthday = null;
        if (birthday != null && !birthday.isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                parsedBirthday = LocalDate.parse(birthday, formatter);
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Invalid date format for birthday. Expected format: dd-MM-yyyy");
            }
        }
        // Tạo UserDTO từ các tham số
        UserDTO userDTO = UserDTO.builder()
                .username(username)
                .firstname(firstname)
                .lastname(lastname)
                .password(password)
                .email(email)
                .phone(phone)
                .address(address)
                .gender(gender)
                .status(status)
                .birthday(parsedBirthday) // Parse String thành LocalDate
                .role(roles != null ? roles.stream()
                        .map(roleName -> RoleDTO.builder().name(roleName).build())
                        .collect(Collectors.toSet()) : null)
                .build();

        // Gọi service để lưu user
        UserDTO savedUser = userService.createUser(userDTO, avatar);

        return ResponseEntity.created(URI.create("/user/" + savedUser.getId())).body(savedUser);
    }


}
