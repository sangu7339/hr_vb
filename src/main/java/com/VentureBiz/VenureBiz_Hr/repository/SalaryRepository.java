package com.VentureBiz.VenureBiz_Hr.repository;

import com.VentureBiz.VenureBiz_Hr.model.Employee;
import com.VentureBiz.VenureBiz_Hr.model.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findByEmployeeAndMonthAndYear(Employee employee, int month, int year);

    List<Salary> findByEmployee(Employee employee);

    List<Salary> findByMonthAndYear(int month, int year);
}
