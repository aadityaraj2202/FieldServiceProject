package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.KeyStone.FieldServiceProject.Entity.TimeLog;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByWorkOrderIdOrderByStartedAtDesc(Long workOrderId);
}
