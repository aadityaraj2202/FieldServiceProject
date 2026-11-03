package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.KeyStone.FieldServiceProject.Entity.PartUsage;

public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {

    List<PartUsage> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
