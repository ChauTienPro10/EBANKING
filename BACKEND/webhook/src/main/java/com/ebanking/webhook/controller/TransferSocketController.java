package com.ebanking.webhook.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class TransferSocketController {
    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages") // gửi lại tới tất cả client đang subscribe /topic/messages
    public String broadcastMessage(String message) {
        System.out.println("📩 Received: " + message);
        return "Server nhận được: " + message;
    }
}
