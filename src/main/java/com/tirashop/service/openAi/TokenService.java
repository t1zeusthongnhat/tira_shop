package com.tirashop.service.openAi;

import com.auth0.jwt.algorithms.Algorithm;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;
import com.auth0.jwt.JWT;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class TokenService {

    private static final Dotenv dotenv = Dotenv.load();


    public String generateApiToken() {
        String accessKey = dotenv.get("ACCESS_KEY_ID");
        String secretKey = dotenv.get("ACCESS_KEY_SECRET");

        try {
            Date expiredAt = new Date(
                    System.currentTimeMillis() + 1800 * 1000);
            Date notBefore = new Date(System.currentTimeMillis()
                    - 5 * 1000);
            Algorithm algorithm = Algorithm.HMAC256(secretKey);

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");

            return JWT.create()
                    .withIssuer(accessKey)
                    .withHeader(header)
                    .withExpiresAt(expiredAt)
                    .withNotBefore(notBefore)
                    .sign(algorithm);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
