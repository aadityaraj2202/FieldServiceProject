package com.KeyStone.FieldServiceProject.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.KeyStone.FieldServiceProject.ENUM.Role;
import com.KeyStone.FieldServiceProject.Entity.UserAuth;
import com.KeyStone.FieldServiceProject.Repository.UserAuthRepository;

/**
 * Creates a local manager only when the explicitly opt-in {@code dev} profile
 * and all bootstrap environment variables are present. No credentials are
 * stored in source control or used by non-development profiles.
 */
@Component
@Profile("dev")
public class DevelopmentManagerBootstrap implements CommandLineRunner {

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${keystone.bootstrap.manager.name:}")
    private String managerName;

    @Value("${keystone.bootstrap.manager.email:}")
    private String managerEmail;

    @Value("${keystone.bootstrap.manager.password:}")
    private String managerPassword;

    @Value("${keystone.bootstrap.manager.phone:}")
    private String managerPhone;

    public DevelopmentManagerBootstrap(UserAuthRepository userAuthRepository, PasswordEncoder passwordEncoder) {
        this.userAuthRepository = userAuthRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(managerName)
                || !StringUtils.hasText(managerEmail)
                || !StringUtils.hasText(managerPassword)) {
            return;
        }

        if (userAuthRepository.findByUserEmail(managerEmail).isPresent()) {
            return;
        }

        UserAuth manager = new UserAuth();
        manager.setUserName(managerName);
        manager.setUserEmail(managerEmail);
        manager.setPassword(passwordEncoder.encode(managerPassword));
        manager.setPhone(managerPhone);
        manager.setRole(Role.MANAGER);
        userAuthRepository.save(manager);
    }
}
