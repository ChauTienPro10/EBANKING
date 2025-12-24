package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.DataPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DataPackageRepository extends JpaRepository<DataPackage, Long> {
    
    List<DataPackage> findByProviderIdAndIsActiveTrue(Long providerId);
    
    List<DataPackage> findByIsActiveTrueOrderBySortOrderAscPriceAsc();
    
    Optional<DataPackage> findByPackageCodeAndIsActiveTrue(String packageCode);
    
    @Query("SELECT dp FROM DataPackage dp JOIN dp.provider tp WHERE tp.providerCode = :providerCode AND dp.isActive = true ORDER BY dp.sortOrder ASC, dp.price ASC")
    List<DataPackage> findByProviderCodeAndIsActiveTrue(@Param("providerCode") String providerCode);
    
    @Query("SELECT dp FROM DataPackage dp WHERE dp.providerId = :providerId AND dp.isActive = true AND dp.price BETWEEN :minPrice AND :maxPrice ORDER BY dp.sortOrder ASC, dp.price ASC")
    List<DataPackage> findByProviderIdAndPriceRange(@Param("providerId") Long providerId, 
                                                   @Param("minPrice") java.math.BigDecimal minPrice, 
                                                   @Param("maxPrice") java.math.BigDecimal maxPrice);
}