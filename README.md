# Project 02 — Docker Containerization

## Multi-Container Task Management Application

A production-oriented containerized task management application built using **React, Node.js, Express, PostgreSQL, Nginx, Docker, and Docker Compose**.

The project demonstrates multi-container orchestration, reverse proxy configuration, persistent storage, container health checks, network isolation, security hardening, and resource management.

---

## Architecture

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │   localhost:8081    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Nginx Gateway    │
                    │      Port 8080      │
                    │    Host: 8081       │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Frontend Nginx   │      │   Backend API    │
        │    Port 8080     │      │   Express :5000  │
        │                  │      │                  │
        │ React + Vite     │      │ REST API         │
        └──────────────────┘      └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │   PostgreSQL 17  │
                                  │     Port 5432    │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Docker Volume   │
                                  │ Persistent Data  │
                                  └──────────────────┘

                  Docker Bridge Network
                  task-management-network
```

### Application services

| Service  | Technology        | Internal Port | Purpose                   |
| -------- | ----------------- | ------------: | ------------------------- |
| nginx    | Nginx             |          8080 | Gateway and reverse proxy |
| frontend | React + Nginx     |          8080 | Web application           |
| backend  | Node.js + Express |          5000 | REST API                  |
| database | PostgreSQL 17     |          5432 | Persistent data storage   |

Only the gateway is published to the host:

**Application URL:** http://localhost:8081

Backend, frontend, and database ports are not directly published to the host.

---

## Technology Stack

### Frontend

* React 19
* Vite 8
* Lucide React
* Oxlint
* Nginx

### Backend

* Node.js 24
* Express 5
* PostgreSQL Node.js Driver (`pg`)
* Helmet
* CORS
* Morgan
* dotenv

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL 17
* Nginx
* Linux containers
* Docker bridge networking
* Named Docker volumes

---

## Key Features

* Multi-container application architecture.
* React-based task management dashboard.
* RESTful API using Express.
* PostgreSQL relational database.
* Nginx reverse proxy.
* Docker Compose orchestration.
* Persistent database storage.
* Container health checks.
* Service dependency management.
* Internal Docker DNS service discovery.
* Non-root container execution.
* Read-only root filesystems where configured.
* Linux capability restrictions.
* CPU and memory limits.
* PID limits.
* Docker log rotation.
* API request validation.
* Automated backend tests.

---

## Project Structure

```text
01-Multi-Container-Application/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── routes/
│   │   │   └── tasks.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── test/
│   │   └── app.test.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   └── init/
│       ├── 01-schema.sql
│       └── 02-seed.sql
│
├── docs/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── nginx/
│   ├── conf.d/
│   │   └── default.conf
│   └── Dockerfile
│
├── screenshots/
│
├── .env.example
├── .gitignore
└── docker-compose.yml
```

---

## Prerequisites

Install the following tools:

* Docker Desktop
* Docker Engine with Linux container support
* Docker Compose
* Git

For local development outside Docker:

* Node.js 24
* npm

---

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

Navigate into the project:

```bash
cd 01-Multi-Container-Application
```

### 2. Configure environment variables

Create the root environment file:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS**

```bash
cp .env.example .env
```

Edit `.env`:

```env
POSTGRES_DB=task_management
POSTGRES_USER=app_user
POSTGRES_PASSWORD=your_unique_secure_password
```

Use a unique, strong password for your local environment.

The backend receives its database configuration from Docker Compose. Its container connects to PostgreSQL using the service name `database`.

### 3. Build and start containers

```bash
docker compose up --build -d
```

### 4. Verify running containers

```bash
docker compose ps
```

All four services should eventually report healthy status.

### 5. Access the application

Open:

```text
http://localhost:8081
```

### 6. Check application health

```powershell
Invoke-RestMethod http://localhost:8081/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

---

## REST API Endpoints

Base URL:

```text
http://localhost:8081/api/tasks
```

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| GET    | `/api/tasks`     | Retrieve all tasks |
| GET    | `/api/tasks/:id` | Retrieve a task    |
| POST   | `/api/tasks`     | Create a task      |
| PUT    | `/api/tasks/:id` | Update a task      |
| DELETE | `/api/tasks/:id` | Delete a task      |
| GET    | `/health`        | API health check   |

### Create a task

```json
{
  "title": "Configure Docker",
  "description": "Build a multi-container application"
}
```

### Update a task

```json
{
  "title": "Configure Docker",
  "description": "Complete container security configuration",
  "status": "completed"
}
```

Supported task statuses:

* `pending`
* `in_progress`
* `completed`

### API validation

The backend implements:

* Required title validation.
* Maximum title length of 200 characters.
* Description type validation.
* Task status validation.
* Positive integer task ID validation.
* JSON object validation.
* Request body size limit of 10 KB.
* Malformed JSON handling.
* Centralized error handling.
* HTTP 404 handling.

---

## Database

**Database:** PostgreSQL 17

**Database name:** `task_management`

**Table:** `tasks`

| Column      | Type         | Description           |
| ----------- | ------------ | --------------------- |
| id          | BIGINT       | Identity primary key  |
| title       | VARCHAR(200) | Task title            |
| description | TEXT         | Task description      |
| status      | VARCHAR(20)  | Task status           |
| created_at  | TIMESTAMPTZ  | Creation timestamp    |
| updated_at  | TIMESTAMPTZ  | Last update timestamp |

### Indexes

* `idx_tasks_status`
* `idx_tasks_created_at`

### Persistent storage

Docker named volume:

```text
task-management-postgres-data
```

Container mount:

```text
/var/lib/postgresql/data
```

Database initialization scripts are mounted read-only:

```text
/docker-entrypoint-initdb.d
```

The named volume preserves PostgreSQL data when the database container is recreated.

---

## Docker Security Hardening

The project implements multiple container security controls.

| Security Control          | Backend | Frontend | Gateway | Database        |
| ------------------------- | ------- | -------- | ------- | --------------- |
| Non-root execution        | Yes     | Yes      | Yes     | PostgreSQL user |
| Drop capabilities         | ALL     | ALL      | ALL     | Not configured  |
| Read-only root filesystem | Yes     | Yes      | Yes     | Not configured  |
| no-new-privileges         | Yes     | Yes      | Yes     | Yes             |
| Health check              | Yes     | Yes      | Yes     | Yes             |
| Resource limits           | Yes     | Yes      | Yes     | Yes             |

Additional backend controls:

* Temporary writable `/tmp` filesystem.
* JSON request size restriction.
* Helmet security middleware.
* Parameterized PostgreSQL queries.
* Centralized error handling.

Frontend and gateway use temporary filesystems for Nginx runtime directories.

**Note:** Database hardening differs from the application containers because PostgreSQL requires writable persistent storage and its entrypoint manages its user privileges.

---

## Resource Management

| Service   | Memory Limit |  CPU Limit | PID Limit |
| --------- | -----------: | ---------: | --------: |
| Backend   |       512 MB |      1 CPU |       100 |
| Frontend  |       256 MB |    0.5 CPU |        50 |
| Gateway   |       128 MB |    0.5 CPU |        50 |
| Database  |       512 MB |      1 CPU |       100 |
| **Total** | **1,408 MB** | **3 CPUs** |   **300** |

### Log rotation

All four services use the Docker `json-file` logging driver.

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

This limits individual log files to 10 MB and retains up to three files per container.

---

## Health Checks and Networking

### Health checks

Each service has a Docker health check.

* PostgreSQL: `pg_isready`
* Backend: `/health`
* Frontend: Nginx `/health`
* Gateway: Nginx `/health`

Docker Compose uses health-based service dependencies to control startup order.

### Internal networking

Network:

```text
task-management-network
```

Driver:

```text
bridge
```

Docker service discovery allows containers to communicate using service names:

```text
database:5432
backend:5000
frontend:8080
```

The application does not rely on fixed container IP addresses.

---

## Automated Testing

The backend uses Node.js's built-in test runner.

Run tests locally:

```bash
cd backend
npm install
npm test
```

### Test coverage

The current test suite contains 10 API tests:

1. Health endpoint.
2. Unknown route handling.
3. Malformed JSON rejection.
4. Oversized request rejection.
5. Invalid task ID rejection.
6. Missing task title rejection.
7. Maximum title length validation.
8. Description type validation.
9. Invalid task status rejection.
10. Array request body rejection.

### Latest test results

```text
tests 10
suites 1
pass 10
fail 0
cancelled 0
skipped 0
```

**Result: 10/10 tests passed.**

These tests validate request handling and error responses without requiring a live PostgreSQL connection for the tested invalid requests.

---

## Useful Docker Commands

### View container status

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f
```

### View individual service logs

```bash
docker compose logs -f backend
```

### Restart services

```bash
docker compose restart
```

### Stop containers

```bash
docker compose down
```

### Rebuild application

```bash
docker compose up --build -d
```

### Inspect database volume

```bash
docker volume inspect task-management-postgres-data
```

### View resource consumption

```bash
docker stats
```

**Data safety:** `docker compose down` preserves named volumes. Avoid `docker compose down -v` unless you intentionally want to delete the PostgreSQL volume and its data.

---

## Verification Results

The following checks have been performed during project validation:

| Verification                     | Result       |
| -------------------------------- | ------------ |
| Docker Compose configuration     | Passed       |
| Four containers healthy          | Passed       |
| Backend API health               | Passed       |
| Frontend health                  | Passed       |
| PostgreSQL health                | Passed       |
| CRUD operations                  | Passed       |
| API input validation             | Passed       |
| Automated backend tests          | 10/10 passed |
| Persistent volume mount          | Passed       |
| Docker network connectivity      | Passed       |
| Docker DNS service discovery     | Passed       |
| Gateway-to-backend connectivity  | Passed       |
| Gateway-to-frontend connectivity | Passed       |
| Public HTTP endpoint             | HTTP 200     |
| Container security inspection    | Passed       |
| Resource limit inspection        | Passed       |
| Log rotation inspection          | Passed       |

---

## Learning Outcomes

This project demonstrates practical experience with:

* Docker image creation and containerization.
* Multi-container application architecture.
* Docker Compose orchestration.
* Nginx reverse proxy configuration.
* React frontend deployment.
* Node.js REST API development.
* PostgreSQL database integration.
* Docker bridge networking.
* Container DNS service discovery.
* Persistent volumes.
* Container health checks.
* Linux container security.
* Resource constraints.
* Application testing and runtime validation.

---

## Future Improvements

* GitHub Actions CI/CD pipeline.
* Automated Docker image publishing to GHCR.
* Container vulnerability scanning.
* Docker Compose secrets.
* Production-grade monitoring and alerting.
* Database backup and recovery automation.
* Deployment to Azure Container Apps or Azure Kubernetes Service.

---

## Author

**Rafeek Ahamed M**

DevOps Engineer | Azure Cloud Engineer

* GitHub: https://github.com/RafeekAhamed
* LinkedIn: https://linkedin.com/in/rafeek-ahamed-devops
* Portfolio: https://rafeek.rafeekahamed046.workers.dev

---

**Project 02 — Docker Containerization**

*Building secure, maintainable, and scalable multi-container applications.*
