package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.KeyStone.FieldServiceProject.Entity.Site;

public interface SiteRepository extends JpaRepository<Site, Long> {

    List<Site> findByCustomerId(Long customerId);

    List<Site> findByCustomerIdOrderBySiteNameAsc(Long customerId);

    @Query("SELECT s FROM Site s WHERE " +
            "LOWER(s.siteName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.state) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.addressLine1) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Site> searchByNameOrLocation(@Param("query") String query);

    boolean existsByCustomerId(Long customerId);
}
