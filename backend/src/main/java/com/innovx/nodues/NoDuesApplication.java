package com.innovx.nodues;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NoDuesApplication {

    public static void main(String[] args) {
        SpringApplication.run(NoDuesApplication.class, args);
    }
}
