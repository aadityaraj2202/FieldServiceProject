package com.KeyStone.FieldServiceProject.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderAssignTechnicianRequestDTO {

    @NotNull(message = "Technician id is required")
    private Long technicianId;
}
