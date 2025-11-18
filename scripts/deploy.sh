#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Live Poll Bot...${NC}"
echo ""

# Change to project root directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found!${NC}"
  echo -e "${YELLOW}Please create a .env file with required environment variables.${NC}"
  echo -e "${YELLOW}You can use .env.example as a template.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running!${NC}"
  echo -e "${YELLOW}Please start Docker and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Stop existing containers if requested
if [ "$1" = "--restart" ]; then
  echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
  docker-compose -f docker/docker-compose.prod.yml down
  echo -e "${GREEN}✓ Containers stopped${NC}"
  echo ""
fi

# Build images
echo -e "${BLUE}📦 Building Docker images...${NC}"
docker-compose -f docker/docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to build Docker images${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# Start database first
echo -e "${BLUE}🗄️  Starting database...${NC}"
docker-compose -f docker/docker-compose.prod.yml up -d postgres

# Wait for database to be healthy
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker-compose -f docker/docker-compose.prod.yml exec -T postgres pg_isready -U ${POSTGRES_USER:-app} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is ready${NC}"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Database failed to become ready${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}  Waiting... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
  sleep 2
done

echo ""

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
docker-compose -f docker/docker-compose.prod.yml run --rm api-service sh -c "npm install node-pg-migrate ts-node && npm run migrate"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Database migrations failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Start all services
echo -e "${BLUE}🎬 Starting all services...${NC}"
docker-compose -f docker/docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to start services${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All services started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

echo ""

# Check service health
echo -e "${BLUE}✅ Checking service health...${NC}"

# Check API service
if curl -f http://localhost:${NGINX_PORT:-80}/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API Service is healthy${NC}"
else
  echo -e "${RED}✗ API Service is not responding${NC}"
fi

# Check Realtime service (through nginx)
if curl -f http://localhost:${NGINX_PORT:-80}/realtime/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Realtime Service is healthy${NC}"
else
  echo -e "${RED}✗ Realtime Service is not responding${NC}"
fi

# Check Poll App
if curl -f http://localhost:${NGINX_PORT:-80}/ > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Poll App is healthy${NC}"
else
  echo -e "${RED}✗ Poll App is not responding${NC}"
fi

# Check Admin App
if curl -f http://localhost:${NGINX_PORT:-80}/admin/ > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Admin App is healthy${NC}"
else
  echo -e "${RED}✗ Admin App is not responding${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker/docker-compose.prod.yml ps
echo ""
echo -e "${BLUE}📝 Access your application:${NC}"
echo -e "  Poll App:  ${GREEN}http://localhost:${NGINX_PORT:-80}${NC}"
echo -e "  Admin App: ${GREEN}http://localhost:${NGINX_PORT:-80}/admin${NC}"
echo -e "  API:       ${GREEN}http://localhost:${NGINX_PORT:-80}/api${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs:         ${YELLOW}docker-compose -f docker/docker-compose.prod.yml logs -f${NC}"
echo -e "  Stop services:     ${YELLOW}docker-compose -f docker/docker-compose.prod.yml down${NC}"
echo -e "  Restart services:  ${YELLOW}./scripts/deploy.sh --restart${NC}"
echo ""

