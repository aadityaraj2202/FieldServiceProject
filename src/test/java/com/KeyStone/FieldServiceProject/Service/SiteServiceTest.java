package com.KeyStone.FieldServiceProject.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.KeyStone.FieldServiceProject.DTO.SiteCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.SiteUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;

@SpringBootTest
@ActiveProfiles("test")
class SiteServiceTest {

    @Autowired
    private SiteService siteService;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    void shouldCreateSiteForExistingCustomer() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Northwind")
                .contactName("Maya")
                .email("site-test@northwind.com")
                .phone("555-1111")
                .address("Test Address")
                .active(true)
                .build());

        SiteCreateRequestDTO request = SiteCreateRequestDTO.builder()
                .customerId(customer.getId())
                .siteName("Warehouse North")
                .addressLine1("45 Market Road")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560001")
                .country("India")
                .contactName("Ravi")
                .contactPhone("9999999999")
                .accessNotes("Gate access required")
                .active(true)
                .build();

        var saved = siteService.createSite(request);

        assertThat(saved.getCustomerId()).isEqualTo(customer.getId());
        assertThat(saved.getSiteName()).isEqualTo("Warehouse North");
        assertThat(siteService.getSitesByCustomer(customer.getId())).hasSize(1);
    }

    @Test
    void shouldRejectMissingCustomerWhenCreatingSite() {
        SiteCreateRequestDTO request = SiteCreateRequestDTO.builder()
                .customerId(999999L)
                .siteName("Missing Customer Site")
                .addressLine1("1 Main Street")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560002")
                .country("India")
                .build();

        assertThatThrownBy(() -> siteService.createSite(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Customer not found");
    }

    @Test
    void shouldUpdateSiteAndHandleMissingRecord() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Acme")
                .contactName("Nina")
                .email("site-update@acme.com")
                .phone("555-2222")
                .address("Acme HQ")
                .active(true)
                .build());

        SiteCreateRequestDTO create = SiteCreateRequestDTO.builder()
                .customerId(customer.getId())
                .siteName("Old Name")
                .addressLine1("12 Lake Road")
                .city("Chennai")
                .state("Tamil Nadu")
                .postalCode("600001")
                .country("India")
                .build();

        var saved = siteService.createSite(create);

        SiteUpdateRequestDTO update = SiteUpdateRequestDTO.builder()
                .siteName("New Name")
                .city("Hyderabad")
                .active(false)
                .build();

        var updated = siteService.updateSite(saved.getId(), update);
        assertThat(updated.getSiteName()).isEqualTo("New Name");
        assertThat(updated.isActive()).isFalse();

        assertThatThrownBy(() -> siteService.getSiteById(999999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Site not found");
    }
}
