package com.tirashop.configuration;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import javax.crypto.spec.SecretKeySpec;
import java.net.http.HttpRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    public final String[] PUBLIC_ENDPOINT = {
      "/user/list","/user/register","/auth/login","/auth/introspect"
    };

    @Value("${jwt.signerKey}")
    @NonFinal
    private String SIGNER_KEY;

    // Định nghĩa cách các yêu cầu HTTP được ủy quyền và cấu hình giải mã JWT
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(
                request -> request
                        .requestMatchers(HttpMethod.GET, PUBLIC_ENDPOINT)
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINT)
                        .permitAll()
                        // Cho phép tất cả các yêu cầu POST tới các endpoint công khai.
                        .anyRequest()
                        // Yêu cầu tất cả các yêu cầu khác phải được xác thực.
                        .authenticated()
        );
        // Cấu hình máy chủ tài nguyên OAuth2 để sử dụng JWT cho xác thực.
        httpSecurity.oauth2ResourceServer(
                oauth2 ->
                        oauth2.jwt(
                                jwtConfigurer ->
                                        jwtConfigurer
                                                .decoder(jwtDecoder())
                                                // thiết lập converter để chuyển đổi thông tin JWT sang
                                                // dạng mà Spring Security có thể hiểu và sử dụng để xác thực và cấp quyền.
                                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
        );

        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        // Vô hiệu hóa bảo vệ CSRF vì không cần thiết khi sử dụng JWT.
        // cross site request forency

        return httpSecurity.build();
        // Xây dựng và trả về chuỗi lọc bảo mật.
    }


    @Bean
    JwtDecoder jwtDecoder() {
        // Tạo khóa bí mật để giải mã JWT với thuật toán HMAC HS512
        SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(),"HS512");
        // Tạo và trả về một JwtDecoder để giải mã JWT.
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
        }
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        // quá trình chuyển đổi role và permission từ JWT được thực hiện thông qua
        // JwtGrantedAuthoritiesConverter
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    // cross origin resource sharing
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource =
                new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsFilter(urlBasedCorsConfigurationSource);
    }
}
