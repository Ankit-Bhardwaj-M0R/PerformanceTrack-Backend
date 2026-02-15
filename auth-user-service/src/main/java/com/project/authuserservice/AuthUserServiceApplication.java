package com.project.authuserservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
@SpringBootApplication
@EnableFeignClients   // Enables Feign client interfaces
public class AuthUserServiceApplication {
    public static void main(String[] args) {
        // Load dotenv if needed
        SpringApplication.run(AuthUserServiceApplication.class, args);
    }
}