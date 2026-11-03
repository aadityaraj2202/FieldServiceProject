package com.KeyStone.FieldServiceProject.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.KeyStone.FieldServiceProject.Entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByEmailIgnoreCase(String email);

    Optional<Customer> findByOwnerId(Long ownerId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByOwnerId(Long ownerId);

    List<Customer> findByOrganizationContainingIgnoreCase(String organization);

    List<Customer> findByContactNameContainingIgnoreCase(String contactName);

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.organization) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.contactName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchByOrganizationOrContactOrEmail(@Param("query") String query);
}
