package com.tirashop.service.openAi;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class KlingTryOnService {

    private final RestTemplate restTemplate;
    private static final String API_URL = "https://api.piapi.ai/api/v1/task";
    private static final String API_KEY = "YOUR_API_KEY";

    public KlingTryOnService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String tryOn(String modelImageUrl, String dressImageUrl) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", API_KEY);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "kling");
        requestBody.put("task_type", "ai_try_on");

        Map<String, Object> input = new HashMap<>();
        input.put("model_input", modelImageUrl);
        input.put("dress_input", dressImageUrl);
        input.put("batch_size", 1);

        requestBody.put("input", input);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(API_URL, request, String.class);

        return response.getBody();
    }
}
