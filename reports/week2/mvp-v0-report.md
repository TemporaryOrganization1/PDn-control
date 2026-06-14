# MVP v0 Report

## Overview

This document outlines the current state of our Minimum Viable Product (version 0), including the technology stack, architecture decisions, and implementation progress. The system is designed to perform automated vulnerability assessments of websites, providing users with actionable security insights through a modern web interface.

## Setup & Technology Stack

Our team selected **Go** and **Node.js** as the primary backend languages after careful consideration of their respective strengths. 

**Node.js** was chosen specifically for handling browser automation and web crawling tasks. Its event-driven, non-blocking architecture makes it exceptionally well-suited for Puppeteer-based workflows, where multiple browser instances need to be managed concurrently. The rich ecosystem of npm packages also accelerates development when working with headless browsers and DOM manipulation.

**Go** was selected for the remaining backend services due to its excellent performance characteristics, strong typing, and built-in concurrency primitives. Go's compiled nature and efficient resource utilization make it ideal for services that need to handle high-throughput operations like IP geolocation lookups. The language's simplicity also reduces the likelihood of runtime errors in production.

It is worth noting that Node.js does not represent a significant production risk for this product, as raw execution speed is not a critical requirement. The browser automation tasks are inherently I/O-bound, meaning the overhead of the JavaScript runtime is negligible compared to network latency and page rendering time.

We containerize all services using **Docker**, which ensures consistent behaviour across development, staging, and production environments. Each microservice runs in its own isolated container with explicitly defined dependencies.

For API documentation and live testing, we use **Swagger** with the **OpenAPI** specification. This allows developers and stakeholders to explore and test endpoints directly from a browser-based interface during development, significantly speeding up the integration and debugging process.

---

## Architecture

Our backend follows a microservices architecture consisting of three distinct service types. This separation of concerns allows independent scaling, deployment, and development of each component.

### 1. GeoIP Microservice

**Purpose:**  
Determines the country code associated with a given IP address.

**Technology:** Written in **Go**, deployed as a standalone Docker container.

**How it works:**  
The service accepts IP addresses via a simple REST API and returns the corresponding country code (e.g., "US", "DE", "RU"). It uses the MaxMind GeoIP2 database for lookups, which provides highly accurate geolocation data.

**Why it matters:**  
The GeoIP service enables us to flag websites hosted on foreign IP addresses. This is important for users who want to be alerted when a target website is hosted outside their expected jurisdiction, which may indicate increased risk or legal considerations.

**Dependencies:**  
This service is required by the Crawler Worker microservices, which call it before initiating a scan to enrich the results with geographic context.

---

### 2. Crawler Worker Microservice

**Purpose:**  
This is the heart of our product. It performs the actual website vulnerability scanning.

**Technology:** Written in **Node.js**, leveraging Puppeteer for headless browser control.

**How it works:**  
Each Crawler Worker instance contains a browser automation tool, a set of predefined security check scripts, and an AI agent for deeper analysis. Workers receive scan requests from the Main Backend, execute the requested checks, and return results asynchronously.

**Scan Modes:**

- **Fast Check:**  
  A lightweight scan that runs without the AI agent. It executes a predefined set of automated checks — such as inspecting HTTP headers, checking for outdated software versions, and identifying common misconfigurations. Results are returned quickly, typically within seconds.

- **Detail Check:**  
  A comprehensive scan that engages the AI agent. The AI analyses the website more deeply — examining page structure, JavaScript behaviour, form handling, and other nuanced indicators to identify vulnerabilities that rule-based scanners might miss. This scan takes longer but provides a more thorough assessment.

**Progress Reporting:**  
A key feature of the Crawler Worker is its ability to send real-time progress updates to the Main Backend. As each step of the scan is completed, the worker emits a progress event containing a percentage complete and a description of the current task. This enables the frontend to display a live progress bar to the user, improving the user experience and providing transparency into long-running operations.

**State Management:**  
Progress tracking is made possible by storing a unique `Request-ID` for each scan. This ID is generated by the Main Backend and passed to the worker. All communication related to a specific scan is tagged with this ID, allowing the system to correlate messages across services.

**Scalability:**  
The Crawler Worker pool is horizontally scalable. We can increase the number of worker instances to handle higher request volumes or improve throughput. New instances can be spun up as Docker containers and automatically register with the Main Backend.

---

### 3. Main Backend Microservice

**Purpose:**  
Acts as the central coordinator and API gateway for the entire system.

**Technology:** Written in **Go**, deployed as a Docker container with potential for cluster deployment.

**Responsibilities:**

- **Orchestration (not control):**  
  The Main Backend unifies all Crawler Worker instances and routes scan requests to available workers. However, it does not directly control the workers — they operate independently and communicate results back. This loose coupling improves resilience.

- **API Gateway:**  
  It exposes a unified REST API and WebSocket endpoint to the frontend. Clients interact only with the Main Backend and never directly with the workers or GeoIP service, maintaining a clean separation between the frontend and internal services.

- **Authentication API:**  
  Handles user registration, login, session management, and token-based authentication. All protected endpoints require a valid session token.

- **History API:**  
  Stores and retrieves past scan results, allowing users to review previous vulnerability assessments.

- **Account & Payment API (planned):**  
  Will manage user profiles, subscription tiers, and payment processing. These features are currently in development and will be included in a future version.

- **Real-time Communication:**  
  The service uses **WebSockets** to push scan progress updates to connected clients. When a Crawler Worker sends a progress event, the Main Backend forwards it to the appropriate WebSocket connection, enabling the frontend to update the UI in real time without polling.

**Future Scalability:**  
If request volume increases, the Main Backend can be deployed as a cluster behind a load balancer. Session state and WebSocket connections can be managed with a shared Redis store to ensure seamless failover and distribution.

---

## Architecture Diagram

**Target Architecture:**  
```
[ Main Backend Cluster ]  ←→  [ Crawler Worker Clusters ]  ←→  [ GeoIP Cluster ]
```

**Current Implementation (MVP v0):**  
```
[ Main Backend (single instance) ]  ←→  [ Crawler Worker Pool ]  ←→  [ GeoIP (single instance) ]
```

The current implementation uses single instances with a worker pool for the crawler layer. Clustering for all components is planned for future versions as we move toward production readiness.

---

## Libraries & Dependencies

| Library | Purpose |
|---|---|
| **Puppeteer** | Headless Chrome browser automation for website scanning |
| **MaxMind GeoIP2** | IP geolocation database for country code lookups |
| **PostgreSQL Client** | Database connectivity for persistent storage of users, scan history, and configuration |

---

## License

This project is released under the **MIT License**, a permissive open-source license that allows unrestricted use, modification, and distribution, provided the original copyright notice is retained. This choice supports community adoption and contribution.