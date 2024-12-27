package com.tirashop.controller;


import com.nimbusds.jose.JOSEException;
import com.tirashop.dto.request.AuthenticationRequest;
import com.tirashop.dto.request.IntrospectRequest;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.dto.response.AuthenticationResponse;
import com.tirashop.dto.response.IntrospectResponse;
import com.tirashop.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@Slf4j
@RestController
@RequestMapping("/auth")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticate (@RequestBody AuthenticationRequest request){
        return new ApiResponse<>
                ("success",200,"Login Successful",authenticationService.authenticated(request));
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return new ApiResponse<>("success",200,"Introspect Done!",result);
    }
}
