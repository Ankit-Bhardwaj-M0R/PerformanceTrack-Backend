# Microservice Migration Guide — PerformanceTrack Backend

## Table of Contents

1. [Overview](#1-overview)
2. [Current Monolith Dependency Map](#2-current-monolith-dependency-map)
3. [Target Architecture](#3-target-architecture)
4. [New Project Structure](#4-new-project-structure)
5. [Step-by-Step Migration](#5-step-by-step-migration)
   - [Phase 1: Project Setup](#phase-1-project-setup-day-1)
   - [Phase 2: Auth + User Service](#phase-2-auth--user-service-day-2-3)
   - [Phase 3: Notification Service](#phase-3-notification-service-day-3-4)
   - [Phase 4: Core Service](#phase-4-core-service-goals--reviews--reports-day-4-6)
   - [Phase 5: Inter-Service Communication](#phase-5-inter-service-communication-day-6-7)
   - [Phase 6: API Gateway](#phase-6-api-gateway-day-7-8)
   - [Phase 7: Testing & Cleanup](#phase-7-testing--cleanup-day-8-9)
6. [Database Split Plan](#6-database-split-plan)
7. [Inter-Service API Contracts](#7-inter-service-api-contracts)
8. [Configuration Reference](#8-configuration-reference)
9. [Common Pitfalls](#9-common-pitfalls)
10. [Checklist](#10-final-checklist)

---

## 1. Overview

Right now, our entire backend is one big Spring Boot application — one codebase, one database, one JAR file. Everything talks to everything directly. That works fine for a small project, but the idea here is to break it into **3 separate Spring Boot apps** that each run independently, each have their own database, and talk to each other over HTTP.

Think of it like this: instead of one big restaurant kitchen where everyone bumps into each other, we're splitting it into 3 smaller kitchens — one for appetizers, one for main course, one for desserts. Each kitchen has its own fridge (database) and they send orders to each other through a window (REST APIs).

We are splitting the monolith into **3 microservices**:

| # | Service | Port | Database | What It Owns |
|---|---------|------|----------|--------------|
| 1 | **discovery-server** | 8761 | — | Eureka Service Registry (all services register here) |
| 2 | **auth-user-service** | 8081 | `auth_user_db` | User, AuditLog |
| 3 | **notification-service** | 8082 | `notification_db` | Notification |
| 4 | **core-service** | 8083 | `core_db` | Goal, GoalCompletionApproval, PerformanceReview, ReviewCycle, PerformanceReviewGoals, Feedback, Report |
| 5 | **api-gateway** | 8080 | — | Routes requests, validates JWT |

---

## 2. Current Monolith Dependency Map

Before we start ripping things apart, we need to understand what's connected to what. Imagine you're unplugging cables from a server rack — you wouldn't just yank everything out. You'd first trace which cable goes where. That's exactly what this section does.

Understanding what depends on what is critical before splitting.

### Service → Service Dependencies

```
AuthService          → AuditLogService
UserService          → NotificationService, AuditLogService
GoalService          → NotificationService
PerformanceReviewService → AuditLogService, NotificationService
ReviewCycleService   → AuditLogService
FeedbackService      → AuditLogService
NotificationService  → (none)
AuditLogService      → (none)
ReportService        → (none)
NotificationScheduler → NotificationService
```

### Service → Repository Dependencies

```
AuthService          → UserRepository
UserService          → UserRepository
GoalService          → GoalRepository, UserRepository, AuditLogRepository, FeedbackRepository, GoalCompletionApprovalRepository
PerformanceReviewService → PerformanceReviewRepository, UserRepository, ReviewCycleRepository, AuditLogRepository, PerformanceReviewGoalsRepository, GoalRepository
ReviewCycleService   → ReviewCycleRepository, UserRepository
FeedbackService      → FeedbackRepository, UserRepository, GoalRepository, PerformanceReviewRepository
NotificationService  → NotificationRepository
AuditLogService      → AuditLogRepository
ReportService        → ReportRepository, UserRepository, AuditLogRepository, GoalRepository, PerformanceReviewRepository
NotificationScheduler → GoalRepository, ReviewCycleRepository, UserRepository
```

### Key Takeaway — What Breaks When We Split

This is the most important part. Right now, your `GoalService` can just do `userRepository.findById(userId)` because User and Goal live in the same database. After the split, Goal lives in `core_db` and User lives in `auth_user_db` — they're in completely different databases. So that direct DB call won't work anymore. Instead, your Core Service will have to make an HTTP call like "Hey Auth-User Service, give me the details for user #5" and get a JSON response back.

These are the cross-service references that currently work via JPA but will need to become **REST API calls**:

| Current Direct Access | After Split Becomes |
|-|-|
| GoalService uses `UserRepository` | Core → calls Auth-User API for user data |
| GoalService uses `AuditLogRepository` | Core → calls Auth-User API to log audit |
| GoalService calls `NotificationService` | Core → calls Notification API |
| PerformanceReviewService uses `UserRepository` | Core → calls Auth-User API |
| PerformanceReviewService uses `AuditLogRepository` | Core → calls Auth-User API |
| PerformanceReviewService calls `NotificationService` | Core → calls Notification API |
| FeedbackService uses `UserRepository` | Core → calls Auth-User API |
| ReportService uses `UserRepository`, `AuditLogRepository` | Core → calls Auth-User API |
| NotificationScheduler uses `GoalRepository`, `ReviewCycleRepository` | Notification → calls Core API |
| NotificationScheduler uses `UserRepository` | Notification → calls Auth-User API |

---

## 3. Target Architecture

```
                         ┌──────────────────┐
                         │   API Gateway     │
            Client ────► │   (Port 8080)     │
                         └──────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Auth + User  │ │ Notification │ │    Core      │
        │  Service     │ │   Service    │ │   Service    │
        │ (Port 8081)  │ │ (Port 8082)  │ │ (Port 8083)  │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ auth_user_db │ │notification_db│ │   core_db    │
        └──────────────┘ └──────────────┘ └──────────────┘

        All services register with ▼

              ┌──────────────────────┐
              │   Eureka Discovery   │
              │   Server (Port 8761) │
              └──────────────────────┘
```

### Eureka Discovery Server — How Services Find Each Other

> **Why do we need Eureka?** Without Eureka, every service would need to hardcode the URLs of other services: `http://localhost:8081`, `http://localhost:8082`, etc. That works on your laptop, but what if a service moves to a different port or a different machine? You'd have to update every config file everywhere. Eureka solves this: each service registers itself with Eureka on startup ("hey, I'm auth-user-service, I'm running at localhost:8081"), and when another service wants to talk to it, it asks Eureka "where is auth-user-service?" and Eureka gives it the address. It's like a phone book for microservices.

How it works:
1. **Eureka Server** starts first on port 8761
2. Each service (Auth-User, Notification, Core, Gateway) starts and **registers** itself with Eureka using its `spring.application.name`
3. When Core Service needs to call Auth-User, it asks Eureka: "where is `auth-user-service`?"
4. Eureka replies with the IP and port
5. **OpenFeign** uses this automatically — you just write `@FeignClient(name = "auth-user-service")` and Feign asks Eureka for the address behind the scenes

### Communication Flow

Since these services can't directly access each other's databases anymore, they talk to each other using plain HTTP REST calls via **OpenFeign**. Instead of hardcoding URLs, Feign resolves service names through Eureka.

```
Core Service ──Feign──► Auth-User Service     (get user info, log audits)
Core Service ──Feign──► Notification Service   (send notifications)
Auth-User Service ──Feign──► Notification Service  (send ACCOUNT_CREATED notification)
Notification Service ──Feign──► Auth-User Service   (get user info for scheduler)
Notification Service ──Feign──► Core Service        (get goals/cycles for scheduler)
```

> **What is OpenFeign?** You could make HTTP calls with `RestTemplate` or `WebClient`, but that means writing boilerplate code for every call — building the URL, setting headers, parsing the response, handling errors. OpenFeign makes this dead simple: you write a Java interface (like a repository), annotate the methods with `@GetMapping`/`@PostMapping`, and Feign generates the HTTP call code for you at runtime. Combined with Eureka, you don't even need to know the port — Feign asks Eureka for the address automatically.

---

## 4. New Project Structure

We're using a **Maven multi-module** project. This means we have one parent folder that contains 4 child folders (one per service). The parent `pom.xml` just says "hey, I have these 4 children" and each child has its own `pom.xml` with its own dependencies. This way you can build everything at once with `mvn clean install` from the parent, or build each service individually.

```
performancetrack-microservices/          ← new parent folder
├── pom.xml                              ← parent POM (Maven multi-module)
├── discovery-server/
│   ├── pom.xml
│   └── src/main/java/com/project/discovery/
│       └── DiscoveryServerApplication.java
│
├── api-gateway/
│   ├── pom.xml
│   └── src/main/java/com/project/gateway/
│       ├── GatewayApplication.java
│       └── config/
│           └── GatewayConfig.java
│
├── auth-user-service/
│   ├── pom.xml
│   └── src/main/java/com/project/authuserservice/
│       ├── AuthUserServiceApplication.java
│       ├── client/           (NotificationClient) ← NEW: Feign client
│       ├── config/           (SecurityConfig, MapperConfig)
│       ├── controller/       (AuthController, UserController, AuditLogController)
│       ├── dto/              (LoginRequest, CreateUserRequest, LoginResponse, UserSummaryDTO, AuditLogRequest, NotificationRequest, etc.)
│       ├── entity/           (User, AuditLog)
│       ├── enums/            (UserRole, UserStatus)
│       ├── exception/        (GlobalExceptionHandler + custom exceptions)
│       ├── repository/       (UserRepository, AuditLogRepository)
│       ├── security/         (JwtAuthFilter, RateLimitFilter)
│       ├── service/          (AuthService, UserService, AuditLogService)
│       └── util/             (JwtUtil)
│
├── notification-service/
│   ├── pom.xml
│   └── src/main/java/com/project/notificationservice/
│       ├── NotificationServiceApplication.java
│       ├── client/           (AuthUserClient, CoreServiceClient) ← NEW: Feign clients
│       ├── config/           (SecurityConfig)
│       ├── controller/       (NotificationController)
│       ├── dto/              (NotificationRequest, UserSummaryDTO, GoalSummaryDTO, ReviewCycleSummaryDTO, ApiResponse, etc.)
│       ├── entity/           (Notification)
│       ├── enums/            (NotificationType, NotificationStatus)
│       ├── exception/        (GlobalExceptionHandler + custom exceptions)
│       ├── repository/       (NotificationRepository)
│       ├── scheduler/        (NotificationScheduler) ← moved here
│       └── service/          (NotificationService)
│
└── core-service/
    ├── pom.xml
    └── src/main/java/com/project/coreservice/
        ├── CoreServiceApplication.java
        ├── client/           (AuthUserClient, NotificationClient) ← NEW: Feign clients
        ├── config/           (SecurityConfig, MapperConfig)
        ├── controller/       (GoalController, PerformanceReviewController, ReviewCycleController, FeedbackController, ReportController)
        ├── dto/              (all goal/review/feedback/report DTOs + UserSummaryDTO, NotificationRequest, AuditLogRequest, ApiResponse, etc.)
        ├── entity/           (Goal, GoalCompletionApproval, PerformanceReview, ReviewCycle, PerformanceReviewGoals, Feedback, Report)
        ├── enums/            (GoalStatus, GoalCategory, GoalPriority, ReviewCycleStatus, PerformanceReviewStatus, CompletionApprovalStatus, EvidenceVerificationStatus)
        ├── exception/        (GlobalExceptionHandler + custom exceptions)
        ├── repository/       (GoalRepository, PerformanceReviewRepository, ReviewCycleRepository, FeedbackRepository, GoalCompletionApprovalRepository, PerformanceReviewGoalsRepository, ReportRepository)
        └── service/          (GoalService, PerformanceReviewService, ReviewCycleService, FeedbackService, ReportService)
```

> **Note:** There's no shared-dto module. DTOs are duplicated in each service that needs them. This keeps things simple and avoids managing a shared library.

---

## 5. Step-by-Step Migration

---

### Phase 1: Project Setup (Day 1)

This phase is just about creating empty folders and setting up the skeleton. No actual code migration yet — we're just laying the foundation.

#### Step 1.1 — Create the multi-module Maven project

Create a new folder `performancetrack-microservices/` outside the current project.

> **Why a new folder?** We're not modifying the monolith. We're building the microservices side-by-side. This way, if something goes wrong, your original project is untouched. You can always go back.

Create the **parent `pom.xml`**:

> **Why a parent POM?** Think of it as a "boss" that manages common settings for all 4 services — like the Java version and Spring Cloud version. Without it, you'd have to repeat these settings in every service's `pom.xml`. The parent POM also lets you run `mvn clean install` once to build everything.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>

    <groupId>com.project</groupId>
    <artifactId>performancetrack-microservices</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>PerformanceTrack Microservices</name>

    <properties>
        <java.version>21</java.version>
        <lombok.version>1.18.30</lombok.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <modules>
        <module>discovery-server</module>
        <module>api-gateway</module>
        <module>auth-user-service</module>
        <module>notification-service</module>
        <module>core-service</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

#### Step 1.2 — Create subdirectory for each module

```bash
mkdir -p performancetrack-microservices/{discovery-server,api-gateway,auth-user-service,notification-service,core-service}
```

#### Step 1.3 — Create the Eureka Discovery Server

> **Why do we build this first?** Because every other service needs to register with Eureka when it starts. If Eureka isn't running, the services will start but keep throwing "cannot connect to Eureka" warnings. Eureka is the phone book — you need the phone book before anyone can look up a number.

**`discovery-server/pom.xml` key dependencies:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

**`DiscoveryServerApplication.java`:**
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
```

**`discovery-server/src/main/resources/application.properties`:**
```properties
server.port=8761
spring.application.name=discovery-server
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

> **Why `register-with-eureka=false`?** Eureka Server is the registry itself. It doesn't need to register with itself — that would be silly. These two flags tell it "you ARE the registry, don't try to register yourself as a client."

**Test it:** Run `mvn spring-boot:run` and visit `http://localhost:8761`. You should see the Eureka dashboard with zero registered services (we'll add them next).

#### Step 1.4 — Create 3 separate MySQL databases

> **Why 3 databases?** This is the whole point of microservices — each service owns its data. If the Goal tables and User tables are in the same database, nothing stops someone from writing a SQL JOIN across them, and then you're back to a monolith. Separate databases enforce the boundary. Each service can ONLY access its own data. If it needs data from another service, it has to ask nicely via an API call.

```sql
CREATE DATABASE auth_user_db;
CREATE DATABASE notification_db;
CREATE DATABASE core_db;
```

---

### Phase 2: Auth + User Service (Day 2-3)

This is the most independent service. Start here.

> **Why start with Auth?** Because every other service depends on it (they all need to validate JWTs and look up user info), but it doesn't depend on anyone. It's the foundation. If you started with Core service instead, you'd immediately get stuck because it needs Auth-User to be running first. Always build the thing that others depend on first.

#### Step 2.1 — Create the module pom.xml

**Key dependencies for `auth-user-service/pom.xml`:**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `mysql-connector-j`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.11.5)
- `modelmapper` (3.2.0)
- `dotenv-java` (3.0.0)
- `lombok`
- `spring-cloud-starter-netflix-eureka-client` ← NEW (registers with Eureka)
- `spring-cloud-starter-openfeign` ← NEW (for calling Notification Service)

> **Why does Auth-User need Feign?** Because in the monolith, `UserService` calls `NotificationService.sendNotification()` to send an ACCOUNT_CREATED notification when a new user is created. After the split, that becomes a Feign call to the Notification Service.

#### Step 2.2 — Copy these files from the monolith

```
FROM monolith                              → TO auth-user-service
─────────────────────────────────────────────────────────────────
entity/User.java                           → entity/User.java
entity/AuditLog.java                       → entity/AuditLog.java
enums/UserRole.java                        → enums/UserRole.java
enums/UserStatus.java                      → enums/UserStatus.java
repository/UserRepository.java             → repository/UserRepository.java
repository/AuditLogRepository.java         → repository/AuditLogRepository.java
service/AuthService.java                   → service/AuthService.java
service/UserService.java                   → service/UserService.java
service/AuditLogService.java               → service/AuditLogService.java
controller/AuthController.java             → controller/AuthController.java
controller/UserController.java             → controller/UserController.java
controller/AuditLogController.java         → controller/AuditLogController.java
security/JwtAuthFilter.java                → security/JwtAuthFilter.java
security/RateLimitFilter.java              → security/RateLimitFilter.java
util/JwtUtil.java                          → util/JwtUtil.java
config/SecurityConfig.java                 → config/SecurityConfig.java
config/MapperConfig.java                   → config/MapperConfig.java
exception/*                                → exception/* (all exception classes)
aspect/LoggingAspect.java                  → aspect/LoggingAspect.java
dto/LoginRequest.java                      → dto/LoginRequest.java
dto/LoginResponse.java                     → dto/LoginResponse.java
dto/CreateUserRequest.java                 → dto/CreateUserRequest.java
dto/ChangePasswordRequest.java             → dto/ChangePasswordRequest.java
```

#### Step 2.3 — Modify copied files

Now here's where the real work begins. You can't just copy-paste and expect things to work. Each file needs some changes because it used to live in a monolith where everything was connected, and now it needs to stand on its own.

1. **Change all package declarations** from `com.project.performanceTrack.*` to `com.project.authuserservice.*`

   > **Why?** Each microservice is its own Spring Boot app. Spring scans packages to find your beans. If two services had the same package name and you ever put them in the same classpath (like for testing), Spring would get confused. Different packages = clean separation.

2. **UserService.java** — Remove the `NotificationService` dependency. Replace it with a `NotificationClient` Feign interface that makes HTTP calls to the Notification Service instead.

   > **Why?** In the monolith, UserService could directly call `notificationService.sendNotification()` because they lived in the same app. Now NotificationService is a separate app running on port 8082. You can't just `@Autowired` it anymore — it's not in your classpath. So instead, you inject a Feign client that makes the HTTP call for you. Feign finds the Notification Service's address via Eureka automatically.

   Create a Feign client in `client/NotificationClient.java`:
   ```java
   @FeignClient(name = "notification-service")  // name matches Eureka registration
   public interface NotificationClient {
       @PostMapping("/internal/notifications")
       ApiResponse<Void> sendNotification(@RequestBody NotificationRequest request);
   }
   ```

   Then in UserService, replace the old direct call:
   ```java
   // BEFORE (monolith):
   notificationService.sendNotification(user, NotificationType.ACCOUNT_CREATED, ...);

   // AFTER (microservice):
   try {
       NotificationRequest req = new NotificationRequest(user.getUserId(),
           "ACCOUNT_CREATED", "Welcome to PerformanceTrack!", "NORMAL", false);
       notificationClient.sendNotification(req);
   } catch (Exception e) {
       log.error("Failed to send welcome notification: {}", e.getMessage());
       // Don't crash — user was created successfully, notification is non-critical
   }
   ```

3. **AuditLogService.java** — Add a new REST endpoint for other services to call:
   ```java
   // In AuditLogController.java, add:
   @PostMapping("/internal/audit-logs")
   public ResponseEntity<ApiResponse<Void>> createAuditLog(@RequestBody AuditLogRequest request) {
       auditLogService.logAudit(request);
       return ResponseEntity.ok(new ApiResponse<>("success", "Audit logged", null));
   }
   ```

   > **Why `/internal/` endpoints?** These are endpoints that only other microservices will call — never the frontend. Think of them as a "staff-only" door in a restaurant. The frontend (customer) comes through the main door (`/api/v1/...`), but the kitchen staff (other services) use the back door (`/internal/...`). Later, we'll block these from external access using the API Gateway.

4. **Add an internal user endpoint** for other services to call:
   ```java
   // In UserController.java, add:
   @GetMapping("/internal/users/{userId}")
   public ResponseEntity<ApiResponse<UserSummaryDTO>> getInternalUser(@PathVariable Long userId) {
       // Returns lightweight user info for other services
   }

   @GetMapping("/internal/users/by-manager/{managerId}")
   public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getTeamByManager(@PathVariable Long managerId) {
       // Returns team members for a manager
   }
   ```

   > **Why do we need this?** In the monolith, when GoalService needed a user's name, it just called `userRepository.findById()`. Now that User lives in a separate service, the Core Service has no UserRepository. So it calls this endpoint instead — like asking a colleague "hey, who is user #5?" and getting back their name, email, role, etc.

5. **Add a token validation endpoint** for the API Gateway:
   ```java
   // In AuthController.java, add:
   @GetMapping("/internal/auth/validate")
   public ResponseEntity<ApiResponse<TokenValidationResponse>> validateToken(
           @RequestHeader("Authorization") String authHeader) {
       // Extract and validate token, return userId and role
   }
   ```

   > **Why?** The API Gateway needs to check if a request has a valid JWT before forwarding it to the right service. Instead of duplicating all the JWT validation logic in the Gateway, it can just ask Auth-User "is this token legit?" and get a yes/no answer. This keeps JWT logic in one place.

6. **SecurityConfig.java** — Remove all the route rules for goals, reviews, etc. Only keep rules for `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/audit-logs/**`, and the new `/internal/**` endpoints. Mark `/internal/**` as `permitAll()` (they will only be accessible within the internal network, not exposed via gateway).

   > **Why remove goal/review routes?** This service doesn't handle goals or reviews anymore — that's Core Service's job. Each service should only have security rules for the routes it actually serves. And `/internal/**` is `permitAll()` because these calls come from other services, not from users with JWTs. Security for internal calls is handled by keeping them off the public internet (the Gateway blocks them).

7. **User.java entity** — Remove any `@OneToMany` relationships that reference Goal or other entities from other services. Keep only the self-referencing `manager` relationship.

   > **Why?** If your User entity has `@OneToMany List<Goal> goals`, JPA will try to find a `goals` table in `auth_user_db`. But the goals table lives in `core_db` now. JPA would crash on startup. So we remove any relationship that points to an entity in another service's database.

8. **Create DTOs for inter-service communication** — Add these new DTOs in the `dto/` folder:
   - `UserSummaryDTO` — lightweight user info (userId, name, email, role, department) that other services will receive
   - `AuditLogRequest` — DTO for receiving audit log requests from other services
   - `TokenValidationResponse` — DTO for returning token validation results to gateway

#### Step 2.4 — Configure application.properties

```properties
server.port=8081
spring.application.name=auth-user-service
spring.datasource.url=jdbc:mysql://localhost:3306/auth_user_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Eureka — register this service so others can find it
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

> **Why `spring.application.name`?** This is the name that Eureka uses to register your service. When Core Service writes `@FeignClient(name = "auth-user-service")`, Feign asks Eureka "where is auth-user-service?" — and Eureka matches it against this name. So the name here **must match** the name in the Feign client annotation.

#### Step 2.5 — Create the main application class

```java
@SpringBootApplication
@EnableFeignClients   // Enables Feign client interfaces
public class AuthUserServiceApplication {
    public static void main(String[] args) {
        // Load dotenv if needed
        SpringApplication.run(AuthUserServiceApplication.class, args);
    }
}
```

> **Why `@EnableFeignClients`?** Without this annotation, Spring won't scan for your `@FeignClient` interfaces. It's like having a repository interface without `@EnableJpaRepositories` — Spring just won't know it exists. Every service that has Feign clients needs this on its main class.

#### Step 2.6 — Test it

```bash
cd auth-user-service
mvn spring-boot:run
```

Verify these work:
- `POST /api/v1/auth/login`
- `GET /api/v1/users/`
- `GET /internal/users/{userId}`
- `POST /internal/audit-logs`

---

### Phase 3: Notification Service (Day 3-4)

This is the simplest service — 1 entity, 1 service, 1 controller.

> **Why build this second?** It's small and easy to get working. After building Auth-User (which was the hardest foundational piece), building something small gives you a quick win and helps you practice the pattern of "copy, modify packages, update entities, add internal endpoints" before tackling the big Core service.

#### Step 3.1 — Create module pom.xml

**Key dependencies for `notification-service/pom.xml`:**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `mysql-connector-j`
- `lombok`
- `spring-cloud-starter-netflix-eureka-client` ← NEW (registers with Eureka)
- `spring-cloud-starter-openfeign` ← NEW (for calling other services via Feign)

#### Step 3.2 — Copy these files from the monolith

```
FROM monolith                              → TO notification-service
─────────────────────────────────────────────────────────────────
entity/Notification.java                   → entity/Notification.java
enums/NotificationType.java                → enums/NotificationType.java
enums/NotificationStatus.java              → enums/NotificationStatus.java
repository/NotificationRepository.java     → repository/NotificationRepository.java
service/NotificationService.java           → service/NotificationService.java
controller/NotificationController.java     → controller/NotificationController.java
scheduler/NotificationScheduler.java       → scheduler/NotificationScheduler.java
exception/*                                → exception/*
```

#### Step 3.3 — Modify copied files

1. **Change all package declarations** to `com.project.notificationservice.*`

2. **Notification.java entity** — The `user` field currently has a `@ManyToOne` JPA relationship to `User`. Since `User` is now in another database, change this to just store the `userId`:
   ```java
   // BEFORE (monolith):
   @ManyToOne
   @JoinColumn(name = "user_id")
   private User user;

   // AFTER (microservice):
   @Column(name = "user_id", nullable = false)
   private Long userId;
   ```

   > **Why this change?** This is the single most important pattern in the entire migration. `@ManyToOne` tells JPA "go find this User in my database." But there's no `users` table in `notification_db` — it's in `auth_user_db`. So we replace the JPA relationship with a plain `Long userId`. We're basically saying "I know this number refers to a user, but I'm not going to look them up from my own database. If I need user details, I'll call the Auth-User service." You'll do this same change in almost every entity across the project.

3. **NotificationService.java** — Update `sendNotification()` to accept `userId` (Long) instead of a `User` entity. The service now just stores the userId directly.

   > **Why?** Since Notification no longer has a `User` object (just a `Long userId`), the service method signature needs to match. Other services will call our internal endpoint with just the userId number, and we store that directly.

4. **NotificationController.java** — Add an internal endpoint that other services call:
   ```java
   @PostMapping("/internal/notifications")
   public ResponseEntity<ApiResponse<Void>> createNotification(
           @RequestBody NotificationRequest request) {
       notificationService.sendNotification(
           request.getUserId(), request.getType(), request.getMessage(),
           request.getPriority(), request.isActionRequired()
       );
       return ResponseEntity.ok(new ApiResponse<>("success", "Notification sent", null));
   }
   ```

5. **NotificationScheduler.java** — This is the trickiest part. Currently it uses `GoalRepository`, `ReviewCycleRepository`, and `UserRepository` directly. After the split, it has none of these. Replace with Feign client calls:
   ```java
   // BEFORE:
   List<Goal> pendingGoals = goalRepository.findByStatus(GoalStatus.PENDING);

   // AFTER:
   List<GoalSummaryDTO> pendingGoals = coreServiceClient.getGoalsByStatus("PENDING");
   ```

   Create two Feign clients (see Phase 5 for details):
   - `AuthUserClient` — to get user details
   - `CoreServiceClient` — to get goals and review cycles

   > **Why is the scheduler the trickiest?** Because it's the one piece that needs data from ALL other services. It needs to know "which goals are pending?" (Core Service data) and "who's the manager for this employee?" (Auth-User data) to send the right reminders to the right people. In the monolith it just queried everything directly. Now it has to make HTTP calls to two different services to gather the same information.

6. **SecurityConfig.java** — Simplified. Allow `/internal/**` without auth. Protect `/api/v1/notifications/**` with JWT. You'll need a lightweight JWT validation filter here (just validates the token, doesn't need the full User entity — extract userId and role from the token claims).

7. **Create DTOs for inter-service communication** — Add these new DTOs in the `dto/` folder:
   - `NotificationRequest` — DTO for receiving notification requests from other services
   - `UserSummaryDTO` — duplicate this DTO (same as in auth-user-service) for Feign client responses
   - `GoalSummaryDTO` — DTO for receiving goal data from core service
   - `ReviewCycleSummaryDTO` — DTO for receiving review cycle data from core service
   - `ApiResponse<T>` — standard response wrapper (duplicate in each service)

#### Step 3.4 — Configure application.properties

```properties
server.port=8082
spring.application.name=notification-service
spring.datasource.url=jdbc:mysql://localhost:3306/notification_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update

# Eureka — register with discovery server
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

> **Notice: no hardcoded URLs!** In the old version we had `service.auth-user.url=http://localhost:8081`. With Eureka, we don't need that. Feign asks Eureka "where is auth-user-service?" and gets the address dynamically. If auth-user-service moves to port 9999 tomorrow, Notification Service doesn't need to change anything — Eureka handles it.

#### Step 3.5 — Test it

```bash
cd notification-service
mvn spring-boot:run
```

Verify:
- `GET /api/v1/notifications/` (with JWT)
- `POST /internal/notifications` (without JWT, internal call)

---

### Phase 4: Core Service — Goals + Reviews + Reports (Day 4-6)

This is the biggest service. Take your time.

> **Why is this the biggest?** Because it has the most entities (7), the most controllers (5), and the most service files (5). It's basically "everything that isn't auth/users and isn't notifications." The good news is that the entities inside this service (Goal, Review, Feedback, etc.) still talk to each other directly via JPA because they're all in the same `core_db` database. The only things we need to change are the connections to User (different database) and Notification (different service).

#### Step 4.1 — Create module pom.xml

**Key dependencies for `core-service/pom.xml`:**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `mysql-connector-j`
- `modelmapper`
- `lombok`
- `spring-cloud-starter-netflix-eureka-client` ← NEW (registers with Eureka)
- `spring-cloud-starter-openfeign` ← NEW (for calling Auth-User and Notification via Feign)

#### Step 4.2 — Copy these files from the monolith

```
FROM monolith                                    → TO core-service
──────────────────────────────────────────────────────────────────
entity/Goal.java                                 → entity/Goal.java
entity/GoalCompletionApproval.java               → entity/GoalCompletionApproval.java
entity/PerformanceReview.java                    → entity/PerformanceReview.java
entity/ReviewCycle.java                          → entity/ReviewCycle.java
entity/PerformanceReviewGoals.java               → entity/PerformanceReviewGoals.java
entity/Feedback.java                             → entity/Feedback.java
entity/Report.java                               → entity/Report.java
enums/GoalStatus.java                            → enums/GoalStatus.java
enums/GoalCategory.java                          → enums/GoalCategory.java
enums/GoalPriority.java                          → enums/GoalPriority.java
enums/ReviewCycleStatus.java                     → enums/ReviewCycleStatus.java
enums/PerformanceReviewStatus.java               → enums/PerformanceReviewStatus.java
enums/CompletionApprovalStatus.java              → enums/CompletionApprovalStatus.java
enums/EvidenceVerificationStatus.java            → enums/EvidenceVerificationStatus.java
repository/GoalRepository.java                   → repository/GoalRepository.java
repository/GoalCompletionApprovalRepository.java → repository/GoalCompletionApprovalRepository.java
repository/PerformanceReviewRepository.java      → repository/PerformanceReviewRepository.java
repository/ReviewCycleRepository.java            → repository/ReviewCycleRepository.java
repository/PerformanceReviewGoalsRepository.java → repository/PerformanceReviewGoalsRepository.java
repository/FeedbackRepository.java               → repository/FeedbackRepository.java
repository/ReportRepository.java                 → repository/ReportRepository.java
service/GoalService.java                         → service/GoalService.java
service/PerformanceReviewService.java            → service/PerformanceReviewService.java
service/ReviewCycleService.java                  → service/ReviewCycleService.java
service/FeedbackService.java                     → service/FeedbackService.java
service/ReportService.java                       → service/ReportService.java
controller/GoalController.java                   → controller/GoalController.java
controller/PerformanceReviewController.java      → controller/PerformanceReviewController.java
controller/ReviewCycleController.java            → controller/ReviewCycleController.java
controller/FeedbackController.java               → controller/FeedbackController.java
controller/ReportController.java                 → controller/ReportController.java
config/SecurityConfig.java                       → config/SecurityConfig.java
config/MapperConfig.java                         → config/MapperConfig.java
exception/*                                      → exception/*
aspect/LoggingAspect.java                        → aspect/LoggingAspect.java
dto/* (goal, review, feedback, report DTOs)       → dto/*
```

#### Step 4.3 — Modify copied files (this is the big one)

**A) Remove the User entity and UserRepository**

The core service does NOT own User. Every place that currently does `userRepository.findById(userId)` must be replaced.

> **Why can't we just keep UserRepository?** Because there's no `users` table in `core_db`. The User table lives in `auth_user_db`, which belongs to the Auth-User Service. If you try to use UserRepository here, JPA will look for a `users` table in `core_db`, won't find it, and crash on startup. So instead of querying the database directly, we ask the Auth-User Service "give me user #5's info" over HTTP.

**Pattern to follow everywhere:**

```java
// BEFORE (monolith) — direct DB access:
User user = userRepository.findById(userId)
    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
goal.setAssignedToUser(user);

// AFTER (microservice) — REST call via Feign:
UserSummaryDTO user = authUserClient.getUserById(userId);
if (user == null) throw new ResourceNotFoundException("User not found");
goal.setAssignedToUserId(userId);
goal.setAssignedToUserName(user.getName()); // denormalize the name
```

> **What's "denormalize the name"?** In the monolith, you could always do `goal.getAssignedToUser().getName()` because the User object was right there. Now you only store `userId` (a number). If you want to display the user's name in a response without making another API call every single time, you can store the name alongside the userId. This is called denormalization — storing a copy of data to avoid repeated lookups. It's optional but practical.

**B) Update entities to remove User JPA relationships**

Same pattern we did in Notification service — for every entity that has `@ManyToOne` pointing to `User`, replace with a simple `Long userId` column:

```java
// Goal.java BEFORE:
@ManyToOne
@JoinColumn(name = "assigned_to")
private User assignedToUser;

@ManyToOne
@JoinColumn(name = "assigned_manager")
private User assignedManager;

// Goal.java AFTER:
@Column(name = "assigned_to")
private Long assignedToUserId;

@Column(name = "assigned_manager")
private Long assignedManagerId;
```

Do this for ALL entities: Goal, PerformanceReview, Feedback, Report, GoalCompletionApproval.

**C) Replace NotificationService calls with Feign client calls**

> **Why?** Same story as UserRepository — `NotificationService` used to be in the same app, so you could `@Autowired` it. Now it's a separate app on port 8082. So instead of calling the Java method directly, you send an HTTP POST to the Notification Service's internal endpoint with the notification details in JSON.

```java
// BEFORE:
notificationService.sendNotification(user, NotificationType.GOAL_APPROVED, "Your goal was approved", ...);

// AFTER:
NotificationRequest notifReq = new NotificationRequest(userId, NotificationType.GOAL_APPROVED, "Your goal was approved", ...);
notificationClient.sendNotification(notifReq);
```

**D) Replace AuditLogService/AuditLogRepository calls with Feign client calls**

> **Why?** Audit logs live in `auth_user_db`, not `core_db`. So when a goal is created and you want to log that action, you can't write directly to the audit_logs table. Instead, you send the audit data to the Auth-User Service and let it handle the insert.

```java
// BEFORE:
auditLogService.logAudit(userId, "GOAL_CREATED", details, "GOAL", goalId, "SUCCESS", ipAddress);

// AFTER:
AuditLogRequest auditReq = new AuditLogRequest(userId, "GOAL_CREATED", details, "GOAL", goalId, "SUCCESS", ipAddress);
authUserClient.createAuditLog(auditReq);
```

**E) Add internal endpoints for Notification Service's scheduler**

> **Why does Core Service need to expose internal endpoints?** Because the NotificationScheduler (which now lives in the Notification Service) needs to ask "which goals are pending approval for more than 2 days?" and "is there an active review cycle ending soon?" — that data lives in `core_db`. So Core Service needs to expose these as APIs for the scheduler to call.

The NotificationScheduler (now in Notification Service) needs goal and review cycle data. Add:

```java
// In GoalController.java, add:
@GetMapping("/internal/goals/by-status/{status}")
public ResponseEntity<ApiResponse<List<GoalSummaryDTO>>> getGoalsByStatus(@PathVariable String status) {
    // Return goals filtered by status
}

@GetMapping("/internal/goals/pending-approval")
public ResponseEntity<ApiResponse<List<GoalSummaryDTO>>> getGoalsPendingApproval(
        @RequestParam int pendingDays) {
    // Return goals pending approval for more than N days
}

// In ReviewCycleController.java, add:
@GetMapping("/internal/review-cycles/active")
public ResponseEntity<ApiResponse<ReviewCycleSummaryDTO>> getActiveReviewCycle() {
    // Return the currently active review cycle
}
```

**F) SecurityConfig.java — Update route rules**

Remove all auth/user routes. Keep only goal, review, feedback, report routes. Allow `/internal/**` without auth.

**G) Add a lightweight JWT filter**

This service doesn't generate JWTs (that's Auth-User's job), but it still needs to read the JWT to know who's making the request. Copy `JwtAuthFilter` and `JwtUtil` but make them **read-only** — they extract userId/role from the token but never generate tokens. The JWT secret must be the same across all services (put it in a shared env variable).

> **Why does Core Service need JWT validation if Auth-User already handles login?** Because when someone calls `POST /api/v1/goals/`, Core Service needs to know WHO is making the request — is it an employee, a manager, or an admin? That info is inside the JWT. So Core Service reads the JWT to extract the userId and role, then uses that to decide what the user is allowed to do. It doesn't generate tokens — only Auth-User does that. Core Service just reads them.

**H) Create DTOs for inter-service communication**

Add these new DTOs in the `dto/` folder:
- `UserSummaryDTO` — duplicate this DTO (same as in auth-user-service) for Feign client responses
- `NotificationRequest` — DTO for sending notification requests to notification service
- `AuditLogRequest` — DTO for sending audit log requests to auth-user service
- `GoalSummaryDTO` — lightweight goal info (goalId, title, status, userId, managerId) for scheduler
- `ReviewCycleSummaryDTO` — lightweight review cycle info for scheduler
- `ApiResponse<T>` — standard response wrapper (duplicate in each service)

#### Step 4.4 — Configure application.properties

```properties
server.port=8083
spring.application.name=core-service
spring.datasource.url=jdbc:mysql://localhost:3306/core_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update

# Eureka — register with discovery server
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

#### Step 4.5 — Test it

Start Auth-User service first (8081), then Notification (8082), then Core (8083).

Verify:
- `POST /api/v1/goals/` → creates goal + sends notification to Notification service
- `GET /api/v1/performance-reviews/`
- `GET /api/v1/reports/dashboard`

---

### Phase 5: Inter-Service Communication with OpenFeign + Eureka (Day 6-7)

This is where all the services start talking to each other via Feign clients, with Eureka handling the address resolution.

> **How Feign + Eureka work together:** In the old version of this guide, Feign clients had hardcoded URLs like `url = "${service.auth-user.url}"`. With Eureka, we drop the URL entirely. Instead, we just give Feign the service name: `@FeignClient(name = "auth-user-service")`. When a Feign call is made, here's what happens:
> 1. Feign sees the name `"auth-user-service"`
> 2. Feign asks Eureka: "where is auth-user-service running?"
> 3. Eureka replies: "it's at `http://192.168.1.5:8081`"
> 4. Feign makes the HTTP call to that address
> 5. If auth-user-service moves to a different port or machine, Eureka knows automatically
>
> This is called **service discovery** — nobody hardcodes addresses anymore.

#### Step 5.1 — Ensure all services have the right dependencies

By now, each service should already have these in their `pom.xml` (we added them in Phases 2-4):

| Service | `eureka-client` | `openfeign` | `@EnableFeignClients` |
|---------|:-:|:-:|:-:|
| **auth-user-service** | Yes | Yes | Yes |
| **notification-service** | Yes | Yes | Yes |
| **core-service** | Yes | Yes | Yes |
| **api-gateway** | Yes | No (uses Gateway routing) | No |

Each main application class that uses Feign needs `@EnableFeignClients`:
```java
@SpringBootApplication
@EnableFeignClients
public class CoreServiceApplication { ... }
```

#### Step 5.2 — Create Feign clients for Auth-User Service

> **Auth-User needs Feign too!** It calls Notification Service to send ACCOUNT_CREATED notifications when creating users.

**`auth-user-service/src/.../client/NotificationClient.java`:**

```java
@FeignClient(name = "notification-service")  // No URL! Eureka resolves it.
public interface NotificationClient {

    @PostMapping("/internal/notifications")
    ApiResponse<Void> sendNotification(@RequestBody NotificationRequest request);
}
```

> **Notice: no `url` parameter!** This is the key difference from hardcoded URLs. The `name` must match the `spring.application.name` of the target service exactly. Eureka handles the rest.

#### Step 5.3 — Create Feign clients for Core Service

**`core-service/src/.../client/AuthUserClient.java`:**

```java
@FeignClient(name = "auth-user-service")
public interface AuthUserClient {

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserSummaryDTO> getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/internal/users/by-manager/{managerId}")
    ApiResponse<List<UserSummaryDTO>> getTeamByManager(@PathVariable("managerId") Long managerId);

    @PostMapping("/internal/audit-logs")
    ApiResponse<Void> createAuditLog(@RequestBody AuditLogRequest request);
}
```

**`core-service/src/.../client/NotificationClient.java`:**

```java
@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/internal/notifications")
    ApiResponse<Void> sendNotification(@RequestBody NotificationRequest request);
}
```

#### Step 5.4 — Create Feign clients for Notification Service

**`notification-service/src/.../client/AuthUserClient.java`:**

```java
@FeignClient(name = "auth-user-service")
public interface AuthUserClient {

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserSummaryDTO> getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/internal/users/by-manager/{managerId}")
    ApiResponse<List<UserSummaryDTO>> getTeamByManager(@PathVariable("managerId") Long managerId);
}
```

**`notification-service/src/.../client/CoreServiceClient.java`:**

```java
@FeignClient(name = "core-service")
public interface CoreServiceClient {

    @GetMapping("/internal/goals/pending-approval")
    ApiResponse<List<GoalSummaryDTO>> getGoalsPendingApproval(@RequestParam("pendingDays") int days);

    @GetMapping("/internal/review-cycles/active")
    ApiResponse<ReviewCycleSummaryDTO> getActiveReviewCycle();
}
```

#### Step 5.5 — Summary of all Feign clients across services

| Service | Feign Client | Talks To | Why |
|---------|-------------|----------|-----|
| **auth-user-service** | `NotificationClient` | notification-service | Send ACCOUNT_CREATED notification on user creation |
| **core-service** | `AuthUserClient` | auth-user-service | Get user info, log audits |
| **core-service** | `NotificationClient` | notification-service | Send goal/review notifications |
| **notification-service** | `AuthUserClient` | auth-user-service | Get user info for scheduler reminders |
| **notification-service** | `CoreServiceClient` | core-service | Get pending goals/cycles for scheduler |

#### Step 5.6 — Add Feign error handling

> **Why do we need this?** When Core Service calls Auth-User Service for user #999 and that user doesn't exist, Auth-User returns a 404. Without an error decoder, Feign would throw a generic `FeignException` with a confusing message. With the decoder, we translate that into our own `ResourceNotFoundException` — the same exception our GlobalExceptionHandler already knows how to handle nicely.

Create a `FeignErrorDecoder` in each service so that when a called service returns 404, you get a proper `ResourceNotFoundException` instead of a generic Feign error:

```java
@Component
public class FeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 404) {
            return new ResourceNotFoundException("Resource not found in remote service");
        }
        if (response.status() == 401) {
            return new UnauthorizedException("Unauthorized access to remote service");
        }
        return new RuntimeException("Service call failed: " + response.status());
    }
}
```

#### Step 5.7 — Handle Feign call failures gracefully

> **Why?** This is a really important microservice concept. In a monolith, if NotificationService throws an error, your whole request fails. In microservices, you have a choice: should a goal creation fail just because the notification service is temporarily down? Probably not — the goal was created successfully, the notification is just a nice-to-have. So we wrap non-critical calls in try-catch and log the error instead of crashing. But for critical calls (like "does this user exist?"), we let the error propagate because you genuinely can't proceed without that data.

Wrap Feign calls in try-catch so that if Notification Service is down, goal creation doesn't fail:

```java
// In GoalService.java:
try {
    notificationClient.sendNotification(notifReq);
} catch (Exception e) {
    log.error("Failed to send notification for goal {}: {}", goalId, e.getMessage());
    // Don't throw — goal creation should still succeed
}
```

For critical calls (like getting user info), let the exception propagate — you can't create a goal if you can't verify the user exists.

---

### Phase 6: API Gateway (Day 7-8)

> **What is the API Gateway and why do we need it?** Right now, your frontend would need to know: "auth is on port 8081, notifications on 8082, goals on 8083." That's messy. The API Gateway is a single entry point (port 8080) that sits in front of all your services. The frontend talks to `localhost:8080` for everything, and the gateway figures out which service to forward the request to based on the URL path. It's like a receptionist at an office — you don't go directly to different departments, you go to the reception and they direct you.
>
> It also gives us a single place to handle cross-cutting concerns like CORS, JWT validation, and blocking internal endpoints from external access.

#### Step 6.1 — Create the gateway module

**`api-gateway/pom.xml` dependencies:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

> **Important:** The API Gateway uses Spring Cloud Gateway which is built on **WebFlux** (reactive). Do NOT add `spring-boot-starter-web` — it conflicts with WebFlux.
>
> **Why does Gateway need Eureka Client?** So it can route requests using service names instead of hardcoded ports. Instead of `uri: http://localhost:8081`, we use `uri: lb://auth-user-service`. The `lb://` prefix tells the Gateway "look up this service in Eureka and load-balance across its instances."

#### Step 6.2 — Configure routes in application.yml

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        # Auth & User routes → routed to auth-user-service via Eureka
        - id: auth-service
          uri: lb://auth-user-service          # lb:// = look up in Eureka
          predicates:
            - Path=/api/v1/auth/**
        - id: user-service
          uri: lb://auth-user-service
          predicates:
            - Path=/api/v1/users/**
        - id: audit-log-service
          uri: lb://auth-user-service
          predicates:
            - Path=/api/v1/audit-logs/**

        # Notification routes → routed to notification-service via Eureka
        - id: notification-service
          uri: lb://notification-service
          predicates:
            - Path=/api/v1/notifications/**

        # Core routes → routed to core-service via Eureka
        - id: goal-service
          uri: lb://core-service
          predicates:
            - Path=/api/v1/goals/**
        - id: review-service
          uri: lb://core-service
          predicates:
            - Path=/api/v1/performance-reviews/**
        - id: review-cycle-service
          uri: lb://core-service
          predicates:
            - Path=/api/v1/review-cycles/**
        - id: feedback-service
          uri: lb://core-service
          predicates:
            - Path=/api/v1/feedback/**
        - id: report-service
          uri: lb://core-service
          predicates:
            - Path=/api/v1/reports/**

# Eureka
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

> **What does `lb://` mean?** It stands for "load balancer." When the Gateway sees `lb://core-service`, it asks Eureka "where is core-service?", gets the address (e.g., `localhost:8083`), and forwards the request there. If you ever run multiple instances of core-service, the Gateway will automatically load-balance between them. No hardcoded ports anymore!

#### Step 6.3 — Block internal endpoints from external access

> **Why is this critical?** Those `/internal/*` endpoints we created have no authentication — they're `permitAll()`. If someone figured out your service's direct URL and port, they could call `/internal/users/1` and get user data without a JWT. The gateway acts as a firewall: it intercepts any request to `/internal/**` and returns a 403 Forbidden, ensuring only service-to-service calls (which go directly between services, not through the gateway) can access them.

Add a route that blocks anything under `/internal/**`:

```yaml
        # Block internal endpoints from external access
        - id: block-internal
          uri: no://op
          predicates:
            - Path=/internal/**
          filters:
            - SetStatus=403
```

#### Step 6.4 — (Optional) Add JWT validation at gateway level

You can add a global filter that validates JWT for all requests except `/api/v1/auth/login`:

```java
@Component
public class JwtAuthGatewayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        // Skip auth for login endpoint
        if (path.equals("/api/v1/auth/login")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Validate token (use JwtUtil or call auth-user-service)
        // If valid, forward the request; if not, return 401
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
```

#### Step 6.5 — Add CORS configuration

> **Why CORS at the gateway?** In the monolith, you had CORS configured once. Now you have 3 services — you could configure CORS in each one, but that's repetitive and error-prone. Since all frontend requests come through the gateway, configuring CORS here once covers everything.

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000"); // Your frontend
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
```

#### Step 6.6 — Test it

Start all 4 services. All requests now go through `http://localhost:8080`:

```bash
# Login (routed to auth-user-service:8081)
curl -X POST http://localhost:8080/api/v1/auth/login -d '{"email":"...", "password":"..."}'

# Get goals (routed to core-service:8083)
curl http://localhost:8080/api/v1/goals/ -H "Authorization: Bearer <token>"

# Internal endpoints should be blocked
curl http://localhost:8080/internal/users/1   # Should return 403
```

---

### Phase 7: Testing & Cleanup (Day 8-9)

#### Step 7.1 — Test each service in isolation

For each service, verify:
- [ ] Service starts without errors
- [ ] All its own endpoints work
- [ ] JWT validation works correctly
- [ ] Database tables are created in the correct database

#### Step 7.2 — Test inter-service communication

- [ ] Create a goal (Core) → notification appears (Notification service)
- [ ] Create a user (Auth-User) → ACCOUNT_CREATED notification sent
- [ ] Submit a performance review → audit log created in auth_user_db
- [ ] Scheduler runs → correctly fetches goals from Core and users from Auth-User

#### Step 7.3 — Test through the API Gateway

- [ ] All routes work through port 8080
- [ ] `/internal/**` endpoints are blocked from external access
- [ ] JWT validation works at gateway level
- [ ] CORS headers are present in responses

#### Step 7.4 — Seed data

Split your current `data.sql` into 3 files:

| File | Database | Contains |
|------|----------|----------|
| `auth-user-service/src/main/resources/data.sql` | auth_user_db | Users, AuditLogs |
| `notification-service/src/main/resources/data.sql` | notification_db | Notifications |
| `core-service/src/main/resources/data.sql` | core_db | Goals, ReviewCycles, PerformanceReviews, Feedback, Reports |

> **Important:** In the core_db data.sql, you'll reference `userId` values as plain Long IDs (not JPA references), so make sure the IDs match what you seeded in auth_user_db.

#### Step 7.5 — Cleanup

- [ ] Remove unused imports in all files
- [ ] Ensure no entity references an entity from another service via JPA
- [ ] Verify all `@ManyToOne` User references have been replaced with `Long userId`
- [ ] Remove the old monolith's `data.sql` or mark it as legacy
- [ ] Confirm each service's `pom.xml` only has the dependencies it needs

---

## 6. Database Split Plan

Here's exactly which tables go into which database. The key rule is: **each service owns its tables, and no service touches another service's tables directly**. Anywhere you see `user_id` in bold, that used to be a foreign key pointing to the `users` table. After the split, it's just a plain number — no FK constraint, no JPA relationship. It's like storing a phone number: you know it refers to a person, but you don't have their contact card locally. If you need their details, you call them (make an API call).

### auth_user_db

| Table | Columns (key ones) |
|-------|-------------------|
| `users` | user_id, name, email, password_hash, role, department, manager_id, status |
| `audit_logs` | audit_id, user_id, action, details, related_entity_type, related_entity_id, timestamp, status, ip_address |

### notification_db

| Table | Columns (key ones) |
|-------|-------------------|
| `notifications` | notification_id, **user_id** (Long, no FK), type, message, status, priority, action_required, read_date, created_date |

> `user_id` here is NOT a foreign key — it's just a Long value referencing a user in auth_user_db. No cross-database FK constraints.

### core_db

| Table | Columns (key ones) |
|-------|-------------------|
| `goals` | goal_id, title, **assigned_to_user_id** (Long), **assigned_manager_id** (Long), status, category, priority, ... |
| `goal_completion_approvals` | approval_id, goal_id, **approved_by_user_id** (Long), decision, ... |
| `performance_reviews` | review_id, **user_id** (Long), cycle_id, self_assessment, manager_feedback, ... |
| `review_cycles` | cycle_id, title, start_date, end_date, status, ... |
| `performance_review_goals` | link_id, review_id, goal_id, ... |
| `feedback` | feedback_id, review_id, goal_id, **given_by_user_id** (Long), comments, ... |
| `reports` | report_id, **generated_by_user_id** (Long), scope, metrics, format, ... |

> All `user_id` columns in core_db are plain Longs — NOT foreign keys to another database.

---

## 7. Inter-Service API Contracts

These are the "private APIs" that services expose to each other. Think of them as agreements: "If you call me at this URL with this data, I promise to give you back this response." Both sides need to agree on the request/response format, which is why we define DTOs for these.

### Auth-User Service exposes (for internal use):

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/internal/users/{userId}` | — | `ApiResponse<UserSummaryDTO>` |
| GET | `/internal/users/by-manager/{managerId}` | — | `ApiResponse<List<UserSummaryDTO>>` |
| POST | `/internal/audit-logs` | `AuditLogRequest` | `ApiResponse<Void>` |
| GET | `/internal/auth/validate` | Authorization header | `ApiResponse<TokenValidationResponse>` |

### Notification Service exposes (for internal use):

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/internal/notifications` | `NotificationRequest` | `ApiResponse<Void>` |

### Core Service exposes (for internal use):

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/internal/goals/pending-approval?pendingDays=2` | — | `ApiResponse<List<GoalSummaryDTO>>` |
| GET | `/internal/goals/pending-completion?pendingDays=3` | — | `ApiResponse<List<GoalSummaryDTO>>` |
| GET | `/internal/review-cycles/active` | — | `ApiResponse<ReviewCycleSummaryDTO>` |

### DTO Duplication Strategy

Since there's no shared-dto module, you'll need to **duplicate DTOs** across services. Here's where each DTO should be created:

#### DTOs in auth-user-service:

```java
// UserSummaryDTO — returned to other services
public class UserSummaryDTO {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String department;
    private Long managerId;
}

// AuditLogRequest — received from other services
public class AuditLogRequest {
    private Long userId;
    private String action;
    private String details;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String status;
    private String ipAddress;
}

// ApiResponse<T> — standard wrapper
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
}
```

#### DTOs in notification-service:

```java
// NotificationRequest — received from other services
public class NotificationRequest {
    private Long userId;
    private String type;       // NotificationType as string
    private String message;
    private String priority;
    private boolean actionRequired;
}

// UserSummaryDTO — DUPLICATE (same as auth-user-service)
// GoalSummaryDTO — received from core service
// ReviewCycleSummaryDTO — received from core service
// ApiResponse<T> — DUPLICATE (standard wrapper)
```

#### DTOs in core-service:

```java
// UserSummaryDTO — DUPLICATE (same as auth-user-service)
// NotificationRequest — DUPLICATE (sent to notification service)
// AuditLogRequest — DUPLICATE (sent to auth-user service)

// GoalSummaryDTO — returned to notification service (for scheduler)
public class GoalSummaryDTO {
    private Long goalId;
    private String title;
    private String status;
    private Long assignedToUserId;
    private Long assignedManagerId;
    private LocalDate createdDate;
}

// ReviewCycleSummaryDTO — returned to notification service (for scheduler)
public class ReviewCycleSummaryDTO {
    private Long cycleId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}

// ApiResponse<T> — DUPLICATE (standard wrapper)
```

> **Why duplicate instead of sharing?** For a 3-service project, duplication is simpler than managing a shared library. It avoids Maven dependency headaches and lets each service evolve independently. If a DTO changes, you only update it where needed.

---

## 8. Configuration Reference

### Ports

| Service | Port |
|---------|------|
| Eureka Discovery Server | 8761 |
| API Gateway | 8080 |
| Auth + User Service | 8081 |
| Notification Service | 8082 |
| Core Service | 8083 |

### Shared Environment Variables

All services need these in their `.env`:

```
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET=MySecretKeyForPerformanceTrackApp2026VeryLongSecretKey
```

> The JWT_SECRET **must be identical** across all services. Otherwise Auth-User generates a token that Core/Notification can't validate. Think of it like a shared password between friends — if Auth-User creates a secret message (JWT) using password "ABC", then Core Service also needs to know "ABC" to read that message. If Core Service has a different password, it'll say "invalid token" and reject perfectly valid requests.

### Startup Order

> **Why does order matter?** Because when Core Service starts, Spring might immediately try to healthcheck the Auth-User Service or the scheduler in Notification Service might try to fetch data on startup. If those services aren't running yet, you'll get connection errors. Starting in this order avoids that.

1. **discovery-server** (8761) — start FIRST, everyone registers here
2. **auth-user-service** (8081) — start second, others depend on it
3. **notification-service** (8082) — needs auth-user for user lookups
4. **core-service** (8083) — needs both auth-user and notification
5. **api-gateway** (8080) — start last, routes to all others

> **Tip:** After starting Eureka, visit `http://localhost:8761` in your browser. You'll see the Eureka dashboard. As you start each service, refresh the page — you should see them appear in the "Instances currently registered" table. If a service doesn't show up, check that its `eureka.client.service-url.defaultZone` matches and that `spring.application.name` is set.

---

## 9. Common Pitfalls

| Pitfall | How to Avoid |
|---------|-------------|
| **JPA entity references across services** | Replace ALL `@ManyToOne User` with `Long userId`. No cross-database JPA relationships. |
| **Circular REST calls** | Core → Notification is fine. Notification → Core (for scheduler) is fine. But never create a loop where A calls B which calls A in the same request. |
| **JWT secret mismatch** | Use the same `JWT_SECRET` env variable across all services. |
| **Feign call failure crashes the request** | Wrap non-critical Feign calls (like notifications) in try-catch. Let critical ones (user validation) propagate. |
| **Port conflicts** | Make sure each service runs on a different port. |
| **data.sql foreign keys** | Core service data.sql can't reference users by FK. Just use the matching userId Long values. |
| **Missing package rename** | Every file you copy must change its `package` declaration. IntelliJ's "Move" refactor helps. |
| **Gateway blocks internal endpoints** | Add the `/internal/**` block route in gateway config. Never expose internal endpoints. |
| **Service not available at startup** | If Core starts before Auth-User, Feign calls will fail. Start in the correct order: Eureka → Auth-User → Notification → Core → Gateway. |
| **Notification entity still has User JPA reference** | Replace `@ManyToOne User user` with `Long userId` in the Notification entity. |
| **Eureka not running** | If you start services before Eureka, they'll log "Cannot connect to Eureka" errors. They'll retry and register eventually, but it's cleaner to start Eureka first. |
| **`@FeignClient` name doesn't match `spring.application.name`** | If Core Service has `@FeignClient(name = "auth-service")` but the actual service registered as `auth-user-service`, Feign won't find it. The names must match EXACTLY. |
| **Forgot `@EnableFeignClients`** | Without this annotation on your main class, Spring won't create proxy beans for your `@FeignClient` interfaces. You'll get a "No qualifying bean" error at startup. |
| **Gateway still using hardcoded `http://localhost:port`** | Use `lb://service-name` in gateway routes to leverage Eureka. The `lb://` prefix is what tells Gateway to use Eureka for discovery. |
| **Eureka dashboard shows service as DOWN** | Check that the service's health endpoint is working. Spring Boot Actuator needs to be healthy for Eureka to mark the instance as UP. |

---

## 10. Final Checklist

### Per-Service Checklist

For each service, verify:

- [ ] Has its own `pom.xml` with only needed dependencies
- [ ] Has its own `application.properties` with correct port and database
- [ ] Has `eureka.client.service-url.defaultZone` configured
- [ ] Has `spring.application.name` set (this is what Eureka uses to register)
- [ ] Has its own `*Application.java` main class
- [ ] Main class has `@EnableFeignClients` (if it uses Feign)
- [ ] Has its own `SecurityConfig.java`
- [ ] Has its own `GlobalExceptionHandler.java`
- [ ] No entity references entities from another service via JPA
- [ ] All `@ManyToOne User` replaced with `Long userId`
- [ ] Feign clients created for each external service it calls (no hardcoded URLs — uses Eureka)
- [ ] `@FeignClient(name = "...")` names match target service's `spring.application.name`
- [ ] Internal endpoints (`/internal/**`) added for data other services need
- [ ] Package names updated from `com.project.performanceTrack` to service-specific package

### Integration Checklist

- [ ] Eureka dashboard (`http://localhost:8761`) shows all 4 services registered
- [ ] All 5 services start without errors (Eureka + 3 services + Gateway)
- [ ] Login through gateway returns a valid JWT
- [ ] JWT works across all services (same secret)
- [ ] Goal creation triggers notification in notification_db (Core → Notification via Feign)
- [ ] User creation triggers ACCOUNT_CREATED notification (Auth-User → Notification via Feign)
- [ ] Audit logs are created in auth_user_db when actions happen in core-service (Core → Auth-User via Feign)
- [ ] NotificationScheduler successfully fetches data from Core and Auth-User (via Feign)
- [ ] Gateway routes use `lb://` and resolve through Eureka (not hardcoded ports)
- [ ] `/internal/**` endpoints are blocked from external access via gateway
- [ ] All data.sql files have been split and IDs are consistent
- [ ] CORS works correctly through the gateway
- [ ] Error handling works when a downstream service is unavailable
