package com.banking.userService.repository;

import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IUserInfoRepository extends JpaRepository<UserInfo, Long> {
    boolean existsByCitizenId(String citizenId);
    UserInfo findByUser(User user);
}
