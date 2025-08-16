package com.banking.userService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_info")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserInfo {

    @Id
    @GeneratedValue
    private Long id;

    private String fullName;

    @Column(nullable = false, unique = true)
    private String citizenId;

    private Long birthday;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    private Boolean isMale;

    private String address;

    private Long createAt;

    private Long updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
