#!/bin/bash
set -e

echo
echo "=== STARTING REACT APP BUILD ==="
echo

# Navigate to ebanking-fe directory
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/../FRONTEND/ebanking-fe"

if [ ! -d "$(pwd)" ]; then
    echo "Cannot navigate to ebanking-fe directory."
    exit 1
fi

# Proceed with build
if [ -f package.json ]; then
    echo "Running npm install..."
    npm install
    
    if [ $? -le 1 ]; then
        echo "npm install successful"
        npm run build
    else
        echo "npm install failed with error code $?"
        exit 1
    fi
else
    echo "ERROR: package.json not found in ebanking-fe"
    exit 1
fi

echo "FRONTEND BUILD SUCCESSFUL."
echo

# Return to root directory
cd "$SCRIPT_DIR/.."

# Create docker network
docker network create ebanking-network 2>/dev/null || echo "Network already exists"

# Check docker-compose.yml
if [ ! -f docker-compose.yml ]; then
    echo "ERROR: docker-compose.yml not found"
    exit 1
fi

echo "Starting Docker Compose..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Error running docker-compose."
    exit 1
fi

echo "Docker Compose started successfully."