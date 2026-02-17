package com.project.authuserservice.controller;

import com.project.authuserservice.dto.ApiResponse;
import com.project.authuserservice.dto.UserSummaryDTO;
import com.project.authuserservice.entity.User;
import com.project.authuserservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userSvc;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserSummaryDTO>> getInternalUser(@PathVariable Integer userId) {
        User user = userSvc.getUserById(userId);

        UserSummaryDTO dto = UserSummaryDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .managerId(user.getManager() != null ? user.getManager().getUserId() : null)
                .build();

        return ResponseEntity.ok(ApiResponse.success("User found", dto));
    }

    @GetMapping("/by-manager/{managerId}")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getTeamByManager(@PathVariable Integer managerId) {
        List<User> teamMembers = userSvc.getTeamMembers(managerId);

        List<UserSummaryDTO> dtos = teamMembers.stream()
                .map(user -> UserSummaryDTO.builder()
                        .userId(user.getUserId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .department(user.getDepartment())
                        .managerId(user.getManager() != null ? user.getManager().getUserId() : null)
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Team members found", dtos));
    }
}