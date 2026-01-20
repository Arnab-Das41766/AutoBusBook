# AutoBusBook System Architecture (DFD)

This document visualizes the **AutoBusBook** system architecture and data flow, structured according to the reference whiteboard sketch provided. It includes a high-level Context Diagram (Level 0) and a detailed Data Flow Diagram (Level 1).

## Level 0: Context Diagram

High-level interaction between the System and external entities (Admin, User).

```mermaid
graph LR
    Admin[Admin]
    User[User]
    System((AutoBusBook System))

    Admin -- Manage Routes/Buses --> System
    System -- Reports/Dashboard --> Admin

    User -- Search/Book Tickets --> System
    System -- Ticket/Confirmation --> User
```

## Level 1: Data Flow Diagram

Detailed breakdown of processes including Authentication, Administration, and Booking flows.

```mermaid
graph TD
    %% Entities
    Admin[Admin]
    User[User]
    
    %% Data Stores / Subsystems
    LoginDB[(1.0 Login/Auth)]
    RegisterDB[(2.0 Registration)]
    
    %% Main System Components
    BusModule[Bus & Route Management]
    Operator[Bus Operator]
    ScheduleDb[(Schedules/Products)]
    
    %% Authentication Flow
    Admin -- Request Login --> LoginDB
    User -- Request Login --> LoginDB
    LoginDB -- Verify Credentials --> Admin
    LoginDB -- Verify Credentials --> User
    
    %% Registration Flow
    User -- New User --> RegisterDB
    RegisterDB -- Create Profile --> User
    RegisterDB -- Update/Delete --> User

    %% Admin Flow (Management)
    Admin -- Manage --> BusModule
    BusModule -- Has --> Operator
    Operator -- Has --> ScheduleDb
    
    %% User Flow (Booking)
    User -- Search/View --> ScheduleDb
    User -- Book Ticket --> ScheduleDb
    
    %% Relationships similar to sketch
    subgraph Backend Processes
        direction TB
        LoginDB
        RegisterDB
    end

    subgraph Core System
        direction TB
        BusModule
        Operator
        ScheduleDb
    end
    
    %% Connecting Flows
    LoginDB -.-> BusModule
    LoginDB -.-> ScheduleDb
```

## Detailed Component Breakdown

### 1.0 Authentication (Login)
-   **Inputs**: Email, Password (or OTP for Users).
-   **Process**: Verify credentials against `users` table.
-   **Outputs**: Session Token, Admin/User Access Rights.

### 2.0 Registration
-   **Inputs**: Name, Email, Phone, Age.
-   **Process**: Create new entry in `users` table. Check for duplicates.
-   **Outputs**: New User Profile.

### Core Modules (E-Commerce equivalent)
-   **Bus & Route Management**: Admin adds routes (`/admin/routes`) and manages buses.
-   **Bus Operator (Retailer equivalent)**: The entity providing the service (e.g., Zingbus, IntrCity).
-   **Schedules/Products**: The actual bookable items. Users "View" and "Buy" (Book) these.

### User Interaction
-   **View/Buy**: Users search for buses (`/api/search`) and complete bookings (`/api/book`).
