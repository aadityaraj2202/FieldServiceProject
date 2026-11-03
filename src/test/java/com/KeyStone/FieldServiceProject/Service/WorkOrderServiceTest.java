package com.KeyStone.FieldServiceProject.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;

import com.KeyStone.FieldServiceProject.DTO.PartUsageCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderStatusUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Entity.Site;
import com.KeyStone.FieldServiceProject.Entity.Technician;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;
import com.KeyStone.FieldServiceProject.Repository.SiteRepository;
import com.KeyStone.FieldServiceProject.Repository.TechnicianRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@SpringBootTest
@ActiveProfiles("test")
class WorkOrderServiceTest {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private UserAuthRepository userAuthRepository;

    @Test
    void shouldCreateWorkOrderForValidCustomerAndSite() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Northwind Foods")
                .contactName("Maya")
                .email("workorder.customer@northwind.com")
                .phone("555-0101")
                .address("12 Market Street")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Cold Storage Warehouse")
                .addressLine1("45 Market Road")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560001")
                .country("India")
                .contactName("Ravi")
                .contactPhone("9999999999")
                .accessNotes("Gate access required")
                .active(true)
                .build());

        WorkOrderCreateRequestDTO request = WorkOrderCreateRequestDTO.builder()
                .title("Generator inspection")
                .description("Inspect the backup generator")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("Preventive maintenance")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(3))
                .build();

        var saved = workOrderService.createWorkOrder(request);

        assertThat(saved.getTitle()).isEqualTo("Generator inspection");
        assertThat(saved.getCustomerId()).isEqualTo(customer.getId());
        assertThat(saved.getSiteId()).isEqualTo(site.getId());
        assertThat(workOrderService.getAllWorkOrders()).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void shouldRejectSiteFromDifferentCustomer() {
        Customer customerA = customerRepository.save(Customer.builder()
                .organization("Acme")
                .contactName("Asha")
                .email("acme@workorder.com")
                .phone("555-0102")
                .address("Acme HQ")
                .active(true)
                .build());

        Customer customerB = customerRepository.save(Customer.builder()
                .organization("Beta")
                .contactName("Bharat")
                .email("beta@workorder.com")
                .phone("555-0103")
                .address("Beta HQ")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customerA)
                .siteName("Wrong Site")
                .addressLine1("1 Main Street")
                .city("Mumbai")
                .state("Maharashtra")
                .postalCode("400001")
                .country("India")
                .active(true)
                .build());

        WorkOrderCreateRequestDTO request = WorkOrderCreateRequestDTO.builder()
                .title("Mismatch site")
                .description("This work order should fail")
                .customerId(customerB.getId())
                .siteId(site.getId())
                .serviceType("Electrical service")
                .priority(WorkOrderPriority.MEDIUM)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(1))
                .build();

        assertThatThrownBy(() -> workOrderService.createWorkOrder(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to the selected customer");
    }

    @Test
    void shouldUpdateStatusWithValidTransition() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Delta")
                .contactName("Disha")
                .email("delta@workorder.com")
                .phone("555-0104")
                .address("Delta HQ")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Delta Site")
                .addressLine1("7 Lake Drive")
                .city("Pune")
                .state("Maharashtra")
                .postalCode("411001")
                .country("India")
                .active(true)
                .build());

        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("HVAC check")
                .description("Check air conditioning")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("HVAC service")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now())
                .build());

        WorkOrderStatusUpdateRequestDTO update = WorkOrderStatusUpdateRequestDTO.builder()
                .status(WorkOrderStatus.ASSIGNED)
                .build();

        var updated = workOrderService.updateStatus(created.getId(), update);
        assertThat(updated.getStatus()).isEqualTo(WorkOrderStatus.ASSIGNED);
    }

    @Test
    void shouldRejectInvalidStatusTransition() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Epsilon")
                .contactName("Evan")
                .email("epsilon@workorder.com")
                .phone("555-0105")
                .address("Epsilon HQ")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Epsilon Site")
                .addressLine1("9 Civic Road")
                .city("Hyderabad")
                .state("Telangana")
                .postalCode("500001")
                .country("India")
                .active(true)
                .build());

        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("Electrical repair")
                .description("Repair lighting board")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("Electrical service")
                .priority(WorkOrderPriority.CRITICAL)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(2))
                .build());

        assertThatThrownBy(() -> workOrderService.updateStatus(created.getId(),
                WorkOrderStatusUpdateRequestDTO.builder().status(WorkOrderStatus.CLOSED).build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    void shouldAssignTechnicianAndRetrieveByTechnician() {
        Customer customer = customerRepository.save(Customer.builder()
                .organization("Gamma")
                .contactName("Garima")
                .email("gamma@workorder.com")
                .phone("555-0106")
                .address("Gamma HQ")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Gamma Site")
                .addressLine1("18 Orchard Road")
                .city("Jaipur")
                .state("Rajasthan")
                .postalCode("302001")
                .country("India")
                .active(true)
                .build());

        Technician technician = technicianRepository.save(Technician.builder()
                .fullName("Karan Patel")
                .email("karan.workorder@keystone.local")
                .phone("+91 9876500101")
                .skills(List.of("Electrical service", "Preventive maintenance"))
                .availability("Available")
                .active(true)
                .build());

        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("Boiler service")
                .description("Service boiler room equipment")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("Preventive maintenance")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(5))
                .build());

        var assigned = workOrderService.assignTechnician(created.getId(), technician.getId());
        assertThat(assigned.getAssignedTechnicianId()).isEqualTo(technician.getId());
        assertThat(workOrderService.getWorkOrdersByTechnician(technician.getId())).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void shouldRejectWorkOrderAccessWhenCustomerDoesNotOwnResource() {
        UserAuth owner = userAuthRepository.save(UserAuth.builder()
                .userName("owner-workorder-user")
                .userEmail("owner.workorder@test.com")
                .password("encoded-password")
                .role(Role.CUSTOMER)
                .build());

        Customer customer = customerRepository.save(Customer.builder()
                .organization("Owned Works")
                .contactName("Own Contact")
                .email("owned.workorder@test.com")
                .phone("555-0111")
                .address("Owned Address")
                .active(true)
                .owner(owner)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Owned Site")
                .addressLine1("1 Owned Street")
                .city("Delhi")
                .state("Delhi")
                .postalCode("110001")
                .country("India")
                .active(true)
                .build());

        UserAuth otherUser = userAuthRepository.save(UserAuth.builder()
                .userName("other-workorder-user")
                .userEmail("other.workorder@test.com")
                .password("encoded-password")
                .role(Role.CUSTOMER)
                .build());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(owner.getUserEmail()).password("p").authorities("ROLE_CUSTOMER").build(),
                        null,
                        java.util.List.of()));

        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("Protected order")
                .description("Protected")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("Electrical service")
                .priority(WorkOrderPriority.MEDIUM)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(2))
                .build());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(otherUser.getUserEmail()).password("p").authorities("ROLE_CUSTOMER").build(),
                        null,
                        java.util.List.of()));

        try {
            assertThatThrownBy(() -> workOrderService.getWorkOrderById(created.getId()))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You are not allowed to access this customer resource");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void shouldCreateTimeLogForAssignedTechnician() {
        UserAuth technicianUser = userAuthRepository.save(UserAuth.builder()
                .userName("time-tech-user")
                .userEmail("time.tech@test.com")
                .password("encoded-password")
                .role(Role.TECHNICIAN)
                .build());

        Technician technician = technicianRepository.save(Technician.builder()
                .user(technicianUser)
                .fullName("Time Technician")
                .email("time.technician@keystone.local")
                .phone("555-0201")
                .skills(List.of("Electrical service"))
                .availability("Available")
                .active(true)
                .build());

        Customer customer = customerRepository.save(Customer.builder()
                .organization("Time Log Customer")
                .contactName("Alicia")
                .email("time.customer@test.com")
                .phone("555-0202")
                .address("Time-Log Drive")
                .active(true)
                .build());

        Site site = siteRepository.save(Site.builder()
                .customer(customer)
                .siteName("Time Log Site")
                .addressLine1("100 Time Road")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560010")
                .country("India")
                .active(true)
                .build());

        var createdWorkOrder = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("Time log work order")
                .description("Perform maintenance")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("Electrical service")
                .priority(WorkOrderPriority.MEDIUM)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(2))
                .build());

        workOrderService.assignTechnician(createdWorkOrder.getId(), technician.getId());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(technicianUser.getUserEmail()).password("p").authorities("ROLE_TECHNICIAN").build(),
                        null,
                        java.util.List.of()));

        var log = workOrderService.createTimeLog(createdWorkOrder.getId(), TimeLogCreateRequestDTO.builder()
                .startedAt(java.time.LocalDateTime.now().minusHours(2))
                .endedAt(java.time.LocalDateTime.now())
                .hours(new java.math.BigDecimal("2.0"))
                .note("Replaced breaker panel")
                .build());

        assertThat(log.getWorkOrderId()).isEqualTo(createdWorkOrder.getId());
        assertThat(log.getTechnicianId()).isEqualTo(technician.getId());
        assertThat(workOrderService.getTimeLogsByWorkOrder(createdWorkOrder.getId())).hasSize(1);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRejectTimeLogWhenTechnicianTriesToImpersonateAnotherTechnician() {
        UserAuth techA = userAuthRepository.save(UserAuth.builder()
                .userName("tech-a")
                .userEmail("techa@test.com")
                .password("encoded-password")
                .role(Role.TECHNICIAN)
                .build());
        UserAuth techB = userAuthRepository.save(UserAuth.builder()
                .userName("tech-b")
                .userEmail("techb@test.com")
                .password("encoded-password")
                .role(Role.TECHNICIAN)
                .build());

        Technician technicianA = technicianRepository.save(Technician.builder()
                .user(techA).fullName("Tech A").email("techa@keystone.local").phone("555-0210").skills(List.of("HVAC service")).availability("Available").active(true).build());
        Technician technicianB = technicianRepository.save(Technician.builder()
                .user(techB).fullName("Tech B").email("techb@keystone.local").phone("555-0211").skills(List.of("HVAC service")).availability("Available").active(true).build());

        Customer customer = customerRepository.save(Customer.builder().organization("Tech Customer").contactName("Sam").email("tech.customer@test.com").phone("555-0212").address("Address").active(true).build());
        Site site = siteRepository.save(Site.builder().customer(customer).siteName("Tech Site").addressLine1("22 Site Lane").city("Pune").state("Maharashtra").postalCode("411025").country("India").active(true).build());

        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder()
                .title("Tech impersonation check")
                .description("Check identity")
                .customerId(customer.getId())
                .siteId(site.getId())
                .serviceType("HVAC service")
                .priority(WorkOrderPriority.HIGH)
                .status(WorkOrderStatus.NEW)
                .scheduledDate(LocalDate.now().plusDays(3))
                .build());
        workOrderService.assignTechnician(created.getId(), technicianA.getId());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(techA.getUserEmail()).password("p").authorities("ROLE_TECHNICIAN").build(),
                        null,
                        java.util.List.of()));

        assertThatThrownBy(() -> workOrderService.createTimeLog(created.getId(), TimeLogCreateRequestDTO.builder()
                .startedAt(java.time.LocalDateTime.now().minusMinutes(30))
                .endedAt(java.time.LocalDateTime.now())
                .hours(new java.math.BigDecimal("0.5"))
                .note("Should fail")
                .technicianId(technicianB.getId())
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("technician");
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCreatePartsUsageForAssignedTechnician() {
        UserAuth technicianUser = userAuthRepository.save(UserAuth.builder()
                .userName("parts-tech-user")
                .userEmail("parts.tech@test.com")
                .password("encoded-password")
                .role(Role.TECHNICIAN)
                .build());

        Technician technician = technicianRepository.save(Technician.builder()
                .user(technicianUser)
                .fullName("Parts Technician")
                .email("parts.technician@keystone.local")
                .phone("555-0220")
                .skills(List.of("Plumbing service"))
                .availability("Available")
                .active(true)
                .build());

        Customer customer = customerRepository.save(Customer.builder().organization("Parts Customer").contactName("Nina").email("parts.customer@test.com").phone("555-0221").address("Parts Street").active(true).build());
        Site site = siteRepository.save(Site.builder().customer(customer).siteName("Parts Site").addressLine1("88 Parts Avenue").city("Jaipur").state("Rajasthan").postalCode("302001").country("India").active(true).build());
        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder().title("Pipes fix").description("Fix kitchen pipe").customerId(customer.getId()).siteId(site.getId()).serviceType("Plumbing service").priority(WorkOrderPriority.HIGH).status(WorkOrderStatus.NEW).scheduledDate(LocalDate.now().plusDays(1)).build());
        workOrderService.assignTechnician(created.getId(), technician.getId());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(technicianUser.getUserEmail()).password("p").authorities("ROLE_TECHNICIAN").build(),
                        null,
                        java.util.List.of()));

        var usage = workOrderService.createPartUsage(created.getId(), PartUsageCreateRequestDTO.builder()
                .partName("PVC elbow")
                .quantity(new java.math.BigDecimal("2"))
                .unit("pcs")
                .notes("Used for sink line repair")
                .build());

        assertThat(usage.getWorkOrderId()).isEqualTo(created.getId());
        assertThat(usage.getPartName()).isEqualTo("PVC elbow");
        assertThat(workOrderService.getPartUsagesByWorkOrder(created.getId())).hasSize(1);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRejectPartUsageWhenQuantityIsInvalid() {
        UserAuth technicianUser = userAuthRepository.save(UserAuth.builder()
                .userName("invalid-parts-tech")
                .userEmail("invalid.parts@test.com")
                .password("encoded-password")
                .role(Role.TECHNICIAN)
                .build());

        Technician technician = technicianRepository.save(Technician.builder().user(technicianUser).fullName("Invalid Parts Tech").email("invalid.parts@keystone.local").phone("555-0222").skills(List.of("Electrical service")).availability("Available").active(true).build());
        Customer customer = customerRepository.save(Customer.builder().organization("Invalid Parts Customer").contactName("Vik").email("invalid.parts.customer@test.com").phone("555-0223").address("Invalid Road").active(true).build());
        Site site = siteRepository.save(Site.builder().customer(customer).siteName("Invalid Parts Site").addressLine1("92 Invalid Road").city("Mumbai").state("Maharashtra").postalCode("400001").country("India").active(true).build());
        var created = workOrderService.createWorkOrder(WorkOrderCreateRequestDTO.builder().title("Invalid parts").description("Missing qty").customerId(customer.getId()).siteId(site.getId()).serviceType("Electrical service").priority(WorkOrderPriority.MEDIUM).status(WorkOrderStatus.NEW).scheduledDate(LocalDate.now().plusDays(2)).build());
        workOrderService.assignTechnician(created.getId(), technician.getId());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        User.withUsername(technicianUser.getUserEmail()).password("p").authorities("ROLE_TECHNICIAN").build(),
                        null,
                        java.util.List.of()));

        assertThatThrownBy(() -> workOrderService.createPartUsage(created.getId(), PartUsageCreateRequestDTO.builder()
                .partName("Fuse")
                .quantity(new java.math.BigDecimal("0"))
                .unit("pcs")
                .notes("Invalid quantity")
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("quantity");
        SecurityContextHolder.clearContext();
    }
}

