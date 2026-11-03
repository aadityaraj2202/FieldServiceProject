package com.KeyStone.FieldServiceProject.Service;

import java.util.List;

import com.KeyStone.FieldServiceProject.DTO.TechnicianCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianUpdateRequestDTO;

public interface TechnicianService {

    TechnicianResponseDTO createTechnician(TechnicianCreateRequestDTO request);

    List<TechnicianResponseDTO> getAllTechnicians();

    TechnicianResponseDTO getTechnicianById(Long id);

    List<TechnicianResponseDTO> searchTechnicians(String query);

    TechnicianResponseDTO updateTechnician(Long id, TechnicianUpdateRequestDTO request);

    TechnicianResponseDTO updateTechnicianSkills(Long id, List<String> skills);

    TechnicianResponseDTO updateTechnicianAvailability(Long id, String availability);

    void deleteTechnician(Long id);
}
