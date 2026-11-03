package com.KeyStone.FieldServiceProject.Security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Date;

import org.junit.jupiter.api.Test;

import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;

class JwtSecurityAuthenticationTest {

    @Test
    void jwtUtilRejectsInvalidAndExpiredTokens() {
        JWTUtil jwtUtil = new JWTUtil("test-secret-key-1234567890-abcdef");

        UserAuth user = new UserAuth();
        user.setUserEmail("manager@keystone.test");
        user.setRole(Role.MANAGER);

        String token = jwtUtil.generateToken(user);
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertTrue(jwtUtil.extractToken("Bearer " + token).startsWith("eyJ"));

        String invalidToken = "not-a-valid.jwt-token";
        assertFalse(jwtUtil.validateToken(invalidToken));

        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .setSubject(user.getUserEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date(System.currentTimeMillis() - 60_000))
                .setExpiration(new Date(System.currentTimeMillis() - 5_000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor("test-secret-key-1234567890-abcdef".getBytes()), io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();

        assertFalse(jwtUtil.validateToken(expiredToken));
    }
}
