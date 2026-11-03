package com.KeyStone.FieldServiceProject.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianResponseDTO {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private List<String> skills;
    private String availability;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
