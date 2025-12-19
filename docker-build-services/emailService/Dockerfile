FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY emailService.jar app.jar
EXPOSE 8002 9002
ENTRYPOINT ["java", "-jar", "app.jar"]