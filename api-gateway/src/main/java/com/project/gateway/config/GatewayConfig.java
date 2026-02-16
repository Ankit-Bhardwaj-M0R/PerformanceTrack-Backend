package com.project.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    // This bean is optional if you're using application.yml for route configuration
    // But it's here to show how you can also configure routes programmatically

    // Uncomment this if you want to define routes in Java instead of YAML
    /*
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth routes
                .route("auth-service", r -> r.path("/api/v1/auth/**")
                        .uri("lb://auth-user-service"))

                // User routes
                .route("user-service", r -> r.path("/api/v1/users/**")
                        .uri("lb://auth-user-service"))

                // Notification routes
                .route("notification-service", r -> r.path("/api/v1/notifications/**")
                        .uri("lb://notification-service"))

                // Goal routes
                .route("goal-service", r -> r.path("/api/v1/goals/**")
                        .uri("lb://core-service"))

                // Performance review routes
                .route("review-service", r -> r.path("/api/v1/performance-reviews/**")
                        .uri("lb://core-service"))

                // Review cycle routes
                .route("review-cycle-service", r -> r.path("/api/v1/review-cycles/**")
                        .uri("lb://core-service"))

                // Feedback routes
                .route("feedback-service", r -> r.path("/api/v1/feedback/**")
                        .uri("lb://core-service"))

                // Report routes
                .route("report-service", r -> r.path("/api/v1/reports/**")
                        .uri("lb://core-service"))

                // Block internal endpoints
                .route("block-internal", r -> r.path("/internal/**")
                        .filters(f -> f.setStatus(403))
                        .uri("no://op"))

                .build();
    }
    */
}
