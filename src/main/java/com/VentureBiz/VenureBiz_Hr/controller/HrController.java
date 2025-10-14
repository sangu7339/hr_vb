package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.EmployeeRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
public class HrController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Get all employees
    @GetMapping("/employees")
    @PreAuthorize("hasRole('HR')")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // ✅ Add new employee (POST)
    @PostMapping("/employees")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<?> addEmployee(@RequestBody Employee employee) {

        User user = resolveUser(employee.getUser());
        if (employeeRepository.findByUser_Email(user.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("⚠️ Employee already exists for user: " + user.getEmail());
        }

        employee.setUser(user);
        Employee saved = employeeRepository.save(employee);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/employees/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee updated) {

        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        // Update employee details
        existing.setEmployeeId(updated.getEmployeeId());
        existing.setName(updated.getName());
        existing.setDepartment(updated.getDepartment());
        existing.setDeptRole(updated.getDeptRole());
        existing.setStatus(updated.getStatus());

        if (updated.getUser() != null) {
            String email = updated.getUser().getEmail();

            // Fetch user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            // Update password if provided
            if (updated.getUser().getPassword() != null && !updated.getUser().getPassword().isBlank()) {
                String encodedPassword = passwordEncoder.encode(updated.getUser().getPassword());
                user.setPassword(encodedPassword);
                userRepository.save(user);
            }

            // Link user
            existing.setUser(user);
        }

        Employee saved = employeeRepository.save(existing);
        return ResponseEntity.ok(saved);
    }


    // ✅ Delete employee
    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.status(404).body("❌ Employee not found with ID: " + id);
        }

        employeeRepository.deleteById(id);
        return ResponseEntity.ok("✅ Employee deleted successfully");
    }

    // =========================
    // Helper method to resolve User by id or email
    // =========================
    private User resolveUser(User userInput) {
        if (userInput == null) {
            throw new RuntimeException("User information must be provided");
        }

        if (userInput.getId() != null) {
            return userRepository.findById(userInput.getId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userInput.getId()));
        } else if (userInput.getEmail() != null) {
            return userRepository.findByEmail(userInput.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userInput.getEmail()));
        } else {
            throw new RuntimeException("User id or email must be provided");
        }
    }
}
