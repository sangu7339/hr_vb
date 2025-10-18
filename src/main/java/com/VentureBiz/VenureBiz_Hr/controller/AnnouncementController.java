package com.VentureBiz.VenureBiz_Hr.controller;

import com.VentureBiz.VenureBiz_Hr.model.Announcement;
import com.VentureBiz.VenureBiz_Hr.model.User;
import com.VentureBiz.VenureBiz_Hr.repository.AnnouncementRepository;
import com.VentureBiz.VenureBiz_Hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @PostMapping("/create")
    @PreAuthorize("hasRole('HR')")
    public Announcement createAnnouncement(@RequestBody Announcement announcement, 
                                           @RequestParam("hrEmail") String hrEmail) {
        User hr = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("HR not found"));

        announcement.setCreatedBy(hr);
        announcement.setCreatedAt(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }


    // ✅ Get all announcements (for employees and HR)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('HR','EMPLOYEE')")
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }
//    @GetMapping("/all")
//    public List<Announcement> getAllAnnouncements() {
//        return announcementRepository.findAllByOrderByCreatedAtDesc();
//    }



    // ✅ HR deletes announcement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public String deleteAnnouncement(@PathVariable Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcementRepository.delete(announcement);
        return "Announcement deleted successfully";
    }
}
