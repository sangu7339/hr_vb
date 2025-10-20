package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType; // enum: SICK, CASUAL

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private long days;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_status", nullable = false)
    private LeaveStatus leaveStatus;

    @Column(nullable = false)
    private LocalDate appliedOn;

    @Column(length = 500)
    private String reason;

    // ✅ New fields for HR approval
    @Column(name = "approved_by_hr")
    private String approvedByHr;

    @Column(name = "approved_on")
    private LocalDate approvedOn;

    public enum LeaveType {
        SICK,
        CASUAL
    }

    public enum LeaveStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @PrePersist
    @PreUpdate
    public void calculateDays() {
        if (startDate != null && endDate != null) {
            this.days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        if (appliedOn == null) {
            appliedOn = LocalDate.now();
        }
    }
}

