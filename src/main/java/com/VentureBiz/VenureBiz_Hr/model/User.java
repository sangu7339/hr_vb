
package com.VentureBiz.VenureBiz_Hr.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;  // keep username

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
