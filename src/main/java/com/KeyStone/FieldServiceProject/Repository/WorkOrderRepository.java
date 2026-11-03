package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.KeyStone.FieldServiceProject.ENUM.WorkOrderPriority;
import com.KeyStone.FieldServiceProject.ENUM.WorkOrderStatus;
import com.KeyStone.FieldServiceProject.Entity.WorkOrder;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<WorkOrder> findBySiteIdOrderByCreatedAtDesc(Long siteId);

    List<WorkOrder> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);

    List<WorkOrder> findByStatusOrderByCreatedAtDesc(WorkOrderStatus status);

    List<WorkOrder> findByPriorityOrderByCreatedAtDesc(WorkOrderPriority priority);

    @Query("SELECT w FROM WorkOrder w WHERE " +
            "(:customerId IS NULL OR w.customer.id = :customerId) AND " +
            "(:siteId IS NULL OR w.site.id = :siteId) AND " +
            "(:technicianId IS NULL OR w.assignedTechnician.id = :technicianId) AND " +
            "(:status IS NULL OR w.status = :status) AND " +
            "(:priority IS NULL OR w.priority = :priority)")
    List<WorkOrder> filterWorkOrders(
            @Param("customerId") Long customerId,
            @Param("siteId") Long siteId,
            @Param("technicianId") Long technicianId,
            @Param("status") WorkOrderStatus status,
            @Param("priority") WorkOrderPriority priority);
}
