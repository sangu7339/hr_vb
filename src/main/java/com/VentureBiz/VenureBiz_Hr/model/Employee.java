package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;

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

    // ✅ Unique String Employee ID (like EMP001)
    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    private String department;

    @Column(name = "dept_role")
    private String deptRole;

    @Enumerated(EnumType.STRING)
    private Status status;

    // ✅ Link Employee to User via email (not user_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)
    private User user;
}
