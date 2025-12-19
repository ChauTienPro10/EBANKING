FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY authService.jar app.jar
EXPOSE 8000 9000
ENTRYPOINT ["java", "-jar", "app.jar"]