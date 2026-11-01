# Multi-Container Task Management Application - Architecture



## 1. Overview



This project implements a containerized task management application using Docker Compose. It separates the frontend, backend API, database, and reverse proxy into independent services.



## 2. System Architecture



```text

                  USER / BROWSER

                        |

                        | HTTP :8081

                        v

              +---------------------+

              |    NGINX GATEWAY    |

              |   task-nginx        |

              +---------------------+

                   /          \\

                  /            \\

          Frontend Route     API Route

                /                \\

               v                  v

      +----------------+  +----------------+

      | NGINX FRONTEND |  | EXPRESS BACKEND|

      | task-frontend  |  | task-backend   |

      | Port 8080      |  | Port 5000      |

      +----------------+  +----------------+

                                  |

                                  | PostgreSQL :5432

                                  v

                         +------------------+

                         |   POSTGRESQL     |

                         |  task-database   |

                         +------------------+

                                  |

                                  v

                         Persistent Volume

                         postgres_data

```



## 3. Technology Stack



| Component        | Technology          |

| ---------------- | ------------------- |

| Frontend         | React, Vite         |

| Frontend Server  | Nginx               |

| Backend          | Node.js, Express    |

| Database         | PostgreSQL 17       |

| Containerization | Docker              |

| Orchestration    | Docker Compose      |

| Reverse Proxy    | Nginx               |

| Testing          | Node.js Test Runner |



## 4. Services



### Gateway - task-nginx



* Exposes the application on host port 8081.

* Routes `/` to the frontend.

* Routes `/api/` to the backend.

* Provides a health endpoint.



### Frontend - task-frontend



* Serves the React production build.

* Runs using an unprivileged Nginx container.

* Communicates with the backend through the gateway.



### Backend - task-backend



* Provides REST API endpoints.

* Performs input validation.

* Connects to PostgreSQL using the internal Docker network.

* Includes health checks and graceful shutdown handling.



### Database - task-database



* Runs PostgreSQL 17.

* Stores task records.

* Uses a persistent Docker volume.

* Initializes the schema and seed data on first startup.



## 5. Network Architecture



All services communicate through:



`task-management-network`



Only the Nginx gateway publishes a host port:



`8081:8080`



The frontend, backend, and database ports remain internal to the Docker network.



## 6. Persistent Storage



Docker named volume:



`task-management-postgres-data`



This preserves PostgreSQL data when containers are recreated.



## 7. Security Controls



* Non-root execution for application containers.

* Dropped Linux capabilities for frontend and backend.

* Read-only root filesystems for frontend, backend, and gateway.

* `no-new-privileges` security option.

* Temporary writable filesystems where required.

* Database credentials supplied through environment variables.

* Backend request-body size limit.

* Input validation and parameterized SQL queries.

* No direct host-port exposure for backend or database.



## 8. Health Monitoring



Docker Compose health checks monitor:



* Gateway availability.

* Frontend availability.

* Backend API availability.

* PostgreSQL readiness.



Backend startup depends on database health.



## 9. Resource Management



| Service  | Memory Limit | CPU Limit |

| -------- | -----------: | --------: |

| Backend  |      512 MiB |     1 CPU |

| Frontend |      256 MiB |   0.5 CPU |

| Gateway  |      128 MiB |   0.5 CPU |

| Database |      512 MiB |     1 CPU |



Log rotation is configured to limit container log growth.



## 10. Application Access



* Application: `http://localhost:8081`

* Gateway health: `http://localhost:8081/health`

* Tasks API: `http://localhost:8081/api/tasks`



## 11. Deployment Workflow



1. Build application images.

2. Create the Docker network and persistent volume.

3. Start PostgreSQL.

4. Wait for database health.

5. Start the backend and frontend.

6. Start the Nginx gateway.

7. Verify service health.

8. Access the application through port 8081.






