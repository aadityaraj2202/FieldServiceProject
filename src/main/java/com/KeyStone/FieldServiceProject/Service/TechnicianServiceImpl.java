package com.KeyStone.FieldServiceProject.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.FieldServiceProject.DTO.TechnicianCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.Entity.Technician;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.TechnicianRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@Service
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserAuthRepository userAuthRepository;

    public TechnicianServiceImpl(TechnicianRepository technicianRepository, UserAuthRepository userAuthRepository) {
        this.technicianRepository = technicianRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @Override
    @Transactional
    public TechnicianResponseDTO createTechnician(TechnicianCreateRequestDTO request) {
        validateCreateRequest(request);

        if (technicianRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Technician with this email already exists");
        }

        UserAuth linkedUser = null;
        if (request.getUserId() != null) {
            linkedUser = userAuthRepository.findById(request.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));
            if (technicianRepository.existsByUserId(request.getUserId())) {
                throw new IllegalArgumentException("This user account is already linked to a technician");
            }
        }

        Technician technician = Technician.builder()
                .user(linkedUser)
                .fullName(trimToNull(request.getFullName()))
                .email(trimToNull(request.getEmail()))
                .phone(trimToNull(request.getPhone()))
                .skills(normalizeSkills(request.getSkills()))
                .availability(normalizeAvailability(request.getAvailability()))
                .active(Boolean.TRUE.equals(request.getActive()))
                .build();

        Technician saved = technicianRepository.save(technician);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianResponseDTO> getAllTechnicians() {
        return technicianRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianResponseDTO getTechnicianById(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + id));
        return mapToResponse(technician);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianResponseDTO> searchTechnicians(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return getAllTechnicians();
        }
        return technicianRepository.searchByNameEmailOrSkill(normalized).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TechnicianResponseDTO updateTechnician(Long id, TechnicianUpdateRequestDTO request) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + id));

        if (request.getFullName() != null) {
            technician.setFullName(trimToNull(request.getFullName()));
        }
        if (request.getEmail() != null) {
            String newEmail = trimToNull(request.getEmail());
            if (!Objects.equals(technician.getEmail(), newEmail) && technicianRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("Technician with this email already exists");
            }
            technician.setEmail(newEmail);
        }
        if (request.getPhone() != null) {
            technician.setPhone(trimToNull(request.getPhone()));
        }
        if (request.getSkills() != null) {
            technician.setSkills(normalizeSkills(request.getSkills()));
        }
        if (request.getAvailability() != null) {
            technician.setAvailability(normalizeAvailability(request.getAvailability()));
        }
        if (request.getUserId() != null) {
            if (request.getUserId().equals(technician.getUser() == null ? null : technician.getUser().getId())) {
                // no change when same user is linked
            } else {
                UserAuth linkedUser = userAuthRepository.findById(request.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));
                if (technicianRepository.existsByUserId(request.getUserId())) {
                    throw new IllegalArgumentException("This user account is already linked to a technician");
                }
                technician.setUser(linkedUser);
            }
        }
        if (request.getActive() != null) {
            technician.setActive(request.getActive());
        }

        validateTechnician(technician);
        Technician saved = technicianRepository.save(technician);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TechnicianResponseDTO updateTechnicianSkills(Long id, List<String> skills) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + id));
        technician.setSkills(normalizeSkills(skills));
        validateTechnician(technician);
        return mapToResponse(technicianRepository.save(technician));
    }

    @Override
    @Transactional
    public TechnicianResponseDTO updateTechnicianAvailability(Long id, String availability) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + id));
        technician.setAvailability(normalizeAvailability(availability));
        validateTechnician(technician);
        return mapToResponse(technicianRepository.save(technician));
    }

    @Override
    @Transactional
    public void deleteTechnician(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + id));

        if (technician.isActive()) {
            technician.setActive(false);
            technicianRepository.save(technician);
            return;
        }

        technicianRepository.delete(technician);
    }

    private void validateCreateRequest(TechnicianCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Technician request is required");
        }
        if (isBlank(request.getFullName())) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (isBlank(request.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }
        if (isBlank(request.getPhone())) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (request.getSkills() == null || request.getSkills().isEmpty()) {
            throw new IllegalArgumentException("At least one skill is required");
        }
        if (isBlank(request.getAvailability())) {
            throw new IllegalArgumentException("Availability is required");
        }
    }

    private void validateTechnician(Technician technician) {
        if (isBlank(technician.getFullName())) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (isBlank(technician.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }
        if (isBlank(technician.getPhone())) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (technician.getSkills() == null || technician.getSkills().isEmpty()) {
            throw new IllegalArgumentException("At least one skill is required");
        }
        if (isBlank(technician.getAvailability())) {
            throw new IllegalArgumentException("Availability is required");
        }
        if (technician.getUser() != null && technicianRepository.existsByUserId(technician.getUser().getId())) {
            Technician existing = technicianRepository.findByUserId(technician.getUser().getId())
                    .orElse(null);
            if (existing != null && !Objects.equals(existing.getId(), technician.getId())) {
                throw new IllegalArgumentException("This user account is already linked to a technician");
            }
        }
    }

    private TechnicianResponseDTO mapToResponse(Technician technician) {
        return TechnicianResponseDTO.builder()
                .id(technician.getId())
                .userId(technician.getUser() != null ? technician.getUser().getId() : null)
                .fullName(technician.getFullName())
                .email(technician.getEmail())
                .phone(technician.getPhone())
                .skills(technician.getSkills() == null ? new ArrayList<>() : new ArrayList<>(technician.getSkills()))
                .availability(technician.getAvailability())
                .active(technician.isActive())
                .createdAt(technician.getCreatedAt())
                .updatedAt(technician.getUpdatedAt())
                .build();
    }

    private List<String> normalizeSkills(List<String> input) {
        List<String> normalized = new ArrayList<>();
        if (input == null) {
            return normalized;
        }
        for (String skill : input) {
            String trimmed = trimToNull(skill);
            if (trimmed != null && !normalized.contains(trimmed)) {
                normalized.add(trimmed);
            }
        }
        return normalized;
    }

    private String normalizeAvailability(String input) {
        String value = trimToNull(input);
        if (value == null) {
            return "Available";
        }

        String normalized = value.trim();
        switch (normalized.toLowerCase()) {
            case "available": return "Available";
            case "busy": return "Busy";
            case "unavailable": return "Unavailable";
            default:
                throw new IllegalArgumentException("Availability must be one of: Available, Busy, Unavailable");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
