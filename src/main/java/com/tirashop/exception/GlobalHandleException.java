package com.tirashop.exception;


import org.apache.coyote.Response;
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
}
