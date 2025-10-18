package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.model.Salary;
import com.VentureBiz.VenureBiz_Hr.model.SalaryStatus;
import com.VentureBiz.VenureBiz_Hr.repository.EmployeeRepository;
import com.VentureBiz.VenureBiz_Hr.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class SalaryController {

    private final EmployeeRepository employeeRepository;
    private final SalaryRepository salaryRepository;

    // ✅ Generate Salary for an Employee (HR only)
    @PostMapping("/generate")
    @PreAuthorize("hasRole('HR')")
    public Salary generateSalary(@RequestParam String employeeCode,
                                 @RequestParam int month,
                                 @RequestParam int year,
                                 @RequestParam double basicPay,
                                 @RequestParam double hra,
                                 @RequestParam double allowances,
                                 @RequestParam double deductions,
                                 @RequestParam String bankName,
                                 @RequestParam String accountNumber) {

        Employee employee = employeeRepository.findByEmployeeId(employeeCode)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        double netPay = basicPay + hra + allowances - deductions;

        // Check if salary already exists for this month
        salaryRepository.findByEmployeeAndMonthAndYear(employee, month, year)
                .ifPresent(s -> { throw new RuntimeException("Salary already generated for this month"); });

        Salary salary = Salary.builder()
                .employee(employee)
                .basicPay(basicPay)
                .hra(hra)
                .allowances(allowances)
                .deductions(deductions)
                .netPay(netPay)
                .month(month)
                .year(year)
                .payslipDate(LocalDate.now())
                .status(SalaryStatus.PENDING)
                .bankName(bankName)
                .accountNumber(accountNumber)
                .build();

        return salaryRepository.save(salary);
    }

    // ✅ HR — Approve / Mark Salary as Paid
    @PutMapping("/{salaryId}/pay")
    @PreAuthorize("hasRole('HR')")
    public Salary markPaid(@PathVariable Long salaryId) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new RuntimeException("Salary record not found"));

        salary.setStatus(SalaryStatus.PAID);
        return salaryRepository.save(salary);
    }

    // ✅ Employee — View Own Salary / Payslip
 // ✅ Employee — View Own Salary / Payslip using employee ID
//    @GetMapping("/my")
//    @PreAuthorize("hasRole('EMPLOYEE')")
//    public List<Salary> mySalary(@RequestParam Long employeeId) {
//        Employee employee = employeeRepository.findById(employeeId)
//                .orElseThrow(() -> new RuntimeException("Employee not found"));
//
//        return salaryRepository.findByEmployee(employee);
//    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<Salary> mySalary(@RequestParam String employeeCode) {
        Employee employee = employeeRepository.findByEmployeeId(employeeCode)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return salaryRepository.findByEmployee(employee);
    }

    // ✅ HR — View All Salaries for a Month
    @GetMapping("/all/month")
    @PreAuthorize("hasRole('HR')")
    public List<Salary> allSalariesByMonth(@RequestParam int month, @RequestParam int year) {
        return salaryRepository.findByMonthAndYear(month, year);
    }

    // ✅ HR — Apply Hike for Employee
    @PostMapping("/hike")
    @PreAuthorize("hasRole('HR')")
    public Salary applyHike(@RequestParam String employeeCode,
                            @RequestParam double newBasic,
                            @RequestParam double newHra,
                            @RequestParam double newAllowances,
                            @RequestParam double newDeductions,
                            @RequestParam int month,
                            @RequestParam int year,
                            @RequestParam String bankName,
                            @RequestParam String accountNumber) {

        Employee employee = employeeRepository.findByEmployeeId(employeeCode)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        double netPay = newBasic + newHra + newAllowances - newDeductions;

        Salary salary = Salary.builder()
                .employee(employee)
                .basicPay(newBasic)
                .hra(newHra)
                .allowances(newAllowances)
                .deductions(newDeductions)
                .netPay(netPay)
                .month(month)
                .year(year)
                .payslipDate(LocalDate.now())
                .status(SalaryStatus.PENDING)
                .bankName(bankName)
                .accountNumber(accountNumber)
                .build();

        return salaryRepository.save(salary);
    }
}
