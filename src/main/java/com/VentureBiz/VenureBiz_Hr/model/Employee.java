package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique Employee ID
    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    private String department;

    @Column(name = "dept_role")
    private String deptRole;

    // ✅ Date of Joining
    private LocalDate dateOfJoining;

    @Enumerated(EnumType.STRING)
    private Status status;

    // Link Employee to User via email
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)
    private User user;
}
