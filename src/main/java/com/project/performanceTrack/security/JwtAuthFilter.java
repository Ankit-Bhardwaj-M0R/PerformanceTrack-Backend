package com.project.performanceTrack.security;

import com.project.performanceTrack.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// JWT authentication filter - validates token on each request
@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        // Extract token from Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                log.warn("Invalid JWT token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            }
        }

        // Validate token and set authentication
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token, email)) {
                String role = jwtUtil.extractRole(token);
                Integer userId = jwtUtil.extractUserId(token);

                // Create authentication with role
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Store userId in authentication details for easy access
                SecurityContextHolder.getContext().setAuthentication(authToken);
                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);

                log.debug("Authenticated user: {} (id={}, role={})", email, userId, role);
            }
        }

        filterChain.doFilter(request, response);
    }
}


//
//        The Request Lifecycle
//        Client Request (with JWT Header) ↓ [ Filter 1: SecurityContextPersistenceFilter ]
//
//        Checks if a user was already stored in a session (Since you use JWT, this is usually empty). ↓ [ Filter 2: LogoutFilter ]
//
//        Checks if the URL is /logout. ↓ [ Filter 3: Your Custom JwtAuthenticationFilter ]
//
//        The email != null check: Extracts the identity from the token.
//
//        The getAuthentication() == null check: Ensures no previous filter has already logged someone in.
//
//        The "Set" Action: If both pass, it places the user into the SecurityContextHolder. ↓ [ Filter 4: ExceptionTranslationFilter ]
//
//        A "safety net" that catches security errors and turns them into HTTP responses (like 401 Unauthorized). ↓ [ Filter 5: AuthorizationFilter (FilterSecurityInterceptor) ]
//
//        The final gate. It looks at the ROLE_ADMIN or ROLE_USER inside your SecurityContextHolder and compares it to the permissions required for the URL. ↓ [ Your @RestController ]
//
//        The request is finally safe to execute your business logic.
