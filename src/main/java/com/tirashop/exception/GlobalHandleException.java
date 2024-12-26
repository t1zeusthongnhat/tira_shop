package com.tirashop.exception;


import com.tirashop.dto.response.ApiResponse;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalHandleException {

    //gai quyet exception lquan den Runtime
    @ExceptionHandler
    ResponseEntity<String> handlingRuntimeEx(RuntimeException excep){
        return ResponseEntity.badRequest().body(excep.getMessage());
    }

    //giai quyet exception lien quan den validate
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<String> handlingValidate(MethodArgumentNotValidException exception){
        return ResponseEntity.badRequest().body(exception.getFieldError().getDefaultMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("error", HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage(), null));
    }
}
