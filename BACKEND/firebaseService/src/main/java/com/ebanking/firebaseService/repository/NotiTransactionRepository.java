package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.NotiTransaction;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;


@Repository
public interface NotiTransactionRepository extends JpaRepository<NotiTransaction, Long> {

}

