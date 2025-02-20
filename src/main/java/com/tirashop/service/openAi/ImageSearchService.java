package com.tirashop.service.openAi;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ImageSearchService {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/microsoft/resnet-50";
    private static final String HUGGINGFACE_TOKEN = dotenv.get("HUGGINGFACE_TOKEN");

    public String predictLabel(MultipartFile file) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", HUGGINGFACE_TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<List> response = restTemplate.exchange(HUGGINGFACE_API_URL, HttpMethod.POST,
                entity, List.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null
                && !response.getBody().isEmpty()) {
            Map<String, Object> result = (Map<String, Object>) response.getBody().get(0);
            if (result.containsKey("label")) {
                return (String) result.get("label");
            }
        }
        return "Unknown";
    }
}
