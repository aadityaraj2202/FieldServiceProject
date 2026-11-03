package com.KeyStone.FieldServiceProject.DTO;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianCreateRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must be at most 150 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

    @NotNull(message = "Skills are required")
    private List<String> skills;

    @NotBlank(message = "Availability is required")
    @Size(max = 30, message = "Availability must be at most 30 characters")
    private String availability;

    private Long userId;

    private Boolean active;
}
