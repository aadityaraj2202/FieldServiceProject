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
public class CustomerCreateRequestDTO {

    @NotBlank(message = "Customer / Organization Name is required")
    @Size(max = 150, message = "Customer / Organization Name must be at most 150 characters")
    private String organization;

    @NotBlank(message = "Primary Contact Name is required")
    @Size(max = 100, message = "Primary Contact Name must be at most 100 characters")
    private String contactName;

    @NotBlank(message = "Email is required")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be at most 255 characters")
    private String address;

    private Boolean active;
}