package com.KeyStone.FieldServiceProject.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeyStone.FieldServiceProject.DTO.PartUsageCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.PartUsageResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.PartUsageUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderStatusUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;
import com.KeyStone.FieldServiceProject.Entity.Customer;
import com.KeyStone.FieldServiceProject.Entity.PartUsage;
import com.KeyStone.FieldServiceProject.Entity.Site;
import com.KeyStone.FieldServiceProject.Entity.Technician;
import com.KeyStone.FieldServiceProject.Entity.TimeLog;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Entity.WorkOrder;
import com.KeyStone.FieldServiceProject.Repository.CustomerRepository;
import com.KeyStone.FieldServiceProject.Repository.PartUsageRepository;
import com.KeyStone.FieldServiceProject.Repository.SiteRepository;
import com.KeyStone.FieldServiceProject.Repository.TechnicianRepository;
import com.KeyStone.FieldServiceProject.Repository.TimeLogRepository;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;
import com.KeyStone.FieldServiceProject.Repository.WorkOrderRepository;

@Service
public class WorkOrderServiceImpl implements WorkOrderService {

    private static final Map<WorkOrderStatus, List<WorkOrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            WorkOrderStatus.NEW, List.of(WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED),
            WorkOrderStatus.ASSIGNED, List.of(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD, WorkOrderStatus.CANCELLED),
            WorkOrderStatus.IN_PROGRESS, List.of(WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED),
            WorkOrderStatus.ON_HOLD, List.of(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED),
            WorkOrderStatus.COMPLETED, List.of(WorkOrderStatus.CLOSED),
            WorkOrderStatus.CANCELLED, List.of(),
            WorkOrderStatus.CLOSED, List.of());

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final TechnicianRepository technicianRepository;
    private final UserAuthRepository userAuthRepository;
    private final TimeLogRepository timeLogRepository;
    private final PartUsageRepository partUsageRepository;

    public WorkOrderServiceImpl(WorkOrderRepository workOrderRepository,
            CustomerRepository customerRepository,
            SiteRepository siteRepository,
            TechnicianRepository technicianRepository,
            UserAuthRepository userAuthRepository,
            TimeLogRepository timeLogRepository,
            PartUsageRepository partUsageRepository) {
        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.technicianRepository = technicianRepository;
        this.userAuthRepository = userAuthRepository;
        this.timeLogRepository = timeLogRepository;
        this.partUsageRepository = partUsageRepository;
    }

    @Override
    @Transactional
    public WorkOrderResponseDTO createWorkOrder(WorkOrderCreateRequestDTO request) {
        validateCreateRequest(request);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));
        enforceCustomerOwnership(customer);

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + request.getSiteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Site does not belong to the selected customer");
        }

        WorkOrder workOrder = WorkOrder.builder()
                .title(trimToNull(request.getTitle()))
                .description(trimToNull(request.getDescription()))
                .customer(customer)
                .site(site)
                .serviceType(trimToNull(request.getServiceType()))
                .priority(request.getPriority())
                .status(request.getStatus())
                .scheduledDate(request.getScheduledDate())
                .build();

        validateWorkOrder(workOrder);
        return mapToResponse(workOrderRepository.save(workOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getAllWorkOrders() {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            return workOrderRepository.findAll().stream()
                    .filter(workOrder -> workOrder.getCustomer() != null && workOrder.getCustomer().getOwner() != null
                            && workOrder.getCustomer().getOwner().getId().equals(currentUser.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }
        if (currentUser != null && currentUser.getRole() == Role.TECHNICIAN) {
            Technician currentTechnician = resolveCurrentTechnician();
            if (currentTechnician == null) {
                return List.of();
            }
            return workOrderRepository.findAll().stream()
                    .filter(workOrder -> workOrder.getAssignedTechnician() != null
                            && Objects.equals(workOrder.getAssignedTechnician().getId(), currentTechnician.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }
        return workOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WorkOrderResponseDTO getWorkOrderById(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + id));
        enforceWorkOrderOwnership(workOrder);
        return mapToResponse(workOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getWorkOrdersByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + customerId));
        enforceCustomerOwnership(customer);
        return workOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getWorkOrdersBySite(Long siteId) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + siteId));
        enforceSiteOwnership(site);
        return workOrderRepository.findBySiteIdOrderByCreatedAtDesc(siteId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> getWorkOrdersByTechnician(Long technicianId) {
        if (!technicianRepository.existsById(technicianId)) {
            throw new IllegalArgumentException("Technician not found with id: " + technicianId);
        }
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.TECHNICIAN) {
            Technician currentTechnician = resolveCurrentTechnician();
            if (currentTechnician == null || !Objects.equals(currentTechnician.getId(), technicianId)) {
                throw new AccessDeniedException("You are not allowed to access this technician resource");
            }
        }
        return workOrderRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(technicianId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrderResponseDTO> filterWorkOrders(Long customerId, Long siteId, Long technicianId,
            WorkOrderStatus status, WorkOrderPriority priority) {
        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + customerId));
            enforceCustomerOwnership(customer);
        }
        if (siteId != null) {
            Site site = siteRepository.findById(siteId)
                    .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + siteId));
            enforceSiteOwnership(site);
        }
        if (technicianId != null && !technicianRepository.existsById(technicianId)) {
            throw new IllegalArgumentException("Technician not found with id: " + technicianId);
        }
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser != null && currentUser.getRole() == Role.TECHNICIAN) {
            Technician currentTechnician = resolveCurrentTechnician();
            if (currentTechnician == null) {
                throw new AccessDeniedException("Technician profile is required");
            }
            if (technicianId != null && !Objects.equals(technicianId, currentTechnician.getId())) {
                throw new AccessDeniedException("You are not allowed to access this technician resource");
            }
        }
        return workOrderRepository.filterWorkOrders(customerId, siteId, technicianId, status, priority).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateRequestDTO request) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + id));
        enforceWorkOrderOwnership(workOrder);

        if (request.getTitle() != null) {
            workOrder.setTitle(trimToNull(request.getTitle()));
        }
        if (request.getDescription() != null) {
            workOrder.setDescription(trimToNull(request.getDescription()));
        }
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));
            workOrder.setCustomer(customer);
        }
        if (request.getSiteId() != null) {
            Site site = siteRepository.findById(request.getSiteId())
                    .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + request.getSiteId()));
            if (!site.getCustomer().getId().equals(workOrder.getCustomer().getId())) {
                throw new IllegalArgumentException("Site does not belong to the selected customer");
            }
            workOrder.setSite(site);
        }
        if (request.getServiceType() != null) {
            workOrder.setServiceType(trimToNull(request.getServiceType()));
        }
        if (request.getPriority() != null) {
            workOrder.setPriority(request.getPriority());
        }
        if (request.getScheduledDate() != null) {
            workOrder.setScheduledDate(request.getScheduledDate());
        }

        validateWorkOrder(workOrder);
        return mapToResponse(workOrderRepository.save(workOrder));
    }

    @Override
    @Transactional
    public WorkOrderResponseDTO updateStatus(Long id, WorkOrderStatusUpdateRequestDTO request) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + id));
        enforceWorkOrderOwnership(workOrder);

        WorkOrderStatus newStatus = request.getStatus();
        List<WorkOrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(workOrder.getStatus(), List.of());
        if (!allowed.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + workOrder.getStatus() + " to " + newStatus);
        }

        workOrder.setStatus(newStatus);
        return mapToResponse(workOrderRepository.save(workOrder));
    }

    @Override
    @Transactional
    public WorkOrderResponseDTO assignTechnician(Long workOrderId, Long technicianId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderOwnership(workOrder);

        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + technicianId));

        workOrder.setAssignedTechnician(technician);
        if (workOrder.getStatus() == WorkOrderStatus.NEW) {
            workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        }
        return mapToResponse(workOrderRepository.save(workOrder));
    }

    @Override
    @Transactional
    public TimeLogResponseDTO createTimeLog(Long workOrderId, TimeLogCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Time log request is required");
        }
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);

        Technician technician = resolveTechnicianForEntry(workOrder, request.getTechnicianId(), "time log");
        validateTimeLogRequest(request);

        TimeLog timeLog = TimeLog.builder()
                .workOrder(workOrder)
                .technician(technician)
                .startedAt(request.getStartedAt())
                .endedAt(request.getEndedAt())
                .hours(resolveHours(request.getStartedAt(), request.getEndedAt(), request.getHours()))
                .note(trimToNull(request.getNote()))
                .build();

        validateTimeLog(timeLog);
        return mapTimeLogToResponse(timeLogRepository.save(timeLog));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTimeLogsByWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);
        return timeLogRepository.findByWorkOrderIdOrderByStartedAtDesc(workOrderId).stream()
                .map(this::mapTimeLogToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TimeLogResponseDTO updateTimeLog(Long workOrderId, Long timeLogId, TimeLogUpdateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Time log request is required");
        }
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);

        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("Time log not found with id: " + timeLogId));
        if (!Objects.equals(timeLog.getWorkOrder().getId(), workOrderId)) {
            throw new IllegalArgumentException("Time log does not belong to this work order");
        }
        enforceTimeLogAccess(timeLog);

        if (request.getTechnicianId() != null) {
            Technician technician = resolveTechnicianForEntry(workOrder, request.getTechnicianId(), "time log");
            timeLog.setTechnician(technician);
        }
        if (request.getStartedAt() != null) {
            timeLog.setStartedAt(request.getStartedAt());
        }
        if (request.getEndedAt() != null) {
            timeLog.setEndedAt(request.getEndedAt());
        }
        if (request.getHours() != null) {
            timeLog.setHours(request.getHours());
        }
        if (request.getNote() != null) {
            timeLog.setNote(trimToNull(request.getNote()));
        }

        if (timeLog.getHours() == null) {
            timeLog.setHours(resolveHours(timeLog.getStartedAt(), timeLog.getEndedAt(), null));
        }
        validateTimeLog(timeLog);
        return mapTimeLogToResponse(timeLogRepository.save(timeLog));
    }

    @Override
    @Transactional
    public void deleteTimeLog(Long workOrderId, Long timeLogId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);
        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("Time log not found with id: " + timeLogId));
        if (!Objects.equals(timeLog.getWorkOrder().getId(), workOrderId)) {
            throw new IllegalArgumentException("Time log does not belong to this work order");
        }
        enforceTimeLogAccess(timeLog);
        timeLogRepository.delete(timeLog);
    }

    @Override
    @Transactional
    public PartUsageResponseDTO createPartUsage(Long workOrderId, PartUsageCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Part usage request is required");
        }
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);

        Technician technician = resolveTechnicianForEntry(workOrder, request.getTechnicianId(), "part usage");
        validatePartUsageRequest(request);

        PartUsage partUsage = PartUsage.builder()
                .workOrder(workOrder)
                .technician(technician)
                .partName(trimToNull(request.getPartName()))
                .quantity(request.getQuantity())
                .unit(trimToNull(request.getUnit()))
                .notes(trimToNull(request.getNotes()))
                .build();

        validatePartUsage(partUsage);
        return mapPartUsageToResponse(partUsageRepository.save(partUsage));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartUsageResponseDTO> getPartUsagesByWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);
        return partUsageRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(this::mapPartUsageToResponse)
                .toList();
    }

    @Override
    @Transactional
    public PartUsageResponseDTO updatePartUsage(Long workOrderId, Long partUsageId, PartUsageUpdateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Part usage request is required");
        }
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);

        PartUsage partUsage = partUsageRepository.findById(partUsageId)
                .orElseThrow(() -> new IllegalArgumentException("Part usage not found with id: " + partUsageId));
        if (!Objects.equals(partUsage.getWorkOrder().getId(), workOrderId)) {
            throw new IllegalArgumentException("Part usage does not belong to this work order");
        }
        enforcePartUsageAccess(partUsage);

        if (request.getTechnicianId() != null) {
            Technician technician = resolveTechnicianForEntry(workOrder, request.getTechnicianId(), "part usage");
            partUsage.setTechnician(technician);
        }
        if (request.getPartName() != null) {
            partUsage.setPartName(trimToNull(request.getPartName()));
        }
        if (request.getQuantity() != null) {
            partUsage.setQuantity(request.getQuantity());
        }
        if (request.getUnit() != null) {
            partUsage.setUnit(trimToNull(request.getUnit()));
        }
        if (request.getNotes() != null) {
            partUsage.setNotes(trimToNull(request.getNotes()));
        }

        validatePartUsage(partUsage);
        return mapPartUsageToResponse(partUsageRepository.save(partUsage));
    }

    @Override
    @Transactional
    public void deletePartUsage(Long workOrderId, Long partUsageId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + workOrderId));
        enforceWorkOrderAccess(workOrder);
        PartUsage partUsage = partUsageRepository.findById(partUsageId)
                .orElseThrow(() -> new IllegalArgumentException("Part usage not found with id: " + partUsageId));
        if (!Objects.equals(partUsage.getWorkOrder().getId(), workOrderId)) {
            throw new IllegalArgumentException("Part usage does not belong to this work order");
        }
        enforcePartUsageAccess(partUsage);
        partUsageRepository.delete(partUsage);
    }

    @Override
    @Transactional
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found with id: " + id));
        enforceWorkOrderOwnership(workOrder);
        workOrderRepository.deleteById(id);
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

    private void enforceWorkOrderOwnership(WorkOrder workOrder) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null) {
            return;
        }
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (workOrder.getCustomer() == null) {
                return;
            }
            enforceCustomerOwnership(workOrder.getCustomer());
            return;
        }
        if (currentUser.getRole() == Role.TECHNICIAN) {
            Technician currentTechnician = resolveCurrentTechnician();
            if (currentTechnician == null) {
                throw new AccessDeniedException("Technician profile is required");
            }
            if (workOrder.getAssignedTechnician() == null
                    || !Objects.equals(workOrder.getAssignedTechnician().getId(), currentTechnician.getId())) {
                throw new AccessDeniedException("You are not assigned to this work order");
            }
        }
    }

    private void enforceWorkOrderAccess(WorkOrder workOrder) {
        enforceWorkOrderOwnership(workOrder);
    }

    private void enforceTimeLogAccess(TimeLog timeLog) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null || currentUser.getRole() == Role.MANAGER || currentUser.getRole() == Role.DISPATCHER) {
            return;
        }
        if (currentUser.getRole() == Role.CUSTOMER) {
            throw new AccessDeniedException("You are not allowed to access this time log");
        }
        Technician currentTechnician = resolveCurrentTechnician();
        if (currentTechnician == null || timeLog.getTechnician() == null
                || !Objects.equals(timeLog.getTechnician().getId(), currentTechnician.getId())) {
            throw new AccessDeniedException("You are not allowed to modify this technician time log");
        }
    }

    private void enforcePartUsageAccess(PartUsage partUsage) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null || currentUser.getRole() == Role.MANAGER || currentUser.getRole() == Role.DISPATCHER) {
            return;
        }
        if (currentUser.getRole() == Role.CUSTOMER) {
            throw new AccessDeniedException("You are not allowed to access this part usage");
        }
        Technician currentTechnician = resolveCurrentTechnician();
        if (currentTechnician == null || partUsage.getTechnician() == null
                || !Objects.equals(partUsage.getTechnician().getId(), currentTechnician.getId())) {
            throw new AccessDeniedException("You are not allowed to modify this technician part usage");
        }
    }

    private Technician resolveCurrentTechnician() {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null || currentUser.getRole() != Role.TECHNICIAN) {
            return null;
        }
        return technicianRepository.findByUserId(currentUser.getId()).orElse(null);
    }

    private Technician resolveTechnicianForEntry(WorkOrder workOrder, Long requestedTechnicianId, String recordType) {
        UserAuth currentUser = getCurrentUserIfPresent();
        if (currentUser == null) {
            if (requestedTechnicianId == null && workOrder.getAssignedTechnician() != null) {
                return workOrder.getAssignedTechnician();
            }
            throw new IllegalArgumentException("Authenticated technician is required for " + recordType);
        }

        if (currentUser.getRole() == Role.TECHNICIAN) {
            Technician currentTechnician = resolveCurrentTechnician();
            if (currentTechnician == null) {
                throw new IllegalArgumentException("Technician profile is required for " + recordType);
            }
            if (requestedTechnicianId != null && !Objects.equals(requestedTechnicianId, currentTechnician.getId())) {
                throw new IllegalArgumentException("Technician id does not match the authenticated technician");
            }
            if (workOrder.getAssignedTechnician() == null
                    || !Objects.equals(workOrder.getAssignedTechnician().getId(), currentTechnician.getId())) {
                throw new AccessDeniedException("You are not assigned to this work order");
            }
            return currentTechnician;
        }

        if (requestedTechnicianId != null) {
            Technician technician = technicianRepository.findById(requestedTechnicianId)
                    .orElseThrow(() -> new IllegalArgumentException("Technician not found with id: " + requestedTechnicianId));
            if (workOrder.getAssignedTechnician() != null
                    && !Objects.equals(workOrder.getAssignedTechnician().getId(), technician.getId())) {
                throw new IllegalArgumentException("Technician is not assigned to this work order");
            }
            return technician;
        }

        if (workOrder.getAssignedTechnician() != null) {
            return workOrder.getAssignedTechnician();
        }

        throw new IllegalArgumentException("Technician is required for this " + recordType);
    }

    private void validateTimeLogRequest(TimeLogCreateRequestDTO request) {
        if (request.getStartedAt() == null && request.getEndedAt() == null && request.getHours() == null) {
            throw new IllegalArgumentException("At least one of start time, end time, or hours is required");
        }
        if (request.getStartedAt() != null && request.getEndedAt() != null && request.getEndedAt().isBefore(request.getStartedAt())) {
            throw new IllegalArgumentException("End time must be after the start time");
        }
        if (request.getHours() != null && request.getHours().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hours must be greater than zero");
        }
    }

    private void validateTimeLog(TimeLog timeLog) {
        if (timeLog.getWorkOrder() == null || timeLog.getWorkOrder().getId() == null) {
            throw new IllegalArgumentException("Work order is required");
        }
        if (timeLog.getTechnician() == null || timeLog.getTechnician().getId() == null) {
            throw new IllegalArgumentException("Technician is required for this time log");
        }
        if (timeLog.getStartedAt() == null && timeLog.getEndedAt() == null && timeLog.getHours() == null) {
            throw new IllegalArgumentException("At least one of start time, end time, or hours is required");
        }
        if (timeLog.getStartedAt() != null && timeLog.getEndedAt() != null && timeLog.getEndedAt().isBefore(timeLog.getStartedAt())) {
            throw new IllegalArgumentException("End time must be after the start time");
        }
        if (timeLog.getHours() != null && timeLog.getHours().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hours must be greater than zero");
        }
    }

    private void validatePartUsageRequest(PartUsageCreateRequestDTO request) {
        if (isBlank(request.getPartName())) {
            throw new IllegalArgumentException("Part name is required");
        }
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Part quantity must be greater than zero");
        }
    }

    private void validatePartUsage(PartUsage partUsage) {
        if (partUsage.getWorkOrder() == null || partUsage.getWorkOrder().getId() == null) {
            throw new IllegalArgumentException("Work order is required");
        }
        if (partUsage.getTechnician() == null || partUsage.getTechnician().getId() == null) {
            throw new IllegalArgumentException("Technician is required for this part usage");
        }
        if (isBlank(partUsage.getPartName())) {
            throw new IllegalArgumentException("Part name is required");
        }
        if (partUsage.getQuantity() == null || partUsage.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Part quantity must be greater than zero");
        }
    }

    private BigDecimal resolveHours(LocalDateTime startedAt, LocalDateTime endedAt, BigDecimal suppliedHours) {
        if (suppliedHours != null) {
            return suppliedHours;
        }
        if (startedAt == null || endedAt == null) {
            return null;
        }
        if (endedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException("End time must be after the start time");
        }
        long minutes = Duration.between(startedAt, endedAt).toMinutes();
        if (minutes <= 0) {
            return null;
        }
        return BigDecimal.valueOf(minutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private TimeLogResponseDTO mapTimeLogToResponse(TimeLog timeLog) {
        return TimeLogResponseDTO.builder()
                .id(timeLog.getId())
                .workOrderId(timeLog.getWorkOrder() != null ? timeLog.getWorkOrder().getId() : null)
                .technicianId(timeLog.getTechnician() != null ? timeLog.getTechnician().getId() : null)
                .startedAt(timeLog.getStartedAt())
                .endedAt(timeLog.getEndedAt())
                .hours(timeLog.getHours())
                .note(timeLog.getNote())
                .createdAt(timeLog.getCreatedAt())
                .updatedAt(timeLog.getUpdatedAt())
                .build();
    }

    private PartUsageResponseDTO mapPartUsageToResponse(PartUsage partUsage) {
        return PartUsageResponseDTO.builder()
                .id(partUsage.getId())
                .workOrderId(partUsage.getWorkOrder() != null ? partUsage.getWorkOrder().getId() : null)
                .technicianId(partUsage.getTechnician() != null ? partUsage.getTechnician().getId() : null)
                .partName(partUsage.getPartName())
                .quantity(partUsage.getQuantity())
                .unit(partUsage.getUnit())
                .notes(partUsage.getNotes())
                .createdAt(partUsage.getCreatedAt())
                .updatedAt(partUsage.getUpdatedAt())
                .build();
    }

    private WorkOrderResponseDTO mapToResponse(WorkOrder workOrder) {
        return WorkOrderResponseDTO.builder()
                .id(workOrder.getId())
                .title(workOrder.getTitle())
                .description(workOrder.getDescription())
                .customerId(workOrder.getCustomer() != null ? workOrder.getCustomer().getId() : null)
                .siteId(workOrder.getSite() != null ? workOrder.getSite().getId() : null)
                .assignedTechnicianId(workOrder.getAssignedTechnician() != null ? workOrder.getAssignedTechnician().getId() : null)
                .serviceType(workOrder.getServiceType())
                .priority(workOrder.getPriority())
                .status(workOrder.getStatus())
                .scheduledDate(workOrder.getScheduledDate())
                .createdAt(workOrder.getCreatedAt())
                .updatedAt(workOrder.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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

    private void validateCreateRequest(WorkOrderCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Work order request is required");
        }
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer id is required");
        }
        if (request.getSiteId() == null) {
            throw new IllegalArgumentException("Site id is required");
        }
        if (isBlank(request.getTitle())) {
            throw new IllegalArgumentException("Title is required");
        }
        if (isBlank(request.getDescription())) {
            throw new IllegalArgumentException("Description is required");
        }
        if (isBlank(request.getServiceType())) {
            throw new IllegalArgumentException("Service type is required");
        }
        if (request.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }
    }

    private void validateWorkOrder(WorkOrder workOrder) {
        if (isBlank(workOrder.getTitle())) {
            throw new IllegalArgumentException("Title is required");
        }
        if (isBlank(workOrder.getDescription())) {
            throw new IllegalArgumentException("Description is required");
        }
        if (workOrder.getCustomer() == null || workOrder.getCustomer().getId() == null) {
            throw new IllegalArgumentException("Customer is required");
        }
        if (workOrder.getSite() == null || workOrder.getSite().getId() == null) {
            throw new IllegalArgumentException("Site is required");
        }
        if (!workOrder.getSite().getCustomer().getId().equals(workOrder.getCustomer().getId())) {
            throw new IllegalArgumentException("Site does not belong to the selected customer");
        }
        if (isBlank(workOrder.getServiceType())) {
            throw new IllegalArgumentException("Service type is required");
        }
        if (workOrder.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (workOrder.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
