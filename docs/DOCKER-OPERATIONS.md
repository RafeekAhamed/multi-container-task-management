# Docker Operations Guide



## 1. Prerequisites



* Docker Desktop with Linux containers enabled.

* Docker Engine.

* Docker Compose v2 or later.

* Git.

* PowerShell or a compatible terminal.



## 2. Project Setup



Clone the repository:



```powershell

git clone https://github.com/RafeekAhamed/multi-container-task-management.git

cd multi-container-task-management

```



Create the environment file:



```powershell

Copy-Item .env.example .env

```



Edit `.env` and replace the example database password with a strong local password.



## 3. Build Docker Images



Build all service images:



```powershell

docker compose build

```



Build without using cached layers:



```powershell

docker compose build --no-cache

```



## 4. Start the Application



Start all services in detached mode:



```powershell

docker compose up -d

```



Check service status:



```powershell

docker compose ps

```



Access the application:



`http://localhost:8081`



## 5. Health Monitoring



Check service health:



```powershell

docker compose ps

```



Check gateway health:



```powershell

Invoke-RestMethod http://localhost:8081/health

```



Check backend health through the gateway:



```powershell

Invoke-RestMethod http://localhost:8081/api/tasks

```



## 6. Container Logs



View logs from all services:



```powershell

docker compose logs

```



Follow live logs:



```powershell

docker compose logs -f

```



View individual service logs:



```powershell

docker compose logs backend

docker compose logs frontend

docker compose logs database

docker compose logs nginx

```



Display the latest 100 log lines:



```powershell

docker compose logs --tail 100

```



## 7. Container Resource Monitoring



Display real-time resource usage:



```powershell

docker stats

```



Display a one-time resource snapshot:



```powershell

docker stats --no-stream

```



Inspect container configuration:



```powershell

docker inspect task-backend

docker inspect task-frontend

docker inspect task-nginx

docker inspect task-database

```



## 8. Database Operations



Open a PostgreSQL shell:



```powershell

docker compose exec database psql -U app_user -d task_management

```



List tables:



```sql

\\dt

```



View task records:



```sql

SELECT * FROM tasks ORDER BY created_at DESC;

```



Count task records:



```sql

SELECT COUNT(*) FROM tasks;

```



Exit PostgreSQL:



```sql

\\q

```



## 9. Service Management



Restart all project services:



```powershell

docker compose restart

```



Restart only the backend:



```powershell

docker compose restart backend

```



Rebuild and recreate only the backend:



```powershell

docker compose up -d --build --no-deps backend

```



Stop project containers:



```powershell

docker compose down

```



The named PostgreSQL volume is preserved by this command.



## 10. Troubleshooting



### Check Docker Compose configuration



```powershell

docker compose config --quiet

```



### Check container status



```powershell

docker compose ps -a

```



### Inspect backend logs



```powershell

docker compose logs --tail 100 backend

```



### Inspect database logs



```powershell

docker compose logs --tail 100 database

```



### Check Docker networks



```powershell

docker network inspect task-management-network

```



### Check persistent volumes



```powershell

docker volume inspect task-management-postgres-data

```



### Verify gateway port



```powershell

Test-NetConnection localhost -Port 8081

```



## 11. Complete Cleanup



Stop and remove project containers and the Compose network:



```powershell

docker compose down

```



Remove project containers, network, and PostgreSQL data volume:



```powershell

docker compose down -v

```



**Warning:** The `-v` option permanently deletes the project's PostgreSQL persistent data. Do not use it unless you intentionally want to reset the database.



## 12. Operational Notes



* Only the Nginx gateway publishes a host port.

* Frontend, backend, and database communicate over the internal Docker network.

* PostgreSQL data is stored in a named volume.

* Health checks monitor all four services.

* Container resource limits and log rotation are configured in Docker Compose.

* Environment files containing secrets must never be committed to Git.




