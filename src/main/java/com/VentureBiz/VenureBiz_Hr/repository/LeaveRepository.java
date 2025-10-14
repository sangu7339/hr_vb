package com.VentureBiz.VenureBiz_Hr.repository;

import com.VentureBiz.VenureBiz_Hr.model.LeaveRequest;
import com.VentureBiz.VenureBiz_Hr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployee(User employee);
}
