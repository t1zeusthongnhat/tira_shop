package com.tirashop.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.ProductService;
import io.github.cdimascio.dotenv.Dotenv;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/tirashop/product")
@Tag(name = "Product", description = "APIs for voice search products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoiceSearchController {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String DEEPGRAM_API_KEY = dotenv.get("VOICE_TO_TEXT");
    private static final ObjectMapper objectMapper = new ObjectMapper();
    final ProductService productService;

    @PostMapping(value = "/search", consumes = "multipart/form-data")
    @Operation(summary = "Search products using voice", description = "Convert voice to text and search for products. Specify language as 'en' for English or 'vi' for Vietnamese.")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<PagedData<ProductDTO>> searchByVoice(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "en") String language,
            @PageableDefault(page = 0, size = 25, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Starting voice search with Deepgram API_KEY, language: {}", language);

        try {
            byte[] audioBytes = file.getBytes();
            String contentType = file.getContentType() != null ? file.getContentType() : "audio/mpeg";

            String deepgramUrl;
            if ("vi".equalsIgnoreCase(language)) {
                deepgramUrl = "https://api.deepgram.com/v1/listen?punctuate=true&model=nova-2&language=vi";
            } else if ("en".equalsIgnoreCase(language)) {
                deepgramUrl = "https://api.deepgram.com/v1/listen?punctuate=true&model=nova-2&language=en";
            } else {
                log.warn("Unsupported language: {}. Defaulting to English.", language);
                deepgramUrl = "https://api.deepgram.com/v1/listen?punctuate=true&model=nova-2&language=en";
            }

            HttpResponse<String> response = Unirest.post(deepgramUrl)
                    .header("Authorization", "Token " + DEEPGRAM_API_KEY)
                    .header("Content-Type", contentType)
                    .body(audioBytes)
                    .asString();

            if (response.getStatus() != 200) {
                log.error("Deepgram API request failed: {}", response.getBody());
                return new ApiResponse<>("error", 500, "Deepgram API request failed: " + response.getBody(), null);
            }

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String transcriptText = responseJson.at("/results/channels/0/alternatives/0/transcript").asText();
            log.info("Transcription completed, text: {}", transcriptText);

            if (transcriptText.isEmpty()) {
                log.warn("No transcription available for the provided audio in language: {}", language);
                return new ApiResponse<>("error", 400, "Could not transcribe the audio file", null);
            }

            String searchQuery = transcriptText;
            if ("vi".equalsIgnoreCase(language)) {
                searchQuery = translateToEnglish(transcriptText);
                log.info("Translated from Vietnamese to English: {}", searchQuery);
            }

            String cleanedQuery = searchQuery
                    .trim()
                    .replaceAll("[^\\p{L}\\p{Nd}\\s]", "")
                    .toLowerCase();
            String[] words = cleanedQuery.split("\\s+");
            String word1 = words.length > 0 ? words[0] : "";
            String word2 = words.length > 1 ? words[1] : "";
            log.info("Cleaned query: {}, Word 1: {}, Word 2: {}", cleanedQuery, word1, word2);

            PagedData<ProductDTO> searchResults;
            if ("en".equalsIgnoreCase(language) && words.length == 1) {
                searchResults = productService.filterProducts(word1, pageable);
            } else {
                searchResults = productService.filterProductsWithLanguage(language, word1, word2, pageable);
            }

            return new ApiResponse<>("success", 200, "Voice search results retrieved successfully", searchResults);

        } catch (IOException e) {
            log.error("Error processing voice search: {}", e.getMessage(), e);
            return new ApiResponse<>("error", 500, "Error processing file: " + e.getMessage(), null);
        }
    }

    private String translateToEnglish(String vietnameseText) {
        try {
            HttpResponse<String> translateResponse = Unirest.get("https://api.mymemory.translated.net/get")
                    .queryString("q", vietnameseText)
                    .queryString("langpair", "vi|en")
                    .asString();

            if (translateResponse.getStatus() != 200) {
                log.error("Translation API request failed: {}", translateResponse.getBody());
                return vietnameseText;
            }

            JsonNode translateJson = objectMapper.readTree(translateResponse.getBody());
            return translateJson.at("/responseData/translatedText").asText();
        } catch (Exception e) {
            log.error("Error translating text: {}", e.getMessage(), e);
            return vietnameseText;
        }
    }
}