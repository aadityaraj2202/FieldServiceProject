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
public class TimeLogResponseDTO {

    private Long id;
    private Long workOrderId;
    private Long technicianId;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private BigDecimal hours;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
