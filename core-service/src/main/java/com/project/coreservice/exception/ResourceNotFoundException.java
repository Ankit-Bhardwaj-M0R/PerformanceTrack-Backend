package com.project.coreservice.exception;

// Custom exception for resource not found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
