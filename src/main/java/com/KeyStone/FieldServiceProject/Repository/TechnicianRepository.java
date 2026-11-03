package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.KeyStone.FieldServiceProject.Entity.Technician;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    Optional<Technician> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserId(Long userId);

    Optional<Technician> findByUserId(Long userId);

    @Query("SELECT DISTINCT t FROM Technician t LEFT JOIN t.skills s WHERE " +
            "LOWER(t.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Technician> searchByNameEmailOrSkill(@Param("query") String query);
}
