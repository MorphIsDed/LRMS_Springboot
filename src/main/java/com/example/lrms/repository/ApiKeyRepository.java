package com.example.lrms.repository;

import com.example.lrms.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyHashAndIsActiveTrue(String keyHash);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ApiKey a WHERE a.isActive = true")
    long countActivePartners();
}
