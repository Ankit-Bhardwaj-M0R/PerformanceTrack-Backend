package com.project.coreservice.exception;

// Custom exception for unauthorized access
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
