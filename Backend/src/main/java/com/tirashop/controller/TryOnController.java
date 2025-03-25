package com.tirashop.controller;

import com.tirashop.service.openAi.KlingTryOnService;
import io.swagger.v3.oas.annotations.Operation;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/tirashop/try-on")
@RequiredArgsConstructor
public class TryOnController {

    private final KlingTryOnService klingTryOnService;

    @PostMapping(consumes = "multipart/form-data")
    public String tryOn(
            @RequestParam("modelImage") MultipartFile modelImage,
            @RequestParam(value = "dressImage", required = false) MultipartFile dressImage,
            @RequestParam(value = "dressImageUrl", required = false) String dressImageUrl,
            @RequestParam("useImageUrl") boolean useImageUrl) {
        try {
            if (!useImageUrl && dressImage == null) {
                return "Error: dressImage is required when useImageUrl is false";
            }
            if (useImageUrl && (dressImageUrl == null || dressImageUrl.isEmpty())) {
                return "Error: dressImageUrl is required when useImageUrl is true";
            }
            //true: dung url
            String taskId = klingTryOnService.createTryOnTask(modelImage, dressImage, dressImageUrl, useImageUrl);
            return "Task created with task_id: " + taskId;
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<byte[]> getTryOnResult(@PathVariable String taskId) {
        try {
            byte[] image = klingTryOnService.getTryOnResult(taskId);
            return ResponseEntity.ok()
                    .header("Content-Type", "image/png")
                    .body(image);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }

}

