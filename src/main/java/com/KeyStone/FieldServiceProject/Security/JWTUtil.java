package com.KeyStone.FieldServiceProject.Security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.KeyStone.FieldServiceProject.Entity.UserAuth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {
    private final Key key;
    private final long validTokenTime = 12 * 60 * 60 * 1000L;

    public JWTUtil(@Value("${jwt.secret:field-service-project-local-secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public JWTUtil() {
        this("field-service-project-local-secret");
    }

    public String generateToken(UserAuth user) {
        Map<String, Object> claims = new HashMap<>();
        String roleName = user.getRole() == null ? "CUSTOMER" : user.getRole().name();
        claims.put("role", roleName);

        Date now = new Date();
        Date expire = new Date(now.getTime() + validTokenTime);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUserEmail())
                .setIssuedAt(now)
                .setExpiration(expire)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getClaim(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUserEmail(String token) {
        return getClaim(token).getSubject();
    }

    public String extractToken(String header) {
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            return null;
        }
        return header.substring(7).trim();
    }
}
