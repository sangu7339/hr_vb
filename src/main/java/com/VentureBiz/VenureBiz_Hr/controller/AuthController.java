package com.VentureBiz.VenureBiz_Hr.controller;
import com.VentureBiz.VenureBiz_Hr.model.Role;

import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import com.VentureBiz.VenureBiz_Hr.security.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174") // frontend
public class AuthController {

    private final UserRepository userRepository;
    private final AuthenticationManager authManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!";
    }

  

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),  // ✅ use email
                loginRequest.getPassword()
            )
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail(), "ROLE_" + user.getRole().name());

        return Map.of(
            "token", token,
            "role", user.getRole().name()
        );
    }

}
