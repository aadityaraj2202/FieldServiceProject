package com.KeyStone.FieldServiceProject.Service;

import java.util.List;
import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.FieldServiceProject.DTO.CustomerCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.CustomerResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.CustomerUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserAuthRepository userAuthRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository, UserAuthRepository userAuthRepository) {
        this.customerRepository = customerRepository;
        this.userAuthRepository = userAuthRepository;
    }

    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CustomerCreateRequestDTO request) {
        validateCustomerInput(request.getOrganization(), request.getContactName(), request.getEmail(), request.getPhone(), request.getAddress());

        if (customerRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Customer with this email already exists");
        }

        UserAuth currentUser = getCurrentUserIfPresent();
        Customer customer = Customer.builder()
                .organization(trimToNull(request.getOrganization()))
                .contactName(trimToNull(request.getContactName()))
                .email(trimToNull(request.getEmail()))
                .phone(trimToNull(request.getPhone()))
                .address(trimToNull(request.getAddress()))
                .active(Boolean.TRUE.equals(request.getActive()))
                .owner(currentUser != null && currentUser.getRole() == Role.CUSTOMER ? currentUser : null)
                .build();

        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER && customerRepository.existsByOwnerId(currentUser.getId())) {
            throw new AccessDeniedException("Customer already exists for this user account");
        }

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
        enforceCustomerOwnership(customer);
        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getAllCustomers() {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            return customerRepository.findByOwnerId(currentUser.getId()).stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> searchCustomers(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return getAllCustomers();
        }
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            return customerRepository.searchByOrganizationOrContactOrEmail(normalized).stream()
                    .filter(customer -> customer.getOwner() != null && customer.getOwner().getId().equals(currentUser.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }
        return customerRepository.searchByOrganizationOrContactOrEmail(normalized).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public CustomerResponseDTO updateCustomer(Long id, CustomerUpdateRequestDTO request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
        enforceCustomerOwnership(customer);

        if (request.getOrganization() != null) {
            customer.setOrganization(trimToNull(request.getOrganization()));
        }
        if (request.getContactName() != null) {
            customer.setContactName(trimToNull(request.getContactName()));
        }
        if (request.getEmail() != null) {
            String newEmail = trimToNull(request.getEmail());
            if (!Objects.equals(customer.getEmail(), newEmail) && customerRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("Customer with this email already exists");
            }
            customer.setEmail(newEmail);
        }
        if (request.getPhone() != null) {
            customer.setPhone(trimToNull(request.getPhone()));
        }
        if (request.getAddress() != null) {
            customer.setAddress(trimToNull(request.getAddress()));
        }
        if (request.getActive() != null) {
            customer.setActive(request.getActive());
        }

        validateCustomerInput(customer.getOrganization(), customer.getContactName(), customer.getEmail(), customer.getPhone(), customer.getAddress());
        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
        enforceCustomerOwnership(customer);
        customerRepository.deleteById(id);
    }

    private void enforceCustomerOwnership(Customer customer) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null || currentUser.getRole() != Role.CUSTOMER) {
            return;
        }
        if (customer.getOwner() == null || !customer.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to access this customer record");
        }
    }

    private UserAuth getCurrentUserIfPresent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String principalName;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            principalName = userDetails.getUsername();
        } else {
            principalName = principal.toString();
        }

        return userAuthRepository.findByUserEmail(principalName).orElse(null);
    }

    private void validateCustomerInput(String organization, String contactName, String email, String phone) {
        validateCustomerInput(organization, contactName, email, phone, null);
    }

    private void validateCustomerInput(String organization, String contactName, String email, String phone, String address) {
        if (isBlank(organization)) {
            throw new IllegalArgumentException("Customer / Organization Name is required");
        }
        if (isBlank(contactName)) {
            throw new IllegalArgumentException("Primary Contact Name is required");
        }
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        if (isBlank(phone)) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (isBlank(address)) {
            throw new IllegalArgumentException("Address is required");
        }
    }

    private CustomerResponseDTO mapToResponse(Customer customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .organization(customer.getOrganization())
                .contactName(customer.getContactName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .active(customer.isActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
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
