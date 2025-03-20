package com.tirashop.service.openAi;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.commons.io.IOUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KlingTryOnService {

    private static final String API_URL = "https://api.klingai.com/v1/images/kolors-virtual-try-on";
    private static final Logger log = LoggerFactory.getLogger(KlingTryOnService.class);
    private final TokenService tokenService;


    private String encodeImageToBase64(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        return Base64.getEncoder().encodeToString(bytes);
    }

    private String encodeImageUrlToBase64(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        try (InputStream in = url.openStream()) {
            byte[] imageBytes = IOUtils.toByteArray(in);
            return Base64.getEncoder().encodeToString(imageBytes);
        }
    }

    private String encodeUrl(String url) {
        return url.replace(" ", "%20");
    }

    public String createTryOnTask(MultipartFile modelImage, MultipartFile dressImage, String dressImageUrl, boolean useImageUrl)
            throws IOException {
        String apiToken = tokenService.generateApiToken();

        String modelImageBase64 = encodeImageToBase64(modelImage);

        String dressImageBase64OrUrl;
        if (useImageUrl) {
            dressImageBase64OrUrl = encodeImageUrlToBase64(encodeUrl(dressImageUrl));
            log.info("url dc encode: {}", encodeUrl(dressImageUrl));
        } else {
            dressImageBase64OrUrl = encodeImageToBase64(dressImage);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiToken);

        String requestBody = String.format(
                "{\"human_image\": \"%s\", \"cloth_image\": \"%s\", \"batch_size\": 1, \"task_type\": \"ai_try_on\"}",
                modelImageBase64, dressImageBase64OrUrl
        );

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(API_URL, HttpMethod.POST, request, Map.class);

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
