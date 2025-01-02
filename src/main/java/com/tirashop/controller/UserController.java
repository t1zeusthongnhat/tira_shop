package com.tirashop.controller;
import com.tirashop.dto.RoleDTO;
import com.tirashop.dto.UserDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.entity.User;
import com.tirashop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "APIs for user management")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @GetMapping("/list")
    @Operation(summary = "Get user list", description = "Retrieve the list of users")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User list retrieved successfully")
    public ApiResponse<List<UserDTO>> getListUser (){
        List<UserDTO> list =  userService.getListUser();
        return new ApiResponse<>("success",200,"Operation successful",list);
    }


    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Create a new user")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully")
    public ApiResponse<UserDTO> createUser(
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
                return new ApiResponse<>("error", 400, "Invalid date format for birthday. Expected format: dd-MM-yyyy", null);
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

        // Trả về ApiResponse với thông tin user đã được tạo
        return new ApiResponse<>("success", 201, "User created successfully", savedUser);
    }


    @PutMapping("/update/{id}")
    public ApiResponse<UserDTO> updateUser(
            @PathVariable Long id,
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
            @RequestParam(value = "role", required = false) List<String> roles,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        LocalDate parsedBirthday = null;
        if (birthday != null && !birthday.isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                parsedBirthday = LocalDate.parse(birthday, formatter);
            } catch (DateTimeParseException e) {
                return new ApiResponse<>("error", 400, "Invalid date format for birthday. Expected format: dd-MM-yyyy", null);
            }
        }

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
                .birthday(parsedBirthday)
                .role(roles != null ? roles.stream()
                        .map(roleName -> RoleDTO.builder().name(roleName).build())
                        .collect(Collectors.toSet()) : null)
                .build();

        return new ApiResponse<>("success", 200, "User updated successfully",
                userService.updateUser(id, userDTO, avatar));
    }




}
