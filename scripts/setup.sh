#!/bin/bash

# Bash setup script for SmartLab HMI Controller
# Run this script from the project root directory

echo "========================================"
echo "  SmartLab HMI Controller Setup Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "  ${GREEN}Node.js: ${NODE_VERSION}${NC}"

# Check npm
NPM_VERSION=$(npm --version)
echo -e "  ${GREEN}npm: ${NPM_VERSION}${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "  ${YELLOW}WARNING: PostgreSQL CLI not found. Make sure PostgreSQL is installed and running.${NC}"
else
    PG_VERSION=$(psql --version)
    echo -e "  ${GREEN}PostgreSQL: ${PG_VERSION}${NC}"
fi

# Check Java (for Android)
if ! command -v java &> /dev/null; then
    echo -e "  ${YELLOW}WARNING: Java not found. Required for Android development.${NC}"
else
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "  ${GREEN}Java: ${JAVA_VERSION}${NC}"
fi

echo ""
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "  ${GREEN}Backend dependencies installed!${NC}"

echo ""
echo -e "${YELLOW}Installing mobile dependencies...${NC}"
cd ../mobile
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install mobile dependencies${NC}"
    exit 1
fi
echo -e "  ${GREEN}Mobile dependencies installed!${NC}"

cd ..

echo ""
echo "========================================"
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Configure PostgreSQL database:"
echo "     - Create database: CREATE DATABASE smartlab_hmi;"
echo "     - Update backend/.env with your database credentials"
echo ""
echo "  2. Run database migrations:"
echo "     cd backend && npm run migrate"
echo ""
echo "  3. Start the backend server:"
echo "     cd backend && npm run dev"
echo ""
echo "  4. Start the mobile app:"
echo "     cd mobile && npx react-native run-android"
echo ""
echo "  5. (Optional) Run device simulator:"
echo "     cd backend && npm run simulator"
echo ""
