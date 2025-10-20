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

    private LocalDate payslipDate; // Date of salary generation
    private LocalDate paidDate;    // Date when salary is marked PAID

    @Enumerated(EnumType.STRING)
    private SalaryStatus status;

    private String bankName;
    private String accountNumber;

    // Helper method to calculate net pay
    public void calculateNetPay() {
        this.netPay = this.basicPay + this.hra + this.allowances - this.deductions;
    }
}