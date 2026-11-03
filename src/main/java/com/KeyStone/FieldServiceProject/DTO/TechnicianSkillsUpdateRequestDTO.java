package com.KeyStone.FieldServiceProject.DTO;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianSkillsUpdateRequestDTO {

    @NotNull(message = "Skills are required")
    private List<String> skills;
}
