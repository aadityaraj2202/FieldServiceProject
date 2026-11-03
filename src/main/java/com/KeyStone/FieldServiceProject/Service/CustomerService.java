package com.KeyStone.FieldServiceProject.Service;

import java.util.List;

import com.KeyStone.FieldServiceProject.DTO.CustomerCreateRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.CustomerResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.CustomerUpdateRequestDTO;

public interface CustomerService {

    CustomerResponseDTO createCustomer(CustomerCreateRequestDTO request);

    CustomerResponseDTO getCustomerById(Long id);

    List<CustomerResponseDTO> getAllCustomers();

    List<CustomerResponseDTO> searchCustomers(String query);

    CustomerResponseDTO updateCustomer(Long id, CustomerUpdateRequestDTO request);

    void deleteCustomer(Long id);
}
