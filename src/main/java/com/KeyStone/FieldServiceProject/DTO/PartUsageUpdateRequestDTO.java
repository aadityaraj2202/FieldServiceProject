package com.KeyStone.FieldServiceProject.DTO;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsageUpdateRequestDTO {

    private String partName;
    private BigDecimal quantity;
    private String unit;
    private String notes;
    private Long technicianId;
}
