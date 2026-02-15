package com.project.notificationservice.config;

import com.project.notificationservice.exception.ResourceNotFoundException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.stereotype.Component;

@Component
public class FeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 404) {
            return new ResourceNotFoundException("Resource not found in remote service");
        }
        return new RuntimeException("Service call failed: " + response.status());
    }
}
