package com.tirashop.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Chỉ định Spring Boot phục vụ các file trong thư mục uploads/avatar
        registry.addResourceHandler("/uploads/avatar/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/avatar/");
        // Cấu hình để phục vụ các file trong thư mục uploads/logo
        registry.addResourceHandler("/uploads/logo/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/logo/");
        // Cấu hình để phục vụ các file trong thư mục uploads/product/image
        registry.addResourceHandler("/uploads/product/image/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/product/image/");
    }
}
