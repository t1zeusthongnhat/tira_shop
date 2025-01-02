package com.tirashop.configuration;

import com.tirashop.configuration.CustomJwtDecoder;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Các endpoint công khai không yêu cầu xác thực
    public final String[] PUBLIC_ENDPOINT = {"/auth/**", "/uploads/avatar/**","/uploads/logo/**"}; // Thêm /uploads/avatar/** để cho phép truy cập ảnh công khai
    public final String[] SWAGGER_WHITELIST = {"/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"};

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(
                request -> request
                        .requestMatchers(PUBLIC_ENDPOINT).permitAll() // Cho phép truy cập các endpoint công khai mà không cần xác thực
                        .requestMatchers(SWAGGER_WHITELIST).permitAll() // Cho phép truy cập Swagger
                        .anyRequest().authenticated() // Tất cả các yêu cầu khác yêu cầu xác thực
        );

        httpSecurity.oauth2ResourceServer(
                oauth2 -> oauth2.jwt(
                        jwtConfigurer -> jwtConfigurer
                                .decoder(customJwtDecoder) // Sử dụng CustomJwtDecoder để giải mã JWT
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
        );

        httpSecurity.csrf(AbstractHttpConfigurer::disable); // Tắt CSRF để tránh lỗi bảo mật khi gửi request từ frontend

        return httpSecurity.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // Mã hóa mật khẩu với BCrypt
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); // Xóa prefix ROLE_ (nếu không cần thiết)

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*"); // Cho phép mọi nguồn gốc (có thể giới hạn theo domain production)
        corsConfiguration.addAllowedMethod("*"); // Cho phép tất cả các phương thức HTTP (GET, POST, PUT, DELETE, ...)
        corsConfiguration.addAllowedHeader("*"); // Cho phép tất cả các header

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration); // Áp dụng cấu hình CORS cho tất cả các endpoint

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }
}

