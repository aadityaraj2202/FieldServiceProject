package com.KeyStone.FieldServiceProject.DTO;

import java.time.LocalDate;

import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderUpdateRequestDTO {

    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private Long customerId;

    private Long siteId;

    @Size(max = 100, message = "Service type must be at most 100 characters")
    private String serviceType;

    private WorkOrderPriority priority;

    private LocalDate scheduledDate;
}
