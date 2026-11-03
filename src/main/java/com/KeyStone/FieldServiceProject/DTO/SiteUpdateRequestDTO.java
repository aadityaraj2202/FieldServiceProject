package com.KeyStone.FieldServiceProject.DTO;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteUpdateRequestDTO {

    private Long customerId;

    @Size(max = 150, message = "Site name must be at most 150 characters")
    private String siteName;

    @Size(max = 255, message = "Address line 1 must be at most 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must be at most 255 characters")
    private String addressLine2;

    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "State must be at most 100 characters")
    private String state;

    @Size(max = 20, message = "Postal code must be at most 20 characters")
    private String postalCode;

    @Size(max = 100, message = "Country must be at most 100 characters")
    private String country;

    @Size(max = 100, message = "Contact name must be at most 100 characters")
    private String contactName;

    @Size(max = 30, message = "Contact phone must be at most 30 characters")
    private String contactPhone;

    @Size(max = 500, message = "Access notes must be at most 500 characters")
    private String accessNotes;

    private Boolean active;
}
