package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.LeaveRequest;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.LeaveRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class LeaveController {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    // Employee applies for leave
    @PostMapping("/apply")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leaveRequest, @RequestParam String email) {
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        if (days > 3) {
            throw new RuntimeException("Leave cannot be more than 3 days");
        }

        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveStatus(LeaveRequest.LeaveStatus.PENDING);
        leaveRequest.setDays(days);
        leaveRequest.setAppliedOn(LocalDate.now());

        return leaveRepository.save(leaveRequest);
    }

    // Employee views their leaves
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<LeaveRequest> myLeaves(@RequestParam String email) {
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return leaveRepository.findByEmployee(employee);
    }

    // Employee edits leave (only pending)
    @PutMapping("/{id}/edit")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public LeaveRequest editLeave(@PathVariable Long id, @RequestBody LeaveRequest updatedLeave, @RequestParam String email) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (!leave.getEmployee().getEmail().equals(email)) {
            throw new RuntimeException("You can only edit your own leave");
        }
        if (leave.getLeaveStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leaves can be edited");
        }

        long days = ChronoUnit.DAYS.between(updatedLeave.getStartDate(), updatedLeave.getEndDate()) + 1;
        if (days > 3) {
            throw new RuntimeException("Leave cannot be more than 3 days");
        }

        leave.setLeaveType(updatedLeave.getLeaveType());
        leave.setStartDate(updatedLeave.getStartDate());
        leave.setEndDate(updatedLeave.getEndDate());
        leave.setDays(days);
        leave.setReason(updatedLeave.getReason());

        return leaveRepository.save(leave);
    }

    // Employee deletes leave (only pending)
    @DeleteMapping("/{id}/delete")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String deleteLeave(@PathVariable Long id, @RequestParam String email) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (!leave.getEmployee().getEmail().equals(email)) {
            throw new RuntimeException("You can only delete your own leave");
        }
        if (leave.getLeaveStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leaves can be deleted");
        }

        leaveRepository.delete(leave);
        return "Leave deleted successfully";
    }

    // HR views all leaves
//    @GetMapping("/all")
//    @PreAuthorize("hasRole('HR')")
//    public List<LeaveRequest> allLeaves() {
//        return leaveRepository.findAll();
//    }
  

    // HR updates leave status (approve/reject)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public LeaveRequest updateLeaveStatus(@PathVariable Long id, @RequestParam LeaveRequest.LeaveStatus leaveStatus) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (leave.getLeaveStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leaves can be updated");
        }

        leave.setLeaveStatus(leaveStatus); // APPROVED or REJECTED
        return leaveRepository.save(leave);
    }
}
