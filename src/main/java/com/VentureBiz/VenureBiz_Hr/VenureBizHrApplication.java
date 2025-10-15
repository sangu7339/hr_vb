package com.VentureBiz.VenureBiz_Hr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VenureBizHrApplication {

	public static void main(String[] args) {
		SpringApplication.run(VenureBizHrApplication.class, args);
		System.out.println("running succeessfully");
	}

}
