#!/bin/bash

# Sri Geetha Dairy - Multi-Portal Startup Script
# This script starts all 3 portals + backend in the correct sequence

set -e

RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'

echo -e "${BOLD}${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Sri Geetha Dairy - Multi-Portal System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RESET}"

# Colors for output
print_section() {
    echo -e "${BOLD}${BLUE}→ $1${RESET}"
}

print_success() {
    echo -e "${GREEN}✓ $1${RESET}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${RESET}"
}

print_error() {
    echo -e "${RED}✗ $1${RESET}"
}

# Check prerequisites
print_section "Checking Prerequisites..."

# Check MongoDB
if ! lsof -i :27017 &>/dev/null; then
    print_warning "MongoDB not running on port 27017"
    print_section "Starting MongoDB..."
    mkdir -p /opt/homebrew/var/mongodb
    mongod --dbpath /opt/homebrew/var/mongodb &
    MONGO_PID=$!
    sleep 2
    if lsof -i :27017 &>/dev/null; then
        print_success "MongoDB started (PID: $MONGO_PID)"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
else
    print_success "MongoDB is running on port 27017"
fi

# Check Node.js
if ! command -v node &>/dev/null; then
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi
print_success "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &>/dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_success "npm found: $(npm --version)"

# Kill any existing processes on needed ports
print_section "Cleaning up old processes..."
for port in 3001 3002 3003 6011; do
    if lsof -i :$port &>/dev/null; then
        print_warning "Port $port is in use, attempting to free it..."
        lsof -i :$port -t | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done
print_success "Ports cleared"

# Start Backend
print_section "Starting Backend Server (Port 6011)..."
cd backend
npm start &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:6011/api/health &>/dev/null; then
    print_success "Backend running on http://localhost:6011 (PID: $BACKEND_PID)"
    echo "   API Health: $(curl -s http://localhost:6011/api/health | jq -r '.status')"
else
    print_error "Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

cd ..

# Start Portals
print_section "Starting Frontend Portals..."

# Customer Portal
echo -e "${BLUE}Starting Customer Portal on Port 3001...${RESET}"
npm run dev:customer &
CUSTOMER_PID=$!
print_success "Customer Portal started (PID: $CUSTOMER_PID) - http://localhost:3001"

# Admin Portal  
sleep 2
echo -e "${BLUE}Starting Admin Portal on Port 3002...${RESET}"
npm run dev:admin &
ADMIN_PID=$!
print_success "Admin Portal started (PID: $ADMIN_PID) - http://localhost:3002"

# Delivery Portal
sleep 2
echo -e "${BLUE}Starting Delivery Portal on Port 3003...${RESET}"
npm run dev:delivery &
DELIVERY_PID=$!
print_success "Delivery Portal started (PID: $DELIVERY_PID) - http://localhost:3003"

echo -e "${BOLD}${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ALL SERVICES RUNNING SUCCESSFULLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RESET}"

echo -e "${BOLD}📱 Access the Portals:${RESET}"
echo -e "  ${BLUE}Customer Portal:${RESET}   http://localhost:3001"
echo -e "  ${BLUE}Admin Portal:${RESET}      http://localhost:3002"
echo -e "  ${BLUE}Delivery Portal:${RESET}   http://localhost:3003"
echo -e "  ${BLUE}Backend API:${RESET}       http://localhost:6011/api"

echo -e "\n${BOLD}📊 Process Information:${RESET}"
echo -e "  Backend (PID: $BACKEND_PID)"
echo -e "  Customer (PID: $CUSTOMER_PID)"
echo -e "  Admin (PID: $ADMIN_PID)"
echo -e "  Delivery (PID: $DELIVERY_PID)"

echo -e "\n${BOLD}🧑‍💼 Test Accounts:${RESET}"
echo -e "  ${YELLOW}Customer:${RESET} customer@test.com / password123"
echo -e "  ${YELLOW}Admin:${RESET}    admin@test.com / password123"
echo -e "  ${YELLOW}Delivery:${RESET}  delivery@test.com / password123"

echo -e "\n${BOLD}🛑 To Stop All Services:${RESET}"
echo -e "  Press ${YELLOW}Ctrl+C${RESET} in this terminal"
echo -e "  Or run: ${YELLOW}killall node npm${RESET}"

echo -e "\n${BOLD}📝 Documentation:${RESET}"
echo -e "  Quick Start: ${BLUE}RUN_ALL_PORTALS.md${RESET}"
echo -e "  System Status: ${BLUE}SYSTEM_LIVE.md${RESET}"

echo -e "\n${BOLD}${GREEN}System is ready! Enjoy your dairy management system! 🎉${RESET}\n"

# Wait for all processes
wait $BACKEND_PID $CUSTOMER_PID $ADMIN_PID $DELIVERY_PID
