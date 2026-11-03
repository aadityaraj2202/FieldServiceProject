package com.KeyStone.FieldServiceProject.Service;

import java.util.List;

import com.KeyStone.FieldServiceProject.DTO.SiteCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteUpdateRequestDTO;

public interface SiteService {

    SiteResponseDTO createSite(SiteCreateRequestDTO request);

    List<SiteResponseDTO> getAllSites();

    SiteResponseDTO getSiteById(Long id);

    List<SiteResponseDTO> getSitesByCustomer(Long customerId);

    List<SiteResponseDTO> searchSites(String query);

    SiteResponseDTO updateSite(Long id, SiteUpdateRequestDTO request);

    void deleteSite(Long id);
}
