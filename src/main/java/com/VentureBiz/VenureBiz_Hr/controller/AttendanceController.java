package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Attendance;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.AttendanceRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // --- TIME RULES (customize as needed) ---
    private static final LocalTime CHECKIN_ON_TIME = LocalTime.of(9, 50);
    private static final LocalTime LATE_LIMIT = LocalTime.of(11, 0);
    private static final LocalTime HALF_DAY_LIMIT = LocalTime.of(12, 0);
    private static final LocalTime ABSENT_LIMIT = LocalTime.of(14, 0);
    private static final LocalTime CHECKOUT_FULL_DAY = LocalTime.of(18, 0);

    // ✅ 1. EMPLOYEE — Check-In
    @PostMapping("/checkin")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String checkIn(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);

        if (existing.isPresent()) {
            return "Already checked in today!";
        }

        LocalTime now = LocalTime.now();

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setDate(today);
        attendance.setCheckInTime(now);
        attendance.setStatus("PENDING"); // temporary until checkout
        attendanceRepository.save(attendance);

        return "Checked in successfully at " + now;
    }

    // ✅ 2. EMPLOYEE — Check-Out (FINAL STATUS DECISION HERE)
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public String checkOut(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElseThrow(() -> new RuntimeException("No check-in record found!"));

        if (attendance.getCheckOutTime() != null) {
            return "Already checked out!";
        }

        LocalTime checkIn = attendance.getCheckInTime();
        LocalTime checkOut = LocalTime.now();
        attendance.setCheckOutTime(checkOut);

        String status = determineFinalStatus(checkIn, checkOut);
        attendance.setStatus(status);
        attendanceRepository.save(attendance);

        return "Checked out at " + checkOut + " (" + status + ")";
    }

    // ✅ FINAL STATUS LOGIC (based on both IN & OUT)
    private String determineFinalStatus(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn == null) {
            return "ABSENT"; // no check-in
        }

        // 1. Checked in too late → ABSENT
        if (checkIn.isAfter(ABSENT_LIMIT)) {
            return "ABSENT";
        }

        // 2. Left before 6:00 PM → HALF_DAY
        if (checkOut.isBefore(CHECKOUT_FULL_DAY)) {
            return "HALF_DAY";
        }

        // 3. Late check-in (after 12:00 but before 2:00) → HALF_DAY
        if (checkIn.isAfter(HALF_DAY_LIMIT) && checkIn.isBefore(ABSENT_LIMIT)) {
            return "HALF_DAY";
        }

        // 4. Late arrival (between 9:50 and 11:00) → LATE
        if (checkIn.isAfter(CHECKIN_ON_TIME) && checkIn.isBefore(LATE_LIMIT)) {
            return "LATE";
        }

        // 5. On time (≤ 9:50) → PRESENT
        if (checkIn.isBefore(CHECKIN_ON_TIME) || checkIn.equals(CHECKIN_ON_TIME)) {
            return "PRESENT";
        }

        // 6. Default (not checked out yet, or unknown)
        return "PENDING";
    }

    // ✅ 3. EMPLOYEE — View My Attendance
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<Attendance> getMyAttendance(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return attendanceRepository.findByUser(user);
    }

    // ✅ 4. EMPLOYEE — View Monthly Attendance
    @GetMapping("/my/month")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<Attendance> getMyAttendanceByMonth(
            @RequestParam String email,
            @RequestParam int year,
            @RequestParam int month) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return attendanceRepository.findByUserAndMonth(user, year, month);
    }

    // ✅ 5. HR — View All Attendance
    @GetMapping("/all")
    @PreAuthorize("hasRole('HR')")
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // ✅ 6. HR — View Attendance by Month/Year
    @GetMapping("/all/month")
    @PreAuthorize("hasRole('HR')")
    public List<Attendance> getAllByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return attendanceRepository.findByMonth(year, month);
    }

    // ✅ 7. HR — Edit Attendance
    @PutMapping("/{id}/edit")
    @PreAuthorize("hasRole('HR')")
    public Attendance editAttendance(@PathVariable Long id, @RequestBody Attendance updated) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found!"));

        existing.setStatus(updated.getStatus());
        existing.setCheckInTime(updated.getCheckInTime());
        existing.setCheckOutTime(updated.getCheckOutTime());
        existing.setReason(updated.getReason());
        return attendanceRepository.save(existing);
    }

    // ✅ 8. HR — Delete Attendance
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public String deleteAttendance(@PathVariable Long id) {
        attendanceRepository.deleteById(id);
        return "Attendance record deleted successfully.";
    }
}
