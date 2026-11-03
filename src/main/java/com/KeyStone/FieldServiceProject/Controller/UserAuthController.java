package com.KeyStone.FieldServiceProject.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeyStone.FieldServiceProject.DTO.AuthResponseDTO;
import com.KeyStone.FieldServiceProject.DTO.CreateUserRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.LoginRequestDTO;
import com.KeyStone.FieldServiceProject.DTO.RegisterRequestDTO;
import com.KeyStone.FieldServiceProject.Service.UserAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user_auth")
public class UserAuthController {

    private final UserAuthService userAuthService;

    public UserAuthController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequestDTO register) {
        return ResponseEntity.ok(userAuthService.register(register));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<String> createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAuthService.createUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO login) {
        return ResponseEntity.ok(userAuthService.login(login));
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<String> forgotPassword(@RequestParam String userEmail) {
        userAuthService.forgotPassword(userEmail);
        return ResponseEntity.ok("reset mail sent on your Email");
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        userAuthService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping({"/logout", "/loggedOut"})
    public ResponseEntity<String> loggedOut(HttpServletRequest request) {
        return ResponseEntity.ok(userAuthService.logout(request));
    }
}
