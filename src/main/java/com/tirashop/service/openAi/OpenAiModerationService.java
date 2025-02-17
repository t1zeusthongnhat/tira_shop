package com.tirashop.service.openAi;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenAiModerationService {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String API_KEY = dotenv.get("GEMINI_KEY");
    private static final String MODEL_NAME = "gemini-1.5-flash";

    public boolean isContentSafe(String text) {
        try {
            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL_NAME
                    + ":generateContent?key=" + API_KEY;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            JsonObject requestBody = new JsonObject();
            JsonArray contentsArray = new JsonArray();
            JsonObject contentObject = new JsonObject();
            JsonArray partsArray = new JsonArray();
            JsonObject textObject = new JsonObject();
            textObject.addProperty("text",
                    "Is this text offensive, harmful, explicit, or inappropriate? Answer strictly with 'YES' or 'NO': "
                            + text);
            partsArray.add(textObject);
            contentObject.add("parts", partsArray);
            contentsArray.add(contentObject);
            requestBody.add("contents", contentsArray);

            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST,
                    requestEntity, String.class);

            System.out.println("API Response: " + response.getBody());

            JsonObject responseJson = JsonParser.parseString(response.getBody()).getAsJsonObject();

            if (responseJson.has("candidates")) {
                JsonArray candidates = responseJson.getAsJsonArray("candidates");
                for (int i = 0; i < candidates.size(); i++) {
                    JsonObject candidate = candidates.get(i).getAsJsonObject();
                    if (candidate.has("content")) {
                        JsonArray parts = candidate.getAsJsonObject("content")
                                .getAsJsonArray("parts");
                        for (int j = 0; j < parts.size(); j++) {
                            String responseText = parts.get(j).getAsJsonObject().get("text")
                                    .getAsString().toLowerCase();
                            if (responseText.contains("yes")) {
                                System.out.println("This content is prohibited by Gemini AI!");
                                return false;
                            }
                        }
                    }
                }
            }
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return true;
        }
    }
}
