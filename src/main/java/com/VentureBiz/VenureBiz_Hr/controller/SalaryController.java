package com.VentureBiz.VenureBiz_Hr.controller;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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

    // ✅ Generate or update Salary for an Employee (HR only)
    @PostMapping("/generate")
    @PreAuthorize("hasRole('HR')")
    public Salary generateOrUpdateSalary(@RequestParam String employeeCode,
                                         @RequestParam int month,
                                         @RequestParam int year,
                                         @RequestParam double basicPay,
                                         @RequestParam double hra,
                                         @RequestParam double allowances,
                                         @RequestParam double deductions,
                                         @RequestParam String bankName,
                                         @RequestParam String accountNumber) {

        Employee employee = employeeRepository.findByEmployeeId(employeeCode)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee not found: " + employeeCode));

        Salary salary = salaryRepository.findByEmployeeAndMonthAndYear(employee, month, year)
                .orElse(Salary.builder().employee(employee).month(month).year(year).payslipDate(LocalDate.now()).status(SalaryStatus.PENDING).build());

        salary.setBasicPay(basicPay);
        salary.setHra(hra);
        salary.setAllowances(allowances);
        salary.setDeductions(deductions);
        salary.setNetPay(basicPay + hra + allowances - deductions);
        salary.setBankName(bankName);
        salary.setAccountNumber(accountNumber);
        if (salary.getPayslipDate() == null) salary.setPayslipDate(LocalDate.now());

        return salaryRepository.save(salary);
    }

    // ✅ HR — Mark Salary as Paid
    @PutMapping("/{salaryId}/pay")
    @PreAuthorize("hasRole('HR')")
    public Salary markPaid(@PathVariable Long salaryId) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new RuntimeException("Salary record not found"));
        salary.setStatus(SalaryStatus.PAID);
        salary.setPaidDate(LocalDate.now());
        return salaryRepository.save(salary);
    }

    // ✅ HR — Update Salary (anytime)
    @PutMapping("/{salaryId}/update")
    @PreAuthorize("hasRole('HR')")
    public Salary updateSalary(@PathVariable Long salaryId,
                               @RequestParam double basicPay,
                               @RequestParam double hra,
                               @RequestParam double allowances,
                               @RequestParam double deductions,
                               @RequestParam String bankName,
                               @RequestParam String accountNumber,
                               @RequestParam SalaryStatus status,
                               @RequestParam(required = false) LocalDate payslipDate,
                               @RequestParam(required = false) LocalDate paidDate) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new RuntimeException("Salary record not found"));

        salary.setBasicPay(basicPay);
        salary.setHra(hra);
        salary.setAllowances(allowances);
        salary.setDeductions(deductions);
        salary.setNetPay(basicPay + hra + allowances - deductions);
        salary.setBankName(bankName);
        salary.setAccountNumber(accountNumber);
        salary.setStatus(status);
        if (payslipDate != null) salary.setPayslipDate(payslipDate);
        if (paidDate != null) salary.setPaidDate(paidDate);

        return salaryRepository.save(salary);
    }

    // ✅ HR — Delete Salary Record
    @DeleteMapping("/{salaryId}")
    @PreAuthorize("hasRole('HR')")
    public void deleteSalary(@PathVariable Long salaryId) {
        Salary salary = salaryRepository.findById(salaryId)
                .orElseThrow(() -> new RuntimeException("Salary record not found"));
        salaryRepository.delete(salary);
    }

    // ✅ Employee — View Own Salary / Payslip
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
}