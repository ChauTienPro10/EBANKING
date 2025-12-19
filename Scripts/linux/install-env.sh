#!/bin/bash
set -e

echo
echo "=== CHECKING NODE.JS ==="
echo

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed."
    echo "Installing Node.js LTS version via NodeSource..."
    
    # Install Node.js via NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "Node.js installed successfully."
else
    echo "Node.js is already installed."
    node -v
fi

echo
# Check npx availability
if ! command -v npx &> /dev/null; then
    echo "ERROR: npx is not available. Please ensure Node.js and npm are properly installed."
    exit 1
else
    echo "npx is available."
fi

# Docker check
echo
echo "=== CHECKING DOCKER ==="
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed."
    echo "Installing Docker..."
    
    # Update package index
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up stable repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "Docker installed. Please log out and log back in for group changes to take effect."
else
    echo "Docker is installed:"
    docker -v
fi

# Check docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing docker-compose..."
    sudo apt-get install -y docker-compose
fi

# Create docker network
echo "Creating ebanking-network..."
docker network create ebanking-network 2>/dev/null || echo "Network already exists"

# Start Docker Compose in ./DB
echo
echo "=== STARTING DOCKER COMPOSE IN ./DB ==="
cd "$(dirname "$0")/../DB"
if [ -f docker-compose.yml ]; then
    docker-compose up -d
    echo "Docker mysql containers started."
else
    echo "ERROR: docker-compose.yml not found in DB"
    exit 1
fi

# Start Jenkins
echo
echo "=== STARTING DOCKER COMPOSE IN ./JENKINS ==="
cd "$(dirname "$0")/../JENSKINS"
if [ -f docker-compose.yml ]; then
    docker-compose up -d
    echo "Docker jenkins container started."
else
    echo "ERROR: docker-compose.yml not found in JENSKINS"
    exit 1
fi

echo
echo "=== INSTALLING JAVA 17 INSIDE JENKINS CONTAINER ==="
# Install Java 17 in container (Debian/Ubuntu base)
docker exec -it jenkins bash -c "apt-get update && apt-get install -y openjdk-17-jdk && java -version"

echo
echo "=== INSTALLING MAVEN ==="
docker exec -it jenkins bash -c "apt-get update && apt-get install -y maven && mvn -version"
echo "=== DONE ==="

# Start Redis
echo
echo "=== STARTING DOCKER COMPOSE IN ./REDIS ==="
cd "$(dirname "$0")/../REDIS"
if [ -f docker-compose.yml ]; then
    docker-compose up -d
    echo "Docker redis containers started."
else
    echo "ERROR: docker-compose.yml not found in REDIS"
    exit 1
fi

# Start Kafka
echo
echo "=== STARTING DOCKER COMPOSE IN ./KAFKA ==="
cd "$(dirname "$0")/../KAFKA"
if [ -f docker-compose.yml ]; then
    docker-compose up -d
    echo "Docker kafka containers started."
else
    echo "ERROR: docker-compose.yml not found in KAFKA"
    exit 1
fi

echo
echo "=== INSTALLATION COMPLETE ==="