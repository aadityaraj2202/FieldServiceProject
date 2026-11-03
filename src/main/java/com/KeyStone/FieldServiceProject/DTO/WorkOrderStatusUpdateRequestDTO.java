package com.KeyStone.FieldServiceProject.DTO;

import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderStatusUpdateRequestDTO {

    @NotNull(message = "Status is required")
    private WorkOrderStatus status;
}
