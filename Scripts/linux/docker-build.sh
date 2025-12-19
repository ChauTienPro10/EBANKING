#!/bin/bash
set -e

# === Config ===
DOCKER_USERNAME="tien22012003"
TAG="1.1"

# === Build all services in ../docker-build-services
for service_dir in ../docker-build-services/*/; do
    if [ -f "$service_dir/Dockerfile" ]; then
        SERVICE_NAME=$(basename "$service_dir")
        
        # Convert SERVICE_NAME to lowercase
        SERVICE_NAME_LOWER=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')
        
        echo
        echo "================================"
        echo "Building service: $SERVICE_NAME_LOWER"
        echo "================================"
        
        docker build -t "$DOCKER_USERNAME/$SERVICE_NAME_LOWER:$TAG" "$service_dir"
        
        if [ $? -ne 0 ]; then
            echo "❌ Build failed for $SERVICE_NAME_LOWER"
            exit 1
        fi
        
        echo "✅ Built image: $DOCKER_USERNAME/$SERVICE_NAME_LOWER:$TAG"
    fi
done

echo
echo "🎉 All services built successfully!"