package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.model.Role;
import com.VentureBiz.VenureBiz_Hr.model.Status;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.EmployeeRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import com.VentureBiz.VenureBiz_Hr.security.JwtService;
import lombok.RequiredArgsConstructor;
import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.EmployeeRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class AuthController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository; // ✅ inject this
    private final AuthenticationManager authManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        try {
            // Check if username/email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Email already exists"));
            }

            // Encode password and save user
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }



    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) {
        // Authenticate user
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail(), "ROLE_" + user.getRole().name());

        // If role is EMPLOYEE, check status and include employeeCode
        if (user.getRole() == Role.EMPLOYEE) {
            Employee employee = employeeRepository.findByUser_Email(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (employee.getStatus() != Status.ACTIVE) {
                throw new RuntimeException("Your account is not active. Please contact HR.");
            }

            // Return token, role, and employeeCode only for EMPLOYEE
            return Map.of(
                    "token", token,
                    "role", user.getRole().name(),
                    "employeeCode", employee.getEmployeeId()
            );
        }

        // For HR or other roles, return only token and role
        return Map.of(
                "token", token,
                "role", user.getRole().name()
        );
    }

}


