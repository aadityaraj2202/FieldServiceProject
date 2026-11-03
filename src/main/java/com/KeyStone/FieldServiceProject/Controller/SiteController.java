package com.KeyStone.FieldServiceProject.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.FieldServiceProject.DTO.SiteCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.Service.SiteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @PostMapping
    public ResponseEntity<SiteResponseDTO> createSite(@Valid @RequestBody SiteCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.createSite(request));
    }

    @GetMapping
    public ResponseEntity<List<SiteResponseDTO>> getAllSites() {
        return ResponseEntity.ok(siteService.getAllSites());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SiteResponseDTO>> getSitesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(siteService.getSitesByCustomer(customerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SiteResponseDTO>> searchSites(@RequestParam String query) {
        return ResponseEntity.ok(siteService.searchSites(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponseDTO> getSiteById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getSiteById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteResponseDTO> updateSite(@PathVariable Long id,
            @Valid @RequestBody SiteUpdateRequestDTO request) {
        return ResponseEntity.ok(siteService.updateSite(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }
}
