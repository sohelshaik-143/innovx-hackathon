package com.innovx.nodues.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/health")
@Tag(name = "Health Check", description = "Public service health verification for deployment platforms like Render")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend service health", description = "Returns UP status for health monitoring")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "automated-nodues-backend"
        ));
    }
}
