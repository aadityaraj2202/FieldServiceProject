package com.KeyStone.FieldServiceProject.DTO;

import java.time.LocalDate;

import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderCreateRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotNull(message = "Customer id is required")
    private Long customerId;

    @NotNull(message = "Site id is required")
    private Long siteId;

    @NotBlank(message = "Service type is required")
    @Size(max = 100, message = "Service type must be at most 100 characters")
    private String serviceType;

    @NotNull(message = "Priority is required")
    private WorkOrderPriority priority;

    @NotNull(message = "Status is required")
    private WorkOrderStatus status;

    private LocalDate scheduledDate;
}
