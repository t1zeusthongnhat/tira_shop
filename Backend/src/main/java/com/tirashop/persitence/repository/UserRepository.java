package com.tirashop.persitence.repository;

import com.tirashop.persitence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long>, JpaSpecificationExecutor<User> {
    boolean existsByUsername(String username);
    boolean existsByEmail (String email);
    Optional <User> findByUsername(String username);
    Optional<User> findByEmail(String email);


}
