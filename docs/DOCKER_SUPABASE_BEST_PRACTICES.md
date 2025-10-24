# 🐳 Docker + Supabase Development Guide

## 📖 Overview

This document provides comprehensive best practices for using Docker and Supabase together in the Into The Wild project. It covers development workflows, deployment strategies, migration management, and operational procedures.

## 🚀 Quick Start

### **Option 1: Full Docker Stack (Recommended)**

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# Access services
# Frontend: http://localhost:8080 (when running)
# Backend: http://localhost:3003
# Database: localhost:54325
# Supabase Studio: npx supabase studio
```

### **Option 2: Supabase Local Development**

```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase
npx supabase start

# Access Studio: http://localhost:54323
npx supabase studio
```

## 🏗️ Architecture Overview

### **Current Stack**

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Docker)
- **Development**: Supabase CLI + Docker Compose
- **Deployment**: Docker containers

### **Service Ports**

- PostgreSQL: `54325` (mapped from 5432)
- Backend API: `3003` (mapped from 3001)
- OpenTripPlanner: `8080` (when enabled)
- Supabase API: `54321` (local development)
- Supabase Studio: `54323` (local development)

## 🔧 Development Workflows

### **1. Daily Development Workflow**

#### **A. Full Stack Development**

```bash
# 1. Start infrastructure
docker-compose up -d postgres backend

# 2. Start Supabase for additional services
npx supabase start

# 3. Generate types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# 4. Start frontend development
npm run dev
```

#### **B. Database-First Development**

```bash
# 1. Make changes in Supabase Studio
# 2. Generate migration from changes
npx supabase db diff --file feature_name

# 3. Apply to local database
npx supabase db push

# 4. Update TypeScript types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### **2. Migration Management**

#### **A. Creating New Migrations**

```bash
# Option 1: Generate from schema changes
npx supabase db diff --file feature_name

# Option 2: Create empty migration
npx supabase migration new feature_name

# Option 3: Direct SQL for Docker database
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -f migration.sql
```

#### **B. Applying Migrations**

```bash
# Local Supabase
npx supabase db push

# Production Supabase
npx supabase db push --include-all --project-ref your-project-id

# Docker database only
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -f supabase/migrations/your_migration.sql
```

#### **C. Migration Best Practices**

```bash
# Always test migrations first
npx supabase db reset  # Clean slate
npx supabase db push   # Apply migrations

# Backup before major changes
docker exec into-the-wild-postgres pg_dump -U postgres -d into_the_wild > backup_$(date +%Y%m%d_%H%M%S).sql

# Version control migrations
git add supabase/migrations/
git commit -m "feat: add new migration for distance column"
```

## 🐳 Docker Operations

### **1. Container Management**

#### **A. Starting Services**

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres backend

# Start with rebuild
docker-compose up -d --build backend
```

#### **B. Monitoring and Logs**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# View specific service logs
docker-compose logs -f postgres | grep ERROR

# Check resource usage
docker stats
```

#### **C. Database Operations**

```bash
# Connect to database
docker exec -it into-the-wild-postgres psql -U postgres -d into_the_wild

# Run SQL queries
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -c "SELECT * FROM trek_events LIMIT 5;"

# Backup database
docker exec into-the-wild-postgres pg_dump -U postgres -d into_the_wild > backup.sql

# Restore database
docker exec -i into-the-wild-postgres psql -U postgres -d into_the_wild < backup.sql
```

### **2. Common Docker Issues**

#### **A. Port Conflicts**

```bash
# Check what's using ports
netstat -ano | findstr :5432
netstat -ano | findstr :3001

# Change ports in docker-compose.yml
ports:
  - "54326:5432"  # Different port
  - "3004:3001"
```

#### **B. Volume Issues**

```bash
# Remove volumes (⚠️ DESTROYS DATA)
docker-compose down -v

# Check volume usage
docker volume ls
docker volume inspect into-the-wild_pgdata

# Clean up unused volumes
docker volume prune
```

#### **C. Build Issues**

```bash
# Rebuild specific service
docker-compose build --no-cache backend

# Clear Docker cache
docker system prune -a

# Restart with clean state
docker-compose down
docker-compose up -d --build
```

## 🗄️ Database Management

### **1. Schema Management**

#### **A. Current Schema Status**

```sql
-- Check all tables
\dt

-- Check trek_events structure
\d+ trek_events

-- Verify distance column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trek_events' AND column_name = 'distance';
```

#### **B. Adding New Columns**

```sql
-- For Supabase migrations
npx supabase migration new add_user_preferences

# Edit the generated file, then apply
npx supabase db push

-- For Docker database only
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -c "ALTER TABLE users ADD COLUMN preferences JSONB;"
```

### **2. Data Operations**

#### **A. Seeding Data**

```bash
# Create seed file
echo "INSERT INTO master_packing_items (name, category) VALUES ('Water Bottle', 'Essentials');" > seed_packing_items.sql

# Apply to database
docker exec -i into-the-wild-postgres psql -U postgres -d into_the_wild < seed_packing_items.sql
```

#### **B. Testing Queries**

```bash
# Test trek events with distance
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -c "
SELECT name, location, difficulty, distance
FROM trek_events
WHERE distance > 10
ORDER BY distance DESC;
"

# Check registrations
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -c "
SELECT te.name, COUNT(tr.user_id) as registrations
FROM trek_events te
LEFT JOIN trek_registrations tr ON te.trek_id = tr.trek_id
GROUP BY te.trek_id, te.name
ORDER BY registrations DESC;
"
```

## 🚀 Deployment Strategies

### **1. Development Environment**

#### **A. Local Development**

```bash
# Start development stack
docker-compose up -d postgres
npx supabase start  # For auth and studio

# Environment configuration
cp .env.example .env.local
# Edit .env.local with:
# VITE_SUPABASE_URL=http://127.0.0.1:54321
# DATABASE_URL=postgresql://postgres:postgres@localhost:54325/into_the_wild
```

#### **B. Testing Environment**

```bash
# Use separate database for testing
docker-compose -f docker-compose.test.yml up -d

# Run tests
npm run test

# Reset test database
docker-compose -f docker-compose.test.yml down -v
```

### **2. Production Deployment**

#### **A. Docker Production Setup**

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${PROD_DB_NAME}
      POSTGRES_USER: ${PROD_DB_USER}
      POSTGRES_PASSWORD: ${PROD_DB_PASSWORD}
    volumes:
      - prod_pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: your-registry/backend:latest
    depends_on:
      - postgres
    environment:
      DATABASE_URL: ${DATABASE_URL}
    restart: unless-stopped
```

#### **B. Supabase Cloud Deployment**

```bash
# Deploy schema to production
npx supabase db push --include-all --project-ref your-prod-project-id

# Set production secrets
npx supabase secrets set DATABASE_URL=your_prod_connection_string

# Deploy edge functions
npx supabase functions deploy your-function --project-ref your-prod-project-id
```

## 🗺️ OpenTripPlanner (OTP) Setup

### **Current Status: Disabled (Fallback Active)**

The OTP service has been disabled due to missing OSM data files. Instead, the backend implements a **fallback routing system** using the Haversine distance formula.

### **✅ Working Solution**

- **Backend API**: `http://localhost:3003/api/routing/time`
- **Fallback Calculation**: Straight-line distance using Haversine formula
- **Status**: ✅ **Fully functional** without external dependencies

### **Re-enabling OTP (Future)**

When proper OSM data is available:

#### **1. Enable OTP Service**

```yaml
# In docker-compose.yml
opentripplanner:
  image: opentripplanner/opentripplanner:2.5.0
  container_name: into-the-wild-otp
  restart: always
  ports:
    - "8080:8080"
  volumes:
    - ./otp/graphs/karnataka:/var/opentripplanner/karnataka
  environment:
    - JAVA_TOOL_OPTIONS=-Xmx8G
  command: --build --serve /var/opentripplanner/karnataka
```

#### **2. Required Data Files**

- OSM data files (.pbf format) for the target region
- GTFS transit data (optional, for public transport)
- Proper build-config.json and router-config.json

#### **3. Example Setup**

```bash
# Download Karnataka OSM data
wget https://download.geofabrik.de/asia/india/karnataka-latest.osm.pbf -O otp/graphs/karnataka/karnataka.osm.pbf

# Update build-config.json with correct data paths
# Start OTP service
docker-compose up -d opentripplanner
```

## 🛠️ Troubleshooting Guide

### **1. Common Issues**

#### **A. Database Connection Issues**

```bash
# Check if database is running
docker-compose ps postgres

# Test connection
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -c "SELECT version();"

# Check database logs
docker-compose logs postgres | grep ERROR
```

#### **B. Migration Failures**

```bash
# Check migration status
npx supabase db status

# Reset and retry
npx supabase db reset
npx supabase db push

# Manual migration for Docker
docker cp your_migration.sql into-the-wild-postgres:/tmp/
docker exec into-the-wild-postgres psql -U postgres -d into_the_wild -f /tmp/your_migration.sql
```

#### **C. Backend Issues**

```bash
# Check backend logs
docker-compose logs backend

# Test backend health
curl http://localhost:3003/health

# Restart backend
docker-compose restart backend
```

#### **D. OTP Issues**

```bash
# Check OTP logs
docker-compose logs opentripplanner

# Verify data files exist
docker exec into-the-wild-otp ls -la /var/opentripplanner/karnataka/

# Check if graph was built
docker exec into-the-wild-otp ls -la /var/opentripplanner/karnataka/ | grep -E "\.obj|\.graph"
```

### **2. Performance Optimization**

#### **A. Database Optimization**

```sql
-- Add indexes for better performance
CREATE INDEX idx_trek_events_distance ON trek_events(distance);
CREATE INDEX idx_trek_events_start_datetime ON trek_events(start_datetime);
CREATE INDEX idx_trek_registrations_user_trek ON trek_registrations(user_id, trek_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM trek_events WHERE distance > 10;

-- Update statistics
ANALYZE trek_events;
```

#### **B. Docker Optimization**

```yaml
# Optimized docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine # Smaller image
    environment:
      POSTGRES_DB: into_the_wild
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: node:18-alpine # Smaller base image
    working_dir: /app
    volumes:
      - ./backend:/app
    command: npm start
```

## 📚 Reference Commands

### **Supabase CLI**

```bash
# Project management
npx supabase init
npx supabase start
npx supabase stop
npx supabase status

# Database operations
npx supabase db status
npx supabase db push
npx supabase db reset
npx supabase db diff --file migration_name

# Type generation
npx supabase gen types typescript --local > types.ts

# Deployment
npx supabase link --project-ref your-project-id
npx supabase secrets set KEY=value
```

### **Docker Commands**

```bash
# Container management
docker-compose up -d
docker-compose down
docker-compose restart
docker-compose build --no-cache

# Database operations
docker exec -it into-the-wild-postgres psql -U postgres -d into_the_wild
docker exec into-the-wild-postgres pg_dump -U postgres -d into_the_wild > backup.sql
docker exec -i into-the-wild-postgres psql -U postgres -d into_the_wild < backup.sql

# Logs and monitoring
docker-compose logs -f
docker-compose ps
docker stats
```

## 🎯 **Best Practices Summary**

### **✅ Do's**

1. **Use Supabase CLI** for schema management (cleaner than manual SQL)
2. **Keep Docker** for backend and additional services
3. **Use Supabase Studio** for database operations and visualization
4. **Combine both approaches**: Supabase for schema, Docker for full-stack
5. **Version control migrations** and document changes
6. **Test migrations** on development before production
7. **Use environment-specific configs** (.env.local, .env.production)

### **❌ Don'ts**

1. **Don't mix auth schemas** - use either Supabase auth or custom auth
2. **Don't commit sensitive data** - use environment variables and secrets
3. **Don't skip backups** before major migrations
4. **Don't use root user** for application connections
5. **Don't ignore RLS policies** - implement proper access controls

## 🔄 **Migration from Current Setup**

Since your project already has:

- ✅ Docker containers running
- ✅ Database schema applied
- ✅ Backend working

**Next Steps:**

1. **Fix OTP service** with proper data files and configuration
2. **Document current setup** in this guide
3. **Add comprehensive environment configuration**
4. **Set up proper migration workflow**
5. **Configure production deployment**

This guide provides a complete reference for managing your Docker + Supabase development environment efficiently! 🚀

## 📁 **Project Structure**

```
into-the-wild/
├── docs/
│   ├── DOCKER_SUPABASE_BEST_PRACTICES.md  # This file
│   ├── README.md                          # Project overview
│   └── UI_UX_DESIGN_SYSTEM_MASTER.md      # Design system
├── supabase/
│   ├── migrations/                        # Database migrations
│   └── functions/                         # Edge functions
├── backend/
│   ├── src/                               # Backend source code
│   └── Dockerfile                         # Backend container
├── otp/
│   └── graphs/karnataka/                  # OpenTripPlanner data
└── docker-compose.yml                     # Docker services
```
