package com.tirashop.service.openAi;

import java.io.IOException;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.commons.io.IOUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KlingTryOnService {

    private static final String API_URL = "https://api.klingai.com/v1/images/kolors-virtual-try-on";
    private final TokenService tokenService;


    private String encodeImageToBase64(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        return Base64.getEncoder().encodeToString(bytes);
    }

    public String createTryOnTask(MultipartFile modelImage, MultipartFile dressImage)
            throws IOException {
        String apiToken = tokenService.generateApiToken();

        String modelImageBase64 = encodeImageToBase64(
                modelImage);
        String dressImageBase64 = encodeImageToBase64(
                dressImage);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiToken);

        String requestBody = String.format(
                "{\"human_image\": \"%s\", \"cloth_image\": \"%s\", \"batch_size\": 1, \"task_type\": \"ai_try_on\"}",
                modelImageBase64, dressImageBase64
        );

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(API_URL, HttpMethod.POST, request,
                Map.class);

        Map responseBody = response.getBody();
        String taskId = (String) ((Map) responseBody.get("data")).get("task_id");
        return taskId;
    }


    public byte[] getTryOnResult(String taskId) throws IOException {
        String url = API_URL + "/" + taskId;

        String apiToken = tokenService.generateApiToken();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(headers), Map.class);

        Map responseBody = response.getBody();
        Map data = (Map) responseBody.get("data");
        Map taskResult = (Map) data.get("task_result");

        List<Map> images = (List<Map>) taskResult.get("images");

        String resultUrl = (String) images.get(0).get("url");

        URL imageUrl = new URL(resultUrl);
        return IOUtils.toByteArray(imageUrl);
    }



}
