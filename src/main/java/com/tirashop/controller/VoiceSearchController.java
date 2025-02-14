package com.tirashop.controller;

import com.assemblyai.api.AssemblyAI;
import com.assemblyai.api.resources.transcripts.types.Transcript;
import com.assemblyai.api.resources.transcripts.types.TranscriptOptionalParams;
import com.assemblyai.api.resources.transcripts.types.TranscriptStatus;
import com.tirashop.dto.ProductDTO;
import com.tirashop.dto.response.ApiResponse;
import com.tirashop.model.PagedData;
import com.tirashop.service.ProductService;
import io.github.cdimascio.dotenv.Dotenv;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/tirashop/product")
@Tag(name = "Product", description = "APIs for voice search products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoiceSearchController {


    private static final Dotenv dotenv = Dotenv.load();
    private static final String API_KEY = dotenv.get("VOICE_TO_TEXT");

    private final AssemblyAI client = AssemblyAI.builder()
            .apiKey(API_KEY)
            .build();

    private final ProductService productService;

    @PostMapping("/search")
    @Operation(summary = "Search products using voice", description = "Convert voice to text and search for products")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<PagedData<ProductDTO>> searchByVoice(
            @RequestParam("file") MultipartFile file, Pageable pageable) {
        try {

            File tempFile = File.createTempFile("audio", ".mp3");
            file.transferTo(tempFile);

            TranscriptOptionalParams params = TranscriptOptionalParams.builder().build();
            Transcript transcript = client.transcripts().transcribe(tempFile, params);
            tempFile.delete();

            if (transcript.getStatus().equals(TranscriptStatus.ERROR)) {
                return new ApiResponse<>("error", 500,
                        transcript.getError().orElse("Unknown error"), null);
            }

            String queryText = transcript.getText().orElse("")
                    .trim()
                    .replaceAll("[^a-zA-Z0-9\\s]", "")
                    .toLowerCase();
            log.info("Cleaned Transcribed text: {}", queryText);

            PagedData<ProductDTO> searchResults = productService.filterProductsWithPaging(queryText,
                    null, null, null, null, null, pageable);

            return new ApiResponse<>("success", 200, "Voice search results retrieved successfully",
                    searchResults);
        } catch (IOException e) {
            return new ApiResponse<>("error", 500, "Error processing file: " + e.getMessage(),
                    null);
        }
    }
}
