package com.example.auth.services;

import com.example.auth.repository.NotifyStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotifyStatusService {

    @Autowired
    NotifyStatusRepository notifyStatusRepository;
}
