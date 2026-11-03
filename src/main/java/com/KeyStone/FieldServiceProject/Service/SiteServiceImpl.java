package com.KeyStone.FieldServiceProject.Service;

import java.util.List;
import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.FieldServiceProject.DTO.SiteCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Entity.Site;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;
import com.KeyStone.FieldServiceProject.Repository.SiteRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@Service
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;
    private final UserAuthRepository userAuthRepository;

    public SiteServiceImpl(SiteRepository siteRepository, CustomerRepository customerRepository, UserAuthRepository userAuthRepository) {
        this.siteRepository = siteRepository;
        this.customerRepository = customerRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @Override
    @Transactional
    public SiteResponseDTO createSite(SiteCreateRequestDTO request) {
        validateRequiredFields(request);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));
        enforceCustomerOwnership(customer);

        Site site = Site.builder()
                .customer(customer)
                .siteName(trimToNull(request.getSiteName()))
                .addressLine1(trimToNull(request.getAddressLine1()))
                .addressLine2(trimToNull(request.getAddressLine2()))
                .city(trimToNull(request.getCity()))
                .state(trimToNull(request.getState()))
                .postalCode(trimToNull(request.getPostalCode()))
                .country(trimToNull(request.getCountry()))
                .contactName(trimToNull(request.getContactName()))
                .contactPhone(trimToNull(request.getContactPhone()))
                .accessNotes(trimToNull(request.getAccessNotes()))
                .active(Boolean.TRUE.equals(request.getActive()))
                .build();

        Site saved = siteRepository.save(site);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getAllSites() {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            return siteRepository.findAll().stream()
                    .filter(site -> site.getCustomer() != null && site.getCustomer().getOwner() != null
                            && site.getCustomer().getOwner().getId().equals(currentUser.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }
        return siteRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SiteResponseDTO getSiteById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + id));
        enforceSiteOwnership(site);
        return mapToResponse(site);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getSitesByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + customerId));
        enforceCustomerOwnership(customer);
        return siteRepository.findByCustomerIdOrderBySiteNameAsc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteResponseDTO> searchSites(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return getAllSites();
        }
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            return siteRepository.searchByNameOrLocation(normalized).stream()
                    .filter(site -> site.getCustomer() != null && site.getCustomer().getOwner() != null
                            && site.getCustomer().getOwner().getId().equals(currentUser.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }
        return siteRepository.searchByNameOrLocation(normalized).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public SiteResponseDTO updateSite(Long id, SiteUpdateRequestDTO request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + id));
        enforceSiteOwnership(site);

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));
            site.setCustomer(customer);
        }

        if (request.getSiteName() != null) {
            site.setSiteName(trimToNull(request.getSiteName()));
        }
        if (request.getAddressLine1() != null) {
            site.setAddressLine1(trimToNull(request.getAddressLine1()));
        }
        if (request.getAddressLine2() != null) {
            site.setAddressLine2(trimToNull(request.getAddressLine2()));
        }
        if (request.getCity() != null) {
            site.setCity(trimToNull(request.getCity()));
        }
        if (request.getState() != null) {
            site.setState(trimToNull(request.getState()));
        }
        if (request.getPostalCode() != null) {
            site.setPostalCode(trimToNull(request.getPostalCode()));
        }
        if (request.getCountry() != null) {
            site.setCountry(trimToNull(request.getCountry()));
        }
        if (request.getContactName() != null) {
            site.setContactName(trimToNull(request.getContactName()));
        }
        if (request.getContactPhone() != null) {
            site.setContactPhone(trimToNull(request.getContactPhone()));
        }
        if (request.getAccessNotes() != null) {
            site.setAccessNotes(trimToNull(request.getAccessNotes()));
        }
        if (request.getActive() != null) {
            site.setActive(request.getActive());
        }

        validateSite(site);
        Site updated = siteRepository.save(site);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + id));
        enforceSiteOwnership(site);

        if (site.isActive()) {
            site.setActive(false);
            siteRepository.save(site);
            return;
        }

        siteRepository.delete(site);
    }

    private void enforceCustomerOwnership(Customer customer) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null || currentUser.getRole() != Role.CUSTOMER) {
            return;
        }
        if (customer.getOwner() == null || !customer.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to access this customer resource");
        }
    }

    private void enforceSiteOwnership(Site site) {
        if (site.getCustomer() == null) {
            return;
        }
        enforceCustomerOwnership(site.getCustomer());
    }

    private UserAuth getCurrentUserIfPresent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        String principalName = principal instanceof UserDetails userDetails ? userDetails.getUsername() : principal.toString();
        return userAuthRepository.findByUserEmail(principalName).orElse(null);
    }

    private void validateRequiredFields(SiteCreateRequestDTO request) {
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer id is required");
        }
        if (isBlank(request.getSiteName())) {
            throw new IllegalArgumentException("Site name is required");
        }
        if (isBlank(request.getAddressLine1())) {
            throw new IllegalArgumentException("Address line 1 is required");
        }
        if (isBlank(request.getCity())) {
            throw new IllegalArgumentException("City is required");
        }
        if (isBlank(request.getState())) {
            throw new IllegalArgumentException("State is required");
        }
        if (isBlank(request.getPostalCode())) {
            throw new IllegalArgumentException("Postal code is required");
        }
        if (isBlank(request.getCountry())) {
            throw new IllegalArgumentException("Country is required");
        }
        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new IllegalArgumentException("Customer not found with id: " + request.getCustomerId());
        }
    }

    private void validateSite(Site site) {
        if (site.getCustomer() == null || site.getCustomer().getId() == null) {
            throw new IllegalArgumentException("Customer is required");
        }
        if (isBlank(site.getSiteName())) {
            throw new IllegalArgumentException("Site name is required");
        }
        if (isBlank(site.getAddressLine1())) {
            throw new IllegalArgumentException("Address line 1 is required");
        }
        if (isBlank(site.getCity())) {
            throw new IllegalArgumentException("City is required");
        }
        if (isBlank(site.getState())) {
            throw new IllegalArgumentException("State is required");
        }
        if (isBlank(site.getPostalCode())) {
            throw new IllegalArgumentException("Postal code is required");
        }
        if (isBlank(site.getCountry())) {
            throw new IllegalArgumentException("Country is required");
        }
        if (!customerRepository.existsById(site.getCustomer().getId())) {
            throw new IllegalArgumentException("Customer not found with id: " + site.getCustomer().getId());
        }
    }

    private SiteResponseDTO mapToResponse(Site site) {
        return SiteResponseDTO.builder()
                .id(site.getId())
                .customerId(site.getCustomer() != null ? site.getCustomer().getId() : null)
                .siteName(site.getSiteName())
                .addressLine1(site.getAddressLine1())
                .addressLine2(site.getAddressLine2())
                .city(site.getCity())
                .state(site.getState())
                .postalCode(site.getPostalCode())
                .country(site.getCountry())
                .contactName(site.getContactName())
                .contactPhone(site.getContactPhone())
                .accessNotes(site.getAccessNotes())
                .active(site.isActive())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
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
