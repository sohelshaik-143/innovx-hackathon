package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.Role;
import com.innovx.nodues.domain.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByName(RoleType name);
}
