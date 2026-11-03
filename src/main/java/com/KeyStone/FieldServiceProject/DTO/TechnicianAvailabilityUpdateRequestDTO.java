package com.KeyStone.FieldServiceProject.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianAvailabilityUpdateRequestDTO {

    @NotBlank(message = "Availability is required")
    @Size(max = 30, message = "Availability must be at most 30 characters")
    private String availability;
}
