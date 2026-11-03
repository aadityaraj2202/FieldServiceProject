package com.KeyStone.FieldServiceProject.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.FieldServiceProject.DTO.PartUsageCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.PartUsageResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.PartUsageUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.TimeLogUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderAssignTechnicianRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderStatusUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.WorkOrderUpdateRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;
import com.KeyStone.FieldServiceProject.Service.WorkOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<WorkOrderResponseDTO> createWorkOrder(@Valid @RequestBody WorkOrderCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createWorkOrder(request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<WorkOrderResponseDTO>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<WorkOrderResponseDTO>> getWorkOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByCustomer(customerId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @GetMapping("/site/{siteId}")
    public ResponseEntity<List<WorkOrderResponseDTO>> getWorkOrdersBySite(@PathVariable Long siteId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersBySite(siteId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<WorkOrderResponseDTO>> getWorkOrdersByTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByTechnician(technicianId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping("/filter")
    public ResponseEntity<List<WorkOrderResponseDTO>> filterWorkOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) WorkOrderPriority priority) {
        return ResponseEntity.ok(workOrderService.filterWorkOrders(customerId, siteId, technicianId, status, priority));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponseDTO> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/{id}")
    public ResponseEntity<WorkOrderResponseDTO> updateWorkOrder(@PathVariable Long id,
            @Valid @RequestBody WorkOrderUpdateRequestDTO request) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<WorkOrderResponseDTO> updateStatus(@PathVariable Long id,
            @Valid @RequestBody WorkOrderStatusUpdateRequestDTO request) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @PutMapping("/{id}/assign-technician")
    public ResponseEntity<WorkOrderResponseDTO> assignTechnician(@PathVariable Long id,
            @Valid @RequestBody WorkOrderAssignTechnicianRequestDTO request) {
        return ResponseEntity.ok(workOrderService.assignTechnician(id, request.getTechnicianId()));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @PostMapping("/{workOrderId}/time-logs")
    public ResponseEntity<TimeLogResponseDTO> createTimeLog(@PathVariable Long workOrderId,
            @Valid @RequestBody TimeLogCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createTimeLog(workOrderId, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping("/{workOrderId}/time-logs")
    public ResponseEntity<List<TimeLogResponseDTO>> getTimeLogsByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(workOrderService.getTimeLogsByWorkOrder(workOrderId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @PutMapping("/{workOrderId}/time-logs/{timeLogId}")
    public ResponseEntity<TimeLogResponseDTO> updateTimeLog(@PathVariable Long workOrderId,
            @PathVariable Long timeLogId,
            @Valid @RequestBody TimeLogUpdateRequestDTO request) {
        return ResponseEntity.ok(workOrderService.updateTimeLog(workOrderId, timeLogId, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @DeleteMapping("/{workOrderId}/time-logs/{timeLogId}")
    public ResponseEntity<Void> deleteTimeLog(@PathVariable Long workOrderId, @PathVariable Long timeLogId) {
        workOrderService.deleteTimeLog(workOrderId, timeLogId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @PostMapping("/{workOrderId}/part-usages")
    public ResponseEntity<PartUsageResponseDTO> createPartUsage(@PathVariable Long workOrderId,
            @Valid @RequestBody PartUsageCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createPartUsage(workOrderId, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    @GetMapping("/{workOrderId}/part-usages")
    public ResponseEntity<List<PartUsageResponseDTO>> getPartUsagesByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(workOrderService.getPartUsagesByWorkOrder(workOrderId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @PutMapping("/{workOrderId}/part-usages/{partUsageId}")
    public ResponseEntity<PartUsageResponseDTO> updatePartUsage(@PathVariable Long workOrderId,
            @PathVariable Long partUsageId,
            @Valid @RequestBody PartUsageUpdateRequestDTO request) {
        return ResponseEntity.ok(workOrderService.updatePartUsage(workOrderId, partUsageId, request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    @DeleteMapping("/{workOrderId}/part-usages/{partUsageId}")
    public ResponseEntity<Void> deletePartUsage(@PathVariable Long workOrderId, @PathVariable Long partUsageId) {
        workOrderService.deletePartUsage(workOrderId, partUsageId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.noContent().build();
    }
}
