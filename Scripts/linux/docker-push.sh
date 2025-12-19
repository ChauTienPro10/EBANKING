#!/bin/bash
set -e

# Check if version parameter is provided
if [ $# -eq 0 ]; then
    echo "VERSION not provided. Example: ./docker-push.sh 1.0"
    exit 1
fi

VERSION="$1"
DOCKER_USER="tien22012003"

# Service list
SERVICES="authservice userservice emailservice firebaseservice transactionservice"

echo "================================="
echo "🔹 Docker Login"
echo "================================="
docker login

for service in $SERVICES; do
    echo "================================="
    echo "🔹 Pushing service: $service with tag $VERSION"
    echo "================================="
    
    docker push "$DOCKER_USER/$service:$VERSION"
    
    if [ $? -ne 0 ]; then
        echo "Push failed for $service"
        exit 1
    else
        echo "Push success for $service"
    fi
done

echo "================================="
echo "All images pushed successfully with tag $VERSION!"
echo "================================="