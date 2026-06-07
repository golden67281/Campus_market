package com.campusmarket.server.security;

import com.campusmarket.server.model.User;
import com.campusmarket.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new UsernameNotFoundException("User account is inactive.");
        }
        
        return UserPrincipal.create(user);
    }

    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        
        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new UsernameNotFoundException("User account is inactive.");
        }
        
        return UserPrincipal.create(user);
    }
}
