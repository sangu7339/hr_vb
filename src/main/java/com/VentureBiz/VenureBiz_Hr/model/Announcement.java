package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message; // use 'message' instead of 'content'

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy; // HR who created the announcement

    @Column(nullable = false)
    private LocalDateTime createdAt; // timestamp for creation
}
