package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "salaries")
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private double basicPay;
    private double hra;
    private double allowances;
    private double deductions;
    private double netPay;

    private int month;
    private int year;
    private LocalDate payslipDate;

    @Enumerated(EnumType.STRING)
    private SalaryStatus status;

    // ✅ Bank Details
    private String bankName;
    private String accountNumber;
}

