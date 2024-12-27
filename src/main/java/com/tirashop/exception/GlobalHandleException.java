package com.tirashop.exception;


import com.tirashop.dto.response.ApiResponse;
import org.apache.coyote.Response;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.file.AccessDeniedException;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalHandleException {

    //gai quyet exception lquan den Runtime
    @ExceptionHandler
    ResponseEntity<ApiResponse<Object>> handlingRuntimeEx(RuntimeException excep){
        ApiResponse<Object> response = new ApiResponse<>(
                "error",
                HttpStatus.BAD_REQUEST.value(),
                excep.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    //giai quyet exception lien quan den validate
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        // Trích xuất danh sách lỗi từ exception
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage()
                ));

        ApiResponse<Object> response = new ApiResponse<>(
                "error",
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    /**
     * Xử lý ngoại lệ chung (Exception)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage(), null));
    }

    /**
     * Xử lý ngoại lệ cho tài nguyên không tìm thấy (404 Not Found)
     */
    @ExceptionHandler(ConfigDataResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ConfigDataResourceNotFoundException ex) {
        ApiResponse<Object> response = new ApiResponse<>(
                "error",
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    //ngoai le lien quan den quyen truy cap
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(Exception ex){
        ApiResponse<Object> response = new ApiResponse<>(
                "error",
                HttpStatus.FORBIDDEN.value(),
                "Access Denied",
                null
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);

    }

    /**
     * Xử lý ngoại lệ không xác thực (401 Unauthorized)
     */
    @ExceptionHandler(HttpClientErrorException.Unauthorized.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(HttpClientErrorException.Unauthorized ex) {
        ApiResponse<Object> response = new ApiResponse<>(
                "error",
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

}
