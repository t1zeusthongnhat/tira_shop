package com.tirashop.configuration;

import com.tirashop.dto.request.IntrospectRequest;
import com.tirashop.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    private final AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder;

    public CustomJwtDecoder(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // Kiểm tra token qua introspect
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build()
            );

            if (!response.isValid()) {
                throw new JwtException("Token has been invalidated or expired");
            }
        } catch (ParseException | JOSEException e) {
            throw new JwtException("Error while validating token: " + e.getMessage());
        }

        // Giải mã token nếu hợp lệ
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder
                    .withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        Jwt jwt = nimbusJwtDecoder.decode(token);

        // Kiểm tra token có trong danh sách bị vô hiệu hóa không
        String jwtId = jwt.getId();
        if (authenticationService.isTokenBlacklisted(jwtId)) {
            throw new JwtException("Token has been invalidated");
        }

        // Kiểm tra claim "type" để xác định loại token
        String tokenType = jwt.getClaim("type");
        if ("refresh".equals(tokenType)) {
            throw new JwtException("Refresh Token cannot be used to access protected resources");
        }

        return jwt;
    }


}
