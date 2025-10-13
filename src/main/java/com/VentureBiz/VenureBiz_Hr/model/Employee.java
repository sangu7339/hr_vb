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

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String department;

    // ✅ Make deptRole a simple String for flexibility
    @Column(name = "dept_role")
    private String deptRole;

    // ✅ Keep Status as an enum (this is fine)
    @Enumerated(EnumType.STRING)
    private Status status;

    // ✅ Use ManyToOne (many employees -> one user)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
