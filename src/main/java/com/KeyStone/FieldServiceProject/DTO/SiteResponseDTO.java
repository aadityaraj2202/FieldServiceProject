package com.KeyStone.FieldServiceProject.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteResponseDTO {

    private Long id;
    private Long customerId;
    private String siteName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String contactName;
    private String contactPhone;
    private String accessNotes;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
