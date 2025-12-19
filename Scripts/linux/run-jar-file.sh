#!/bin/bash

# Path to jar file
AUTH_JAR_PATH="../JarFileOutput/authService.jar"

# Check if jar file exists
if [ ! -f "$AUTH_JAR_PATH" ]; then
    echo "File $AUTH_JAR_PATH does not exist!"
    exit 1
fi

# Run authService jar file
echo "Running jar file: $AUTH_JAR_PATH"
java -jar "$AUTH_JAR_PATH"