package com.innovx.nodues.security;

import com.innovx.nodues.domain.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String username;
    private final String email;
    private final String fullName;
    private final String password;
    private final boolean active;
    private final boolean demo;
    private final Collection<? extends GrantedAuthority> authorities;

    // Optional contextual mappings
    private final String studentId;        // If ROLE_STUDENT
    private final String departmentId;     // If ROLE_DEPARTMENT_STAFF or ROLE_DEPARTMENT_HEAD
    private final String departmentCode;
    private final boolean head;

    public UserPrincipal(User user, String studentId, String departmentId, String departmentCode, boolean head) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.password = user.getPasswordHash();
        this.active = user.isActive();
        this.demo = user.isDemo();
        this.authorities = user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                .collect(Collectors.toList());
        this.studentId = studentId;
        this.departmentId = departmentId;
        this.departmentCode = departmentCode;
        this.head = head;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
