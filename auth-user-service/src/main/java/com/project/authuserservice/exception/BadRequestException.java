package com.project.authuserservice.exception;

// Custom exception for bad requests
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}