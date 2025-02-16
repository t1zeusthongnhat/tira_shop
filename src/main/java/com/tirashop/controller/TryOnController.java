package com.tirashop.controller;

import com.tirashop.service.openAi.KlingTryOnService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("tirashop/api/tryon")
@RequiredArgsConstructor
public class TryOnController {

    private final KlingTryOnService klingTryOnService;

    @PostMapping
    public String tryOn(@RequestParam String modelUrl, @RequestParam String dressUrl) {
        return klingTryOnService.tryOn(modelUrl, dressUrl);
    }
}
