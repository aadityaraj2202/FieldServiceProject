package com.KeyStone.FieldServiceProject.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;

import com.KeyStone.FieldServiceProject.DTO.CustomerCreateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@SpringBootTest
@ActiveProfiles("test")
class CustomerServiceTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserAuthRepository userAuthRepository;

    @Test
    void shouldCreateCustomerAndReturnPersistedDetails() {
        CustomerCreateRequestDTO request = CustomerCreateRequestDTO.builder()
                .organization("Northwind Foods")
                .contactName("Maya Joshi")
                .email("maya@northwindfoods.com")
                .phone("555-0101")
                .address("12 Market Street")
                .active(true)
                .build();

        var saved = customerService.createCustomer(request);

        assertThat(saved.getOrganization()).isEqualTo("Northwind Foods");
        assertThat(saved.getContactName()).isEqualTo("Maya Joshi");
        assertThat(saved.getEmail()).isEqualTo("maya@northwindfoods.com");
        assertThat(customerService.getAllCustomers()).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void shouldRejectCustomerWithoutAddress() {
        CustomerCreateRequestDTO request = CustomerCreateRequestDTO.builder()
                .organization("Missing Address Co")
                .contactName("Aditi Shah")
                .email("aditi.missing@keystone.local")
                .phone("555-0199")
                .address("   ")
                .active(true)
                .build();

        assertThatThrownBy(() -> customerService.createCustomer(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Address is required");
    }

    @Test
    void shouldRejectCustomerAccessWhenAuthenticatedUserIsNotOwner() {
        UserAuth owner = userAuthRepository.save(UserAuth.builder()
                .userName("owner-user")
                .userEmail("owner.customer@test.com")
                .password("encoded-password")
                .role(Role.CUSTOMER)
                .build());

        Customer ownedCustomer = customerRepository.save(Customer.builder()
                .organization("Owner Org")
                .contactName("Owner Contact")
                .email("owner.customer.record@test.com")
                .phone("555-0109")
                .address("Owner Address")
                .active(true)
                .owner(owner)
                .build());

        UserAuth otherUser = userAuthRepository.save(UserAuth.builder()
                .userName("other-user")
                .userEmail("other.customer@test.com")
                .password("encoded-password")
                .role(Role.CUSTOMER)
                .build());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(otherUser.getUserEmail()).password("p").authorities("ROLE_CUSTOMER").build(),
                        null,
                        java.util.List.of()));

        try {
            assertThatThrownBy(() -> customerService.getCustomerById(ownedCustomer.getId()))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You are not allowed to access this customer record");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
