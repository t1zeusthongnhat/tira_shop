package com.tirashop.service;

import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.tirashop.dto.request.AuthenticationRequest;
import com.tirashop.dto.request.IntrospectRequest;
import com.tirashop.dto.response.AuthenticationResponse;
import com.nimbusds.jose.*;
import com.tirashop.dto.response.IntrospectResponse;
import com.tirashop.entity.User;
import com.tirashop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // chuỗi 32-byte bí mật để sử dụng làm khóa ký (256-bit):
    @Value("${jwt.signerKey}")
    @NonFinal
    private String SIGNER_KEY;

    public AuthenticationResponse authenticated(AuthenticationRequest request){

        var userLogin = userRepository.findByUsername(request.getUsername())
                        .orElseThrow(()-> new RuntimeException("User not found!"));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), userLogin.getPassword());

        if(!authenticated) throw new RuntimeException("Cannot authenticate user!");

        var token = generateToken(userLogin);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();

    }

    String generateToken(User user){
        // token duoc cau tao nhu sau:
        // 3 phan: JWT- json web token
        // header: chua thuat toan de gen ra mot chuoi token
        // payload: giong nhu body, chua nhung thong tin chi tiet cua nguoi dung\
        // signature: được tạo từ header và payload của JWT cùng với một khóa bí mật

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        //Cần body cho token: subject, issuer, issueTime, expirationTime, claim( tu build), id.
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("duonghoang")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope",buildScope(user))
                .build();
        //Tao payload cho token
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        //Tao obj chua token
        JWSObject jwsObject = new JWSObject(header,payload);
        //Kí và trả về một chuỗi String
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    // build scope
    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        // add role vao scope
        if (!CollectionUtils.isEmpty(user.getRole()))
            user.getRole()
                    .forEach(
                            role -> {
                                stringJoiner.add(role.getName());
                            });
        return stringJoiner.toString();
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
        var token = request.getToken();
        // Tạo đối tượng verifier với SIGNER_KEY
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        // Phân tích cú pháp token đã ký
        SignedJWT signedJWT = SignedJWT.parse(token);
        // Xác minh token với khóa bí mật
        boolean verified = signedJWT.verify(verifier);
        // Kiểm tra xem token đã hết hạn hay chưa
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        boolean isExpired = new Date().after(expirationTime);
        // Tạo phản hồi dựa trên trạng thái của token
        boolean active = verified && !isExpired;
        // Trả về kết quả kiểm tra token
        return new IntrospectResponse(active);
    }
}
