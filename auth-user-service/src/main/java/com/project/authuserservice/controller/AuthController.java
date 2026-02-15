package com.project.authuserservice.controller;

import com.project.authuserservice.dto.ApiResponse;
import com.project.authuserservice.dto.LoginRequest;
import com.project.authuserservice.dto.LoginResponse;
import com.project.authuserservice.dto.TokenValidationResponse;
import com.project.authuserservice.service.AuthService;
import com.project.authuserservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authSvc;
    private final JwtUtil jwtUtil;

    // Endpoint: POST /api/v1/auth/login
    // Accepts login credentials and returns a JWT if authentication is successful.
    // This is the primary entry point for users to establish a session.
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse resp = authSvc.login(req);
        return ApiResponse.success("Login successful", resp);
    }

    // Endpoint: POST /api/v1/auth/logout
    // Processes the logout request for the currently authenticated user.
    // Triggers the backend audit logging for the session termination.
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest req) {
        Integer userId = (Integer) req.getAttribute("userId");
        authSvc.logout(userId);
        return ApiResponse.success("Logout successful");
    }

    // Endpoint: PUT /api/v1/auth/change-password
    // Allows an authenticated user to update their own password securely.
    // Extracts the user ID from the request attribute for service-layer processing.
    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody Map<String, String> body,
                                            HttpServletRequest req) {
        Integer userId = (Integer) req.getAttribute("userId");
        String oldPwd = body.get("oldPassword");
        String newPwd = body.get("newPassword");
        authSvc.changePassword(userId, oldPwd, newPwd);
        return ApiResponse.success("Password changed successfully");
    }

    // In AuthController.java, add this method:

    @GetMapping("/internal/auth/validate")
    public ResponseEntity<ApiResponse<TokenValidationResponse>> validateToken(
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(
                        ApiResponse.error("Missing or invalid Authorization header")
                );
            }

            String token = authHeader.substring(7);

            String email = jwtUtil.extractEmail(token);
            Integer userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);

            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(401).body(
                        ApiResponse.error("Token is expired or invalid")
                );
            }

            TokenValidationResponse response = TokenValidationResponse.builder()
                    .valid(true)
                    .userId(userId.longValue())
                    .email(email)
                    .role(role)
                    .message("Token is valid")
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Token validated", response));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error("Invalid token")
            );
        }
    }

}