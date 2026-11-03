package com.KeyStone.FieldServiceProject.Controller;

import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;
import com.KeyStone.FieldServiceProject.Security.JWTUtil;

@SpringBootTest
@AutoConfigureMockMvc
class UserAuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAuthRepository userAuthRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTUtil jwtUtil;

    @AfterEach
    void clearUsers() {
        userAuthRepository.deleteAll();
    }

    @Test
    void publicRegistrationAlwaysCreatesCustomerAndHashesPassword() throws Exception {
        mockMvc.perform(post("/api/user_auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "userName": "New Customer",
                          "userEmail": "customer@keystone.test",
                          "password": "safe-password",
                          "phone": "1234567890",
                          "role": "MANAGER"
                        }
                        """))
                .andExpect(status().isOk());

        UserAuth user = userAuthRepository.findByUserEmail("customer@keystone.test").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(Role.CUSTOMER, user.getRole());
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("safe-password", user.getPassword()));
    }

    @Test
    void onlyManagersCanCreatePrivilegedUsers() throws Exception {
        mockMvc.perform(post("/api/user_auth/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"userName":"Dispatcher","userEmail":"dispatcher@keystone.test","password":"safe-password","role":"DISPATCHER"}
                        """))
                .andExpect(status().isForbidden());

        UserAuth manager = new UserAuth();
        manager.setUserName("Manager");
        manager.setUserEmail("manager@keystone.test");
        manager.setPassword(passwordEncoder.encode("safe-password"));
        manager.setRole(Role.MANAGER);
        userAuthRepository.save(manager);

        String token = jwtUtil.generateToken(manager);
        mockMvc.perform(post("/api/user_auth/users")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"userName":"Dispatcher","userEmail":"dispatcher@keystone.test","password":"safe-password","role":"DISPATCHER"}
                        """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/user_auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"userEmail":"dispatcher@keystone.test","password":"safe-password"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", equalTo("Login successfully")));
    }

    @Test
    void loggedOutJwtTokenIsRejectedByProtectedEndpoints() throws Exception {
        UserAuth manager = new UserAuth();
        manager.setUserName("Manager");
        manager.setUserEmail("manager@keystone.test");
        manager.setPassword(passwordEncoder.encode("safe-password"));
        manager.setRole(Role.MANAGER);
        userAuthRepository.save(manager);

        String token = jwtUtil.generateToken(manager);

        mockMvc.perform(post("/api/user_auth/logout")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/customers")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
