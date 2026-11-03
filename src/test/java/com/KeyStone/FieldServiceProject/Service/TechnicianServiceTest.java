package com.KeyStone.FieldServiceProject.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.KeyStone.FieldServiceProject.DTO.TechnicianCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TechnicianUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.Technician;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.TechnicianRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@SpringBootTest
@ActiveProfiles("test")
class TechnicianServiceTest {

    @Autowired
    private TechnicianService technicianService;

    @Autowired
    private UserAuthRepository userAuthRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Test
    void shouldCreateTechnicianAndListTechnicians() {
        TechnicianCreateRequestDTO request = TechnicianCreateRequestDTO.builder()
                .fullName("Amit Verma")
                .email("amit.verma@keystone.local")
                .phone("+91 9876543210")
                .skills(List.of("Electrical service", "Preventive maintenance"))
                .availability("Available")
                .active(true)
                .build();

        var saved = technicianService.createTechnician(request);

        assertThat(saved.getFullName()).isEqualTo("Amit Verma");
        assertThat(saved.getEmail()).isEqualTo("amit.verma@keystone.local");
        assertThat(technicianService.getAllTechnicians()).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void shouldHandleLegacyNullSkillsInListResponse() {
        technicianRepository.save(Technician.builder()
                .fullName("Legacy Technician")
                .email("legacy.technician@keystone.local")
                .phone("+91 9876543219")
                .skills(null)
                .availability("Available")
                .active(true)
                .build());

        assertThat(technicianService.getAllTechnicians()).isNotNull();
    }

    @Test
    void shouldUpdateSkillsAndAvailability() {
        TechnicianCreateRequestDTO request = TechnicianCreateRequestDTO.builder()
                .fullName("Priya Shah")
                .email("priya.shah@keystone.local")
                .phone("+91 9876543211")
                .skills(List.of("HVAC service"))
                .availability("Busy")
                .active(true)
                .build();

        var saved = technicianService.createTechnician(request);

        TechnicianUpdateRequestDTO update = TechnicianUpdateRequestDTO.builder()
                .skills(List.of("HVAC service", "Equipment inspection"))
                .availability("Available")
                .build();

        var updated = technicianService.updateTechnician(saved.getId(), update);

        assertThat(updated.getSkills()).containsExactly("HVAC service", "Equipment inspection");
        assertThat(updated.getAvailability()).isEqualTo("Available");
    }

    @Test
    void shouldRejectDuplicateEmailAndMissingTechnician() {
        TechnicianCreateRequestDTO request = TechnicianCreateRequestDTO.builder()
                .fullName("Rohan Mehta")
                .email("rohan.mehta@keystone.local")
                .phone("+91 9876543212")
                .skills(List.of("Plumbing service"))
                .availability("Available")
                .build();

        technicianService.createTechnician(request);

        assertThatThrownBy(() -> technicianService.createTechnician(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");

        assertThatThrownBy(() -> technicianService.getTechnicianById(999999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Technician not found");
    }

    @Test
    void shouldRejectDuplicateLinkedUserAccount() {
        UserAuth user = userAuthRepository.save(UserAuth.builder()
                .userName("linked-tech")
                .userEmail("linked.tech@keystone.local")
                .password("encoded-password")
                .phone("+91 9876543213")
                .role(Role.TECHNICIAN)
                .build());

        TechnicianCreateRequestDTO request = TechnicianCreateRequestDTO.builder()
                .fullName("Nisha Rao")
                .email("nisha.rao@keystone.local")
                .phone("+91 9876543214")
                .skills(List.of("Equipment inspection"))
                .availability("Available")
                .userId(user.getId())
                .build();

        technicianService.createTechnician(request);

        assertThatThrownBy(() -> technicianService.createTechnician(TechnicianCreateRequestDTO.builder()
                .fullName("Another Operator")
                .email("another.operator@keystone.local")
                .phone("+91 9876543215")
                .skills(List.of("Electrical service"))
                .availability("Available")
                .userId(user.getId())
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already linked");
    }
}
