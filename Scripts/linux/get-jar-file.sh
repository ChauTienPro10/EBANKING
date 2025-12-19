#!/bin/bash
set -e

# Output directory path
OUTPUT_DIR="../docker-build-services"

# Create output directory if it doesn't exist
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
fi

# Clean up existing jar files in output directory
echo "Cleaning up $OUTPUT_DIR..."
rm -f "$OUTPUT_DIR"/*.jar

# Copy jar files from Docker container to host output directory
echo "Copying authService.jar..."
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/authService.jar "$OUTPUT_DIR/authService.jar"

echo "Copying userService.jar..."
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/userService.jar "$OUTPUT_DIR/userService.jar"

echo "Copying emailService.jar..."
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/emailService.jar "$OUTPUT_DIR/emailService.jar"

echo "Copying transactionService.jar..."
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/transactionService.jar "$OUTPUT_DIR/transactionService.jar"

echo "Copying firebaseService.jar..."
docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/firebaseService.jar "$OUTPUT_DIR/firebaseService.jar"

# Uncomment if needed
# echo "Copying AIService.jar..."
# docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/AIService.jar "$OUTPUT_DIR/AIService.jar"

if [ $? -eq 0 ]; then
    echo "All files copied successfully."
else
    echo "Failed to copy one or more files from Docker container."
    exit 1
fi