package com.VentureBiz.VenureBiz_Hr.scheduler;

import com.VentureBiz.VenureBiz_Hr.model.Salary;
import com.VentureBiz.VenureBiz_Hr.model.SalaryStatus;
import com.VentureBiz.VenureBiz_Hr.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SalaryScheduler {

    private final SalaryRepository salaryRepository;

    // Runs every 1st of month at 1 AM
    @Scheduled(cron = "0 0 1 1 * *")
    public void updateMonthlySalaryStatus() {
        LocalDate today = LocalDate.now();
        int previousMonth = today.minusMonths(1).getMonthValue();
        int previousYear = today.minusMonths(1).getYear();

        // Update previous month's CURRENT → PENDING
        List<Salary> salaries = salaryRepository.findByMonthAndYear(previousMonth, previousYear);
        for (Salary salary : salaries) {
            if (salary.getStatus() == SalaryStatus.CURRENT) {
                salary.setStatus(SalaryStatus.PENDING);
            }
        }

        salaryRepository.saveAll(salaries);
    }
}
