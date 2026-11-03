package com.KeyStone.FieldServiceProject.Security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final CustomUserDetailService customUserDetailsService;
    private final TokenBlockService tokenBlockService;

    public JwtAuthenticationFilter(JWTUtil jwtUtil, CustomUserDetailService customUserDetailsService,
            TokenBlockService tokenBlockService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
        this.tokenBlockService = tokenBlockService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws java.io.IOException, jakarta.servlet.ServletException {

        String header = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(header);

        if (token != null && tokenBlockService.isblockListToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Logged out");
            return;
        }

        if (token != null && jwtUtil.validateToken(token)) {
            String userEmail = jwtUtil.getUserEmail(token);
            UserDetails userDetail = customUserDetailsService.loadUserByUsername(userEmail);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetail, null, userDetail.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}

