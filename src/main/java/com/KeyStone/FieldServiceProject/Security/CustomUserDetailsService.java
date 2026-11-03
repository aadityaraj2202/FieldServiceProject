package com.KeyStone.FieldServiceProject.Security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

@Deprecated
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAuthRepository userRepo;

    public CustomUserDetailsService(UserAuthRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String userEmail)
            throws UsernameNotFoundException {

        UserAuth user = userRepo.findByUserEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        String roleName = user.getRole() == null ? "CUSTOMER" : user.getRole().name();

        return User.builder()
                .username(user.getUserEmail())
                .password(user.getPassword())
                .authorities(List.of(
                        new SimpleGrantedAuthority("ROLE_" + roleName),
                        new SimpleGrantedAuthority(roleName)))
                .build();
    }
}
