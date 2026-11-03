package com.KeyStone.FieldServiceProject.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.FieldServiceProject.DTO.TechnicianAvailabilityUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianSkillsUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.Service.TechnicianService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<TechnicianResponseDTO> createTechnician(
            @Valid @RequestBody TechnicianCreateRequestDTO request) {

        TechnicianResponseDTO response = technicianService.createTechnician(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @GetMapping
    public ResponseEntity<List<TechnicianResponseDTO>> getAllTechnicians() {

        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @GetMapping("/search")
    public ResponseEntity<List<TechnicianResponseDTO>> searchTechnicians(
            @RequestParam String query) {

        return ResponseEntity.ok(technicianService.searchTechnicians(query));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @GetMapping("/{id}")
    public ResponseEntity<TechnicianResponseDTO> getTechnicianById(
            @PathVariable Long id) {

        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/{id}")
    public ResponseEntity<TechnicianResponseDTO> updateTechnician(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianUpdateRequestDTO request) {

        return ResponseEntity.ok(technicianService.updateTechnician(id, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PatchMapping("/{id}/skills")
    public ResponseEntity<TechnicianResponseDTO> updateTechnicianSkills(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianSkillsUpdateRequestDTO request) {

        return ResponseEntity.ok(
                technicianService.updateTechnicianSkills(id, request.getSkills()));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PatchMapping("/{id}/availability")
    public ResponseEntity<TechnicianResponseDTO> updateTechnicianAvailability(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianAvailabilityUpdateRequestDTO request) {

        return ResponseEntity.ok(
                technicianService.updateTechnicianAvailability(id, request.getAvailability()));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {

        technicianService.deleteTechnician(id);

        return ResponseEntity.noContent().build();
    }
}