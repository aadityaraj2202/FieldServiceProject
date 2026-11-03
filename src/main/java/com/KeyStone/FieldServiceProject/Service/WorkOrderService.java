package com.KeyStone.FieldServiceProject.Service;

import java.util.List;

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
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;

public interface WorkOrderService {

    WorkOrderResponseDTO createWorkOrder(WorkOrderCreateRequestDTO request);

    List<WorkOrderResponseDTO> getAllWorkOrders();

    WorkOrderResponseDTO getWorkOrderById(Long id);

    List<WorkOrderResponseDTO> getWorkOrdersByCustomer(Long customerId);

    List<WorkOrderResponseDTO> getWorkOrdersBySite(Long siteId);

    List<WorkOrderResponseDTO> getWorkOrdersByTechnician(Long technicianId);

    List<WorkOrderResponseDTO> filterWorkOrders(Long customerId, Long siteId, Long technicianId,
            WorkOrderStatus status, WorkOrderPriority priority);

    WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderUpdateRequestDTO request);

    WorkOrderResponseDTO updateStatus(Long id, WorkOrderStatusUpdateRequestDTO request);

    WorkOrderResponseDTO assignTechnician(Long workOrderId, Long technicianId);

    TimeLogResponseDTO createTimeLog(Long workOrderId, TimeLogCreateRequestDTO request);

    List<TimeLogResponseDTO> getTimeLogsByWorkOrder(Long workOrderId);

    TimeLogResponseDTO updateTimeLog(Long workOrderId, Long timeLogId, TimeLogUpdateRequestDTO request);

    void deleteTimeLog(Long workOrderId, Long timeLogId);

    PartUsageResponseDTO createPartUsage(Long workOrderId, PartUsageCreateRequestDTO request);

    List<PartUsageResponseDTO> getPartUsagesByWorkOrder(Long workOrderId);

    PartUsageResponseDTO updatePartUsage(Long workOrderId, Long partUsageId, PartUsageUpdateRequestDTO request);

    void deletePartUsage(Long workOrderId, Long partUsageId);

    void deleteWorkOrder(Long id);
}
