
package com.KeyStone.FieldServiceProject.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.KeyStone.FieldServiceProject.DTO.AuthResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.CreateUserRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.LoginRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.RegisterRequestDTO;
import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;
import com.KeyStone.FieldServiceProject.Security.EmailLogService;
import com.KeyStone.FieldServiceProject.Security.JWTUtil;
import com.KeyStone.FieldServiceProject.Security.TokenBlockService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserAuthService {

    @Autowired
    private UserAuthRepository userAuthRepo;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncode;

    @Autowired
    private EmailLogService emailLogService;

    @Autowired
    private TokenBlockService tokenBlockService;

    // Public registration is intentionally limited to customer accounts.
    public String register(RegisterRequestDTO register) {

        return createUser(register.userName, register.userEmail, register.password, register.phone, Role.CUSTOMER);
    }

    // Only a manager can reach this method through the protected controller endpoint.
    public String createUser(CreateUserRequestDTO request) {

        return createUser(request.userName, request.userEmail, request.password, request.phone, request.role);
    }

    private String createUser(String userName, String userEmail, String password, String phone, Role role) {

        Optional<UserAuth> existingUser =
                userAuthRepo.findByUserEmail(userEmail);

        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }

        UserAuth user = new UserAuth();

        user.setUserName(userName);
        user.setUserEmail(userEmail);
        user.setPassword(passwordEncode.encode(password));
        user.setPhone(phone);
        user.setRole(role);

        userAuthRepo.save(user);

        return "User registered successfully";
    }

    // Login User
    public AuthResponseDTO login(LoginRequestDTO login) {

        UserAuth user = userAuthRepo
                .findByUserEmail(login.userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncode.matches(
                login.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponseDTO(
                token, "Login successfully");
    }

    // Forgot Password
    public void forgotPassword(String userEmail) {

        UserAuth user = userAuthRepo
                .findByUserEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(
                new Date(System.currentTimeMillis() + 10 * 60 * 1000L));

        userAuthRepo.save(user);

        emailLogService.sendResetPasswordEmail(userEmail, token);
    }

    // Reset Password
    public void resetPassword(String token, String newPassword) {

        UserAuth user = userAuthRepo
                .findByResetToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid token"));

        Date expiry = user.getResetTokenExpiry();

        if (expiry == null || expiry.before(new Date())) {
            throw new RuntimeException("Token expired or invalid");
        }

        user.setPassword(passwordEncode.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userAuthRepo.save(user);
    }

    // Logout User
    public String logout(HttpServletRequest request) {

        String header = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(header);

        if (token != null) {
            tokenBlockService.blockListToken(token);
        }

        return "Logged out successfully";
    }
}
