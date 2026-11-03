package com.KeyStone.FieldServiceProject.DTO;

import java.util.List;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianUpdateRequestDTO {

    @Size(max = 150, message = "Full name must be at most 150 characters")
    private String fullName;

    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

    private List<String> skills;

    @Size(max = 30, message = "Availability must be at most 30 characters")
    private String availability;

    private Long userId;

    private Boolean active;
}
