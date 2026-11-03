package com.KeyStone.FieldServiceProject.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Long customerId;
    private Long siteId;
    private Long assignedTechnicianId;
    private String serviceType;
    private WorkOrderPriority priority;
    private WorkOrderStatus status;
    private LocalDate scheduledDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
