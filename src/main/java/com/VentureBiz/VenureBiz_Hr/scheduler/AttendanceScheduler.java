package com.VentureBiz.VenureBiz_Hr.scheduler;


import com.VentureBiz.VenureBiz_Hr.model.Attendance;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.AttendanceRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    /**
     * Runs every day at 10 PM to auto-update attendance
     */
    @Scheduled(cron = "0 0 22 * * *")
    public void markAbsenteesAndHalfDay() {
        LocalDate today = LocalDate.now();
        DayOfWeek day = today.getDayOfWeek();

        // Skip weekends
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) return;

        List<User> users = userRepository.findAll();

        for (User user : users) {
            Optional<Attendance> optionalAttendance = attendanceRepository.findByUserAndDate(user, today);

            if (optionalAttendance.isEmpty()) {
                // No check-in → mark ABSENT
                Attendance absent = new Attendance();
                absent.setUser(user);
                absent.setDate(today);
                absent.setStatus("ABSENT");
                attendanceRepository.save(absent);
            } else {
                Attendance attendance = optionalAttendance.get();
                if (attendance.getCheckOutTime() == null && "PENDING".equals(attendance.getStatus())) {
                    // Checked in but no checkout → mark HALF_DAY
                    attendance.setStatus("HALF_DAY");
                    attendanceRepository.save(attendance);
                }
            }
        }

        System.out.println("✅ Auto attendance update completed for " + today);
    }
}
