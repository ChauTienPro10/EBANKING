# Linux Shell Scripts for EBANKING Project

This directory contains Linux shell script equivalents of the Windows CMD scripts.

## Setup Instructions

After copying these scripts to your Linux/Ubuntu environment, make them executable:

```bash
chmod +x *.sh
```

## Scripts Description

### install-env.sh
- Installs Node.js LTS version
- Installs Docker and Docker Compose
- Sets up all required services (MySQL, Jenkins, Redis, Kafka)
- Installs Java 17 and Maven in Jenkins container

### build-final.sh
- Builds the React frontend application
- Creates Docker network
- Starts the application using Docker Compose

### get-jar-file.sh
- Copies JAR files from Jenkins container to local directory
- Equivalent to the Windows get-jar-file.cmd

### docker-build.sh
- Builds Docker images for all services
- Tags images with specified version

### docker-push.sh
- Pushes Docker images to registry
- Usage: `./docker-push.sh <version>`

### run-jar-file.sh
- Runs the authService JAR file
- Checks if JAR file exists before execution

### port-forward.sh
- Sets up port forwarding for auth-service using minikube

## Prerequisites

- Ubuntu/Debian Linux system
- Internet connection for package downloads
- Sudo privileges for Docker installation

## Usage

1. Make scripts executable: `chmod +x *.sh`
2. Run install-env.sh first: `./install-env.sh`
3. Use other scripts as needed for your development workflow