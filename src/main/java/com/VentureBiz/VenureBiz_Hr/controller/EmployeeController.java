package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR')")
    public Employee getProfile(Authentication authentication) {
        String username = authentication.getName();
        return employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE','HR')")
    public Employee updateProfile(Authentication authentication, @RequestBody Employee updatedInfo) {
        String username = authentication.getName();
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        employee.setEmail(updatedInfo.getEmail());
        employee.setDepartment(updatedInfo.getDepartment());
        return employeeRepository.save(employee);
    }
}
