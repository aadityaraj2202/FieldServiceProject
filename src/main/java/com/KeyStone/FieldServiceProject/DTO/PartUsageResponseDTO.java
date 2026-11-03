package com.KeyStone.FieldServiceProject.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsageResponseDTO {

    private Long id;
    private Long workOrderId;
    private Long technicianId;
    private String partName;
    private BigDecimal quantity;
    private String unit;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
