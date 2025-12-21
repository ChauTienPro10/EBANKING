package com.banking.userService.repository;

import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    boolean existsByUsername(String username);

    User findByUserInfo(UserInfo userInfo);
    
    /**
     * Find user by citizenId
     * Used for eKYC duplicate validation
     */
    User findByUserInfo_CitizenId(String citizenId);
}
