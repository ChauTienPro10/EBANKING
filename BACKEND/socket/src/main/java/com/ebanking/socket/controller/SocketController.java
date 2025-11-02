package com.ebanking.socket.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SocketController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/trans-subscribe")
    public String handleMessage(String message) {
        System.out.println("Received from client: " + message);
        return message;
    }
}